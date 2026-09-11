import { KidTag } from './kidPlans';

// Real, verified family venues for the Kid Plans pathway.
//
// Same standard as the adult date engine in metros.ts: every entry below is a
// real business or institution with a name, street address, phone number and
// official website that were checked against the venue's own site or an
// authoritative listing. Nothing here is generated or approximated.
//
// A metro that has no entries here is NOT a bug. buildKidPlan falls back to the
// generic activity recommendations in kidPlans.ts for any metro we have not
// curated yet, so the flow never shows a parent a venue we cannot stand behind.
// To add a metro, add real verified venues under its metros.ts key.

export interface KidVenue {
  name: string;
  /** Street address as the venue publishes it. */
  address: string;
  /** Published main phone line. Empty string when the venue does not list one. */
  phone: string;
  /** Official site. Used for the "Plan your visit" link. */
  url: string;
  /** One line on what the place actually is. */
  blurb: string;
  /** Which kid archetypes this venue suits. */
  tags: KidTag[];
  /** AGE_BANDS keys this venue genuinely works for. */
  ages: string[];
  /** Rough cost per child. 'free' shows as Free. */
  cost: 'free' | '$' | '$$' | '$$$';
  /** True when the venue's main experience is indoors, so it survives rain. */
  indoor: boolean;
}

export const KID_VENUES: Record<string, KidVenue[]> = {
  'washington-dc': [
    {
      name: "Smithsonian's National Zoo",
      address: '3001 Connecticut Ave NW, Washington, DC 20008',
      phone: '(202) 633-4888',
      url: 'https://nationalzoo.si.edu/',
      blurb: 'Free 163-acre zoo in Rock Creek Park. Timed-entry passes are required, so reserve before you go.',
      tags: ['NATURE', 'ADVENTURER'],
      ages: ['baby', 'little', 'big', 'tween'],
      cost: 'free',
      indoor: false,
    },
    {
      name: 'Steven F. Udvar-Hazy Center',
      address: '14390 Air and Space Museum Pkwy, Chantilly, VA 20151',
      phone: '(703) 572-4118',
      url: 'https://airandspace.si.edu/visit/udvar-hazy-center',
      blurb: 'Two hangars of real aircraft and spacecraft, including Space Shuttle Discovery. Free entry, paid parking.',
      tags: ['ADVENTURER', 'FANDOM', 'MAKER'],
      ages: ['little', 'big', 'tween', 'teen'],
      cost: 'free',
      indoor: true,
    },
    {
      name: "National Children's Museum",
      address: '1300 Pennsylvania Ave NW, Washington, DC 20004',
      phone: '(202) 844-2486',
      url: 'https://nationalchildrensmuseum.org/',
      blurb: 'Hands-on STEAM exhibits built for under-12s. Closed Tuesdays, so check the day before you go.',
      tags: ['MAKER', 'GAMER', 'CONNECTOR'],
      ages: ['baby', 'little', 'big'],
      cost: '$$',
      indoor: true,
    },
    {
      name: "Port Discovery Children's Museum",
      address: '35 Market Pl, Baltimore, MD 21202',
      phone: '(410) 727-8120',
      url: 'https://www.portdiscovery.org/',
      blurb: 'Three floors of role-play exhibits plus the four-story SkyClimber. Best for ages 10 and under.',
      tags: ['MAKER', 'ADVENTURER', 'CONNECTOR'],
      ages: ['baby', 'little', 'big'],
      cost: '$$',
      indoor: true,
    },
    {
      name: "Wolf Trap Children's Theatre-in-the-Woods",
      address: '1551 Trap Rd, Vienna, VA 22182',
      phone: '(703) 255-1800',
      url: 'https://www.nps.gov/wotr/planyourvisit/titwactivities.htm',
      blurb: 'Outdoor kids theater in the only national park for the performing arts. Summer mornings only, so check the season.',
      tags: ['PERFORMER', 'NATURE'],
      ages: ['little', 'big'],
      cost: '$',
      indoor: false,
    },
    {
      name: 'Sportrock Climbing Centers Alexandria',
      address: '5308 Eisenhower Ave, Alexandria, VA 22304',
      phone: '(703) 212-7625',
      url: 'https://www.sportrock.com/alexandria',
      blurb: 'The region\'s biggest climbing gym, with bouldering, ropes, kids classes and day camps.',
      tags: ['ADVENTURER', 'CONNECTOR'],
      ages: ['big', 'tween', 'teen'],
      cost: '$$',
      indoor: true,
    },
    {
      name: 'Pinstripes Georgetown',
      address: '3222 M St NW, Washington, DC 20007',
      phone: '(202) 625-6500',
      url: 'https://www.pinstripes.com/georgetown',
      blurb: 'Bowling and bocce with a full bistro, so the group outing and the meal are the same stop.',
      tags: ['CONNECTOR', 'GAMER'],
      ages: ['big', 'tween', 'teen'],
      cost: '$$$',
      indoor: true,
    },
    {
      name: 'Museum of Illusions Washington DC',
      address: '927 H St NW, Washington, DC 20001',
      phone: '(202) 993-5992',
      url: 'https://moiwashington.com/',
      blurb: 'Fifty-plus hands-on optical illusions plus STEM and craft workshops. Under-12s need an adult with them.',
      tags: ['MAKER', 'GAMER', 'PERFORMER'],
      ages: ['little', 'big', 'tween', 'teen'],
      cost: '$$',
      indoor: true,
    },
  ],
};

/** Metros with curated venue data. Everything else falls back to generic ideas. */
export function hasKidVenues(metroKey: string): boolean {
  return (KID_VENUES[metroKey] || []).length > 0;
}

/**
 * Up to `limit` venues for a metro, ranked by archetype fit then age fit.
 * An indoor venue is always included when one is available, so a parent has a
 * rain option without us claiming a weather forecast we do not have.
 */
export function pickKidVenues(
  metroKey: string,
  tag: KidTag,
  ageKey: string,
  limit = 3,
): KidVenue[] {
  const pool = KID_VENUES[metroKey] || [];
  if (pool.length === 0) return [];

  const score = (v: KidVenue) =>
    (v.tags.includes(tag) ? 2 : 0) + (v.ages.includes(ageKey) ? 1 : 0);

  const ranked = [...pool]
    .filter((v) => v.ages.includes(ageKey))
    .sort((a, b) => score(b) - score(a));

  // If nothing matches the age band, do not stretch it — better to fall back to
  // generic ideas than to send a parent of a toddler to a teen climbing gym.
  if (ranked.length === 0) return [];

  const picked = ranked.slice(0, limit);
  if (!picked.some((v) => v.indoor)) {
    const indoor = ranked.find((v) => v.indoor);
    if (indoor) picked[picked.length - 1] = indoor;
  }
  return picked;
}

/** Always-works maps link for a venue. */
export function kidVenueDirections(v: KidVenue): string {
  const q = [v.name, v.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export const KID_COST_LABELS: Record<KidVenue['cost'], string> = {
  free: 'Free',
  $: 'Low cost',
  $$: 'Mid range',
  $$$: 'Pricier',
};
