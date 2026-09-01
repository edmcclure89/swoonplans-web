// Venue link quarantine + a record of venues removed for being closed.
//
// Re-audit with: npm run audit:links -- --browser
// Regenerate the quarantine block with: npm run audit:links -- --browser --write
//
// Background: Terence flagged that 2 of 3 links in a live customer itinerary
// were dead. Auditing all 159 links found 13 broken across 8 metros. Chasing
// each one down turned up something more important than the links:
//
//   - 7 venues were fine, their domain had just moved. Those URLs are fixed
//     in metros.ts, so they are NOT quarantined.
//   - 2 venues are open but have no website at all. Their linkUrl is now
//     empty, which renders as "Walk-in, no reservation needed".
//   - 3 venues were PERMANENTLY CLOSED and have been deleted from metros.ts.
//     We were sending paying customers to bars that no longer exist.
//   - 1 could not be confirmed either way and stays quarantined below.
//
// So a broken link is a symptom, not the diagnosis. When the audit flags a
// venue, check whether the business is still open before assuming it just
// needs a new URL.

export interface QuarantinedVenue {
  verdict: 'dead' | 'placeholder' | 'unverified';
  reason: string;
  url: string;
}

/**
 * Venues excluded from recommendations. Keyed by `${metroKey}::${venueName}`.
 * `pickVenue` skips these; `venueReservation` degrades them to directions.
 */
export const QUARANTINED_VENUES: Record<string, QuarantinedVenue> = {
  "atlanta::Himitsu": {
    verdict: "unverified",
    reason: "himitsuatl.com no longer resolves and no current official site could be found; listings are stale (newest reviews Mar 2024) but no closure was reported either. Holding it out until someone confirms it is still trading.",
    url: "https://www.himitsuatl.com/",
  },
};

/**
 * Venues removed from metros.ts because the business is permanently closed.
 * Kept here so nobody re-adds them from an old list or a stale aggregator.
 */
export const CLOSED_VENUES: Record<string, { closed: string; evidence: string }> = {
  "washington-dc::Columbia Room": {
    closed: "2022",
    evidence: "Washingtonian reported the permanent closure; Yelp listing is marked CLOSED.",
  },
  "chicago::Lost Lake": {
    closed: "2022",
    evidence: "Block Club Chicago reported the closing (Jan 2022); Difford's Guide marks it permanently closed.",
  },
  "atlanta::Regent Cocktail Club": {
    closed: "unknown",
    evidence: "Yelp listing marked CLOSED; former site theregentatl.com returns 404.",
  },
};

export function quarantineKey(metroKey: string, venueName: string): string {
  return `${metroKey}::${venueName}`;
}

export function isQuarantined(metroKey: string, venueName: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUARANTINED_VENUES, quarantineKey(metroKey, venueName));
}

export function quarantineReason(metroKey: string, venueName: string): string | undefined {
  return QUARANTINED_VENUES[quarantineKey(metroKey, venueName)]?.reason;
}
