export interface PhotoItem {
id: string;
title: string;
category: 'evening' | 'destination' | 'bw' | 'intimate' | 'film';
src: string;
location: string;
date: string;
experienceType: string;
aspectRatio: 'square' | 'portrait' | 'landscape' | 'wide';
caption?: string;
quote?: string;
quoteAuthor?: string;
}

export interface StoryItem {
id: string;
slug: string;
title: string;
couple: string;
location: string;
date: string;
coverImage: string;
intro: string;
photos: PhotoItem[];
}

export type HeroPathway = 'swoonHer' | 'selfCare' | 'kidPlans';

export interface HeroReview {
  rating: number;
  name: string;
}

export interface HeroSlide {
  id: string;
  headline: string;
  subheadline: string;
  title: string;
  location: string;
  date: string;
  image: string;
  /** Which flow the slide's Begin button opens. */
  pathway: HeroPathway;
  /** Short name for the pathway selector under the hero. */
  label: string;
  /** Accent colour that identifies this pathway. */
  accent: string;
  /**
   * CSS object-position for the photo. Defaults to centre when omitted.
   */
  focal?: string;
  /**
   * Set for portrait sources. On wide screens the photo is pinned right at its
   * natural aspect with a blurred copy of itself behind, so the subject clears
   * the copy column instead of being cropped into.
   */
  portraitSource?: boolean;
  /**
   * Only real, attributable reviews belong here. Slides without one simply
   * render no review bar rather than showing an invented endorsement.
   */
  review?: HeroReview;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    headline: 'Look like a genius without lifting a finger.',
    subheadline: 'No guesswork. Curated venues, exact addresses, and one-tap reservations.',
    title: 'Skyline Terrace Rendezvous',
    location: 'Rooftop Garden Lounge',
    date: 'GOLDEN HOUR',
    image: '/images/date_african_american_couple_1785457444161.jpg',
    focal: 'center 40%',
    pathway: 'swoonHer',
    label: 'Swoon Her',
    accent: '#D5C29F',
    review: { rating: 5, name: 'Marcus T.' },
  },
  {
    id: 'hero-2',
    headline: 'Reclaim your time. Reward your soul.',
    subheadline: 'Zero mental load. Curated solo itineraries built entirely around your vibe.',
    title: 'Solo Self Care Afternoon',
    location: 'Neighborhood Cafe',
    date: 'ANY DAY',
    image: '/images/happy-solo-date.webp',
    pathway: 'selfCare',
    label: 'Self Care',
    accent: '#E08B6F',
    review: { rating: 5, name: 'Alex' },
  },
  {
    id: 'hero-3',
    headline: 'Be the cool parent. Skip the planning panic.',
    subheadline: 'Custom family plans that remove the guesswork from weekends.',
    title: 'Weekend Family Adventure',
    location: 'Your City',
    date: 'ALL AGES',
    image: '/images/kids-birthday-party-hug.webp',
    focal: '85% 40%',
    pathway: 'kidPlans',
    label: 'Kid Plan',
    accent: '#5FD068',
    review: { rating: 5, name: 'Shawn' },
  },
];

export const PORTFOLIO_PHOTOS: PhotoItem[] = [
{
id: 'p1',
title: 'Rooftop Terrace Dinner',
category: 'evening',
src: '/images/date_african_american_couple_1785457444161.jpg',
location: 'Skyline Garden Lounge',
date: 'OCTOBER',
experienceType: 'VIP Candlelit Terrace',
aspectRatio: 'wide',
caption: 'Radiant laughter over sunset wine under warm ambient lights.',
quote: 'Her girlfriend group text is full of jealous BFFs now.',
quoteAuthor: 'Marcus T., New York'
},
{
id: 'p2',
title: 'Sunset Beach Champagne',
category: 'destination',
src: '/images/date_asian_couple_1785457457487.jpg',
location: 'Private Ocean Cove',
date: 'AUGUST',
experienceType: 'Coastal Sunset Picnic',
aspectRatio: 'landscape',
caption: 'Sipping champagne with ocean air and golden hour sunlight.',
quote: "I took her to the ocean cove date Swoon Plans curated. She hasn't stopped talking about it for weeks.",
quoteAuthor: 'Kenji M., Los Angeles'
},
{
id: 'p3',
title: 'Waterfront Stroll Embrace',
category: 'intimate',
src: '/images/date_mixed_race_couple1_1785457469307.jpg',
location: 'Harbor Promenade',
date: 'SEPTEMBER',
experienceType: 'Sunset Harbor Walk',
aspectRatio: 'portrait',
caption: 'Turning with an affectionate smile on an evening stroll.',
quote: 'Zero stress, 100% credit. The harbor walk itinerary was absolute poetry.',
quoteAuthor: 'Jordan S., Miami'
}
];

export const FEATURED_STORIES: StoryItem[] = [
{
id: 'story-1',
slug: 'skyline-terrace-dinner',
title: 'Skyline Terrace Date Night',
couple: 'Marcus & Nia',
location: 'Rooftop Garden Lounge',
date: 'Autumn Rendezvous',
coverImage: '/images/date_african_american_couple_1785457444161.jpg',
intro: 'An effortless evening of fine dining, ambient lights, and genuine laughter high above the city.',
photos: [
PORTFOLIO_PHOTOS[0],
PORTFOLIO_PHOTOS[2],
PORTFOLIO_PHOTOS[1]
]
},
{
id: 'story-2',
slug: 'sunset-beach-getaway',
title: 'Sunset Coastal Picnic',
couple: 'Kenji & Mei',
location: 'Private Ocean Cove',
date: 'Summer Evening',
coverImage: '/images/date_asian_couple_1785457457487.jpg',
intro: 'Chilling artisan sparkling wine as waves roll in, completely immersed in each other.',
photos: [
PORTFOLIO_PHOTOS[1],
PORTFOLIO_PHOTOS[2],
PORTFOLIO_PHOTOS[0]
]
},
{
id: 'story-3',
slug: 'waterfront-promenade-date',
title: 'Waterfront Sunset Stroll',
couple: 'Jordan & Sofia',
location: 'Harbor Promenade',
date: 'Golden Hour Date',
coverImage: '/images/date_mixed_race_couple1_1785457469307.jpg',
intro: 'Candid smiles, gentle sea breezes, and unscripted romantic magic.',
photos: [
PORTFOLIO_PHOTOS[2],
PORTFOLIO_PHOTOS[0],
PORTFOLIO_PHOTOS[1]
]
}
];
