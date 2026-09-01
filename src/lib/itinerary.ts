import { METROS, Venue } from '../data/metros';
import { TYPE_PROFILES } from '../data/personality';
import { QUARANTINED_VENUES, isQuarantined } from '../data/venueLinkStatus';

// URL-level index of everything quarantined, so a link can be judged even when
// the caller doesn't have the metro key to hand.
const QUARANTINED_URLS = new Set(
  Object.values(QUARANTINED_VENUES).map((q) => q.url.trim().toLowerCase()),
);

function isQuarantinedUrl(url: string): boolean {
  return QUARANTINED_URLS.has((url || '').trim().toLowerCase());
}

/** Always-works fallback: a maps search for the venue by name and address. */
export function directionsUrl(v: Venue): string {
  const q = [v.name, v.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

const METRO_LOGISTICS: Record<string, string> = {
  'washington-dc': 'Every stop is minutes apart around Clarendon and Courthouse, so park once and walk. If a stop needs a reservation, lock it in at least a day ahead.',
  'new-york': 'These stops are a short cab or subway ride apart across Manhattan, so plan your transitions and skip driving. Lock in any reservations at least a day ahead.',
};
export function metroLogistics(key: string): string {
  return METRO_LOGISTICS[key] || 'Your stops are a short rideshare apart — line up a car between them and lock in any reservations at least a day ahead.';
}

const BUDGET_RANK: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
function budgetRank(b: string): number {
  return BUDGET_RANK[b] !== undefined ? BUDGET_RANK[b] : 2;
}

export function venuesByType(metroKey: string, type: Venue['type']): Venue[] {
  const m = METROS[metroKey] || METROS['washington-dc'];
  return (m.venues || []).filter((v) => v && v.type === type);
}

export interface Reservation {
  type: 'walkin' | 'link' | 'directions';
  label: string;
  url?: string;
  /** Present when the venue's own site failed validation. */
  degraded?: boolean;
}

/**
 * What to show for a venue's booking action.
 *
 * A venue whose website failed validation never gets a "Website" button — we
 * send the customer to map directions and their phone instead. A dead button
 * in a paid itinerary reads as carelessness; directions plus a phone number
 * still gets them through the door.
 *
 * `metroKey` is optional so existing callers keep working; without it we still
 * catch quarantined venues by URL.
 */
export function venueReservation(v: Venue, metroKey?: string): Reservation {
  const url = (v.linkUrl || '').trim();
  const quarantined =
    isQuarantinedUrl(url) || (metroKey ? isQuarantined(metroKey, v.name) : false);

  if (quarantined) {
    return { type: 'directions', label: 'Get directions', url: directionsUrl(v), degraded: true };
  }
  if (!url || /example\.com/i.test(url)) {
    return { type: 'walkin', label: 'Walk-in, no reservation needed' };
  }
  const lt = (v.linkText || 'Website').trim();
  const label = /^(OpenTable|Resy|Tock)$/i.test(lt) ? `Reserve on ${lt}` : lt;
  return { type: 'link', label, url };
}

/** Venues of a type whose links pass validation. */
export function healthyVenuesByType(metroKey: string, type: Venue['type']): Venue[] {
  return venuesByType(metroKey, type).filter(
    (v) => !isQuarantined(metroKey, v.name) && !isQuarantinedUrl(v.linkUrl),
  );
}

export interface ItineraryStop {
  label: string;
  venue: Venue;
}

export interface Itinerary {
  typeCode: string;
  typeName: string;
  typeBlurb: string;
  stops: ItineraryStop[];
  coachTips: string[];
  logistics: string;
}

const STOP_TYPES: Venue['type'][] = ['drinks', 'dinner', 'dessert'];
const STOP_LABELS = ['Stop 1 // Arrival & Drinks', 'Stop 2 // The Main Event', 'Stop 3 // The Nightcap'];

// Picks the closest-budget-match venue from a metro's pool for each stop type,
// optionally excluding a previous pick (used by the re-roll button).
function pickVenue(metroKey: string, type: Venue['type'], budget: string, exclude?: string): Venue {
  const all = venuesByType(metroKey, type);
  // Never recommend a venue whose link is known broken. If quarantine would
  // empty the pool entirely, fall back to the full list rather than returning
  // nothing — venueReservation still degrades the dead link to directions.
  const vetted = all.filter((v) => !isQuarantined(metroKey, v.name) && !isQuarantinedUrl(v.linkUrl));
  const pool = vetted.length > 0 ? vetted : all;
  if (pool.length === 0) return venuesByType('washington-dc', type)[0];
  const targetRank = budgetRank(budget);
  const sorted = [...pool].sort((a, b) => Math.abs(budgetRank(a.budget) - targetRank) - Math.abs(budgetRank(b.budget) - targetRank));
  const candidates = exclude ? sorted.filter((v) => v.name !== exclude) : sorted;
  const pickFrom = candidates.length > 0 ? candidates : sorted;
  // Prefer a close budget match, but rotate among the top few so re-rolls feel different.
  const topBand = pickFrom.filter((v) => Math.abs(budgetRank(v.budget) - targetRank) <= 1);
  const finalPool = topBand.length > 0 ? topBand : pickFrom;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function generateItinerary(metroKey: string, budget: string, typeCode: string): Itinerary {
  const profile = TYPE_PROFILES[typeCode] || { name: 'The Thoughtful Planner', blurb: 'A considerate, adaptable date planner who reads the room well.' };
  const stops: ItineraryStop[] = STOP_TYPES.map((type, i) => ({
    label: STOP_LABELS[i],
    venue: pickVenue(metroKey, type, budget),
  }));
  return {
    typeCode,
    typeName: profile.name,
    typeBlurb: profile.blurb,
    stops,
    coachTips: buildCoachTips(typeCode),
    logistics: metroLogistics(metroKey),
  };
}

export function rerollStop(itinerary: Itinerary, stopIndex: number, metroKey: string, budget: string): Itinerary {
  const type = STOP_TYPES[stopIndex];
  const current = itinerary.stops[stopIndex].venue.name;
  const newVenue = pickVenue(metroKey, type, budget, current);
  const newStops = [...itinerary.stops];
  newStops[stopIndex] = { ...newStops[stopIndex], venue: newVenue };
  return { ...itinerary, stops: newStops };
}

function buildCoachTips(typeCode: string): string[] {
  const tips = [
    'Confirm your reservation the morning of — busy spots move fast on weekends.',
    'Arrive 5-10 minutes early so you\'re not rushing between stops.',
    'Keep your phone away during the main event — presence reads as confidence.',
  ];
  if (typeCode.includes('S')) tips.push('She thrives around people — don\'t rush past the social stop.');
  if (typeCode.includes('I')) tips.push('Keep the group small tonight — this type wants your full attention, not a scene.');
  if (typeCode.includes('T')) tips.push('Mention that this spot is new or trending — she\'ll clock that you paid attention.');
  if (typeCode.includes('C')) tips.push('Lean into the classic, tried-and-true choice — she\'ll appreciate the reliability.');
  return tips;
}
