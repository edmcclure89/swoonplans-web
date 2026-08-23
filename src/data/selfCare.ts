import { METROS, Venue } from './metros';
import { venuesByType, venueReservation, metroLogistics, Itinerary, ItineraryStop } from '../lib/itinerary';

export interface SelfCareOption {
  key: string;
  label: string;
  emoji?: string;
  desc?: string;
}

export const METRO_OPTIONS: SelfCareOption[] = Object.keys(METROS).map((key) => ({
  key,
  label: METROS[key].name,
}));

export const BUDGET_OPTIONS: SelfCareOption[] = [
  { key: '$', label: '$ — Keep it low-key', emoji: '💵' },
  { key: '$$', label: '$$ — Comfortable treat', emoji: '💳' },
  { key: '$$$', label: '$$$ — Splurge a little', emoji: '💎' },
  { key: '$$$$', label: '$$$$ — Go all out', emoji: '✨' },
];

export const VIBE_OPTIONS: SelfCareOption[] = [
  { key: 'relaxing', label: 'Relaxing', emoji: '🧘‍♀️', desc: 'Slow down and unwind' },
  { key: 'social', label: 'Social', emoji: '🥂', desc: 'Out among people and energy' },
  { key: 'adventurous', label: 'Adventurous', emoji: '🌇', desc: 'Try something new' },
  { key: 'indulgent', label: 'Indulgent', emoji: '🍰', desc: 'Treat yourself, no limits' },
];

export const OCCASION_OPTIONS: SelfCareOption[] = [
  { key: 'just-because', label: 'Just because', emoji: '🌸' },
  { key: 'birthday', label: 'My birthday', emoji: '🎂' },
  { key: 'hard-week', label: 'Rough week, need this', emoji: '🕊️' },
  { key: 'milestone', label: 'Celebrating a milestone', emoji: '🥳' },
];

const VIBE_BLURBS: Record<string, string> = {
  relaxing: 'A slower-paced solo day built around comfort, quiet spaces, and treating yourself gently.',
  social: 'A lively solo outing that puts you around good energy, good people-watching, and good drinks.',
  adventurous: 'A solo day that pushes you toward something new — a spot you would not normally pick.',
  indulgent: 'A no-limits solo treat day — the good stuff, no splitting the bill, no compromise.',
};

const VIBE_TIPS: Record<string, string[]> = {
  relaxing: [
    'Leave your phone in your bag for at least one stop — this day is for you.',
    'Arrive a little early wherever you go so you are not rushing into rest.',
  ],
  social: [
    'Sit at the bar, not a corner table — it is the easiest way to strike up conversation.',
    'Bring a book or journal for any lull between stops so you never feel like you are just waiting around.',
  ],
  adventurous: [
    'Order the thing on the menu you have never tried before.',
    'Give yourself permission to change plans mid-day if something more interesting catches your eye.',
  ],
  indulgent: [
    'Skip the appetizer-splitting instinct — order what you actually want.',
    'Save the dessert stop for when you are genuinely hungry again, not just because it is next on the list.',
  ],
};

function pickSelfCareVenue(metroKey: string, type: Venue['type'], budget: string): Venue {
  const pool = venuesByType(metroKey, type);
  const fallback = venuesByType('washington-dc', type);
  const source = pool.length > 0 ? pool : fallback;
  const rank: Record<string, number> = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
  const target = rank[budget] !== undefined ? rank[budget] : 2;
  const sorted = [...source].sort(
    (a, b) => Math.abs((rank[a.budget] || 2) - target) - Math.abs((rank[b.budget] || 2) - target)
  );
  const topBand = sorted.filter((v) => Math.abs((rank[v.budget] || 2) - target) <= 1);
  const finalPool = topBand.length > 0 ? topBand : sorted;
  return finalPool[Math.floor(Math.random() * finalPool.length)] || source[0];
}

const SELF_CARE_STOP_TYPES: Venue['type'][] = ['drinks', 'dinner', 'dessert'];
const SELF_CARE_STOP_LABELS = ['Stop 1 // Ease In', 'Stop 2 // The Main Treat', 'Stop 3 // Sweet Finish'];

export function buildSelfCarePlan(metroKey: string, budget: string, vibe: string): Itinerary {
  const stops: ItineraryStop[] = SELF_CARE_STOP_TYPES.map((type, i) => ({
    label: SELF_CARE_STOP_LABELS[i],
    venue: pickSelfCareVenue(metroKey, type, budget),
  }));
  return {
    typeCode: vibe,
    typeName: (VIBE_OPTIONS.find((o) => o.key === vibe) || { label: 'Your Self Care Day' }).label,
    typeBlurb: VIBE_BLURBS[vibe] || 'A solo day built entirely around what you need right now.',
    stops,
    coachTips: VIBE_TIPS[vibe] || VIBE_TIPS.relaxing,
    logistics: metroLogistics(metroKey),
  };
}

export { venueReservation };
