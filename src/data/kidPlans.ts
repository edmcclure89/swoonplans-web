// Kid Plans: a 12-question read on a kid's personality and interests,
// used to recommend activities/experiences that make a parent look
// unusually tuned-in. No real venue data is claimed here (unlike the
// adult date engine) — recommendations are honest activity categories,
// not fabricated specific businesses.

export interface KidOption {
  key: string;
  label: string;
  emoji?: string;
  desc?: string;
  tags: Partial<Record<KidTag, number>>;
}

export interface KidQuestion {
  id: string;
  title: string;
  subtitle?: string;
  options: KidOption[];
}

export type KidTag =
  | 'ADVENTURER'
  | 'MAKER'
  | 'PERFORMER'
  | 'FANDOM'
  | 'CONNECTOR'
  | 'GAMER'
  | 'NATURE';

export interface AgeBand {
  key: string;
  label: string;
  emoji: string;
  range: string;
}

export const AGE_BANDS: AgeBand[] = [
  { key: 'baby', label: 'Baby / Toddler', emoji: '🍼', range: '0–2' },
  { key: 'little', label: 'Little Kid', emoji: '🧸', range: '3–6' },
  { key: 'big', label: 'Big Kid', emoji: '🎒', range: '7–10' },
  { key: 'tween', label: 'Tween', emoji: '🎧', range: '11–13' },
  { key: 'teen', label: 'Teen', emoji: '🎮', range: '14–18' },
];

export const KID_QUESTIONS: KidQuestion[] = [
  {
    id: 'fandom',
    title: "What's currently living rent-free in their brain?",
    subtitle: 'The obsession that comes up in every conversation.',
    options: [
      { key: 'anime', label: 'Naruto / anime & manga', emoji: '🍥', tags: { FANDOM: 3 } },
      { key: 'pokemon', label: 'Pokémon / Pikachu', emoji: '⚡', tags: { FANDOM: 3, GAMER: 1 } },
      { key: 'superheroes', label: 'X-Men / Marvel / superheroes', emoji: '🦸', tags: { FANDOM: 3, ADVENTURER: 1 } },
      { key: 'popstar', label: 'Taylor Swift / a pop star', emoji: '🎤', tags: { FANDOM: 3, PERFORMER: 1 } },
      { key: 'other', label: 'Something else entirely', emoji: '✨', tags: { FANDOM: 1 } },
    ],
  },
  {
    id: 'outside',
    title: 'Given a free afternoon, where do they end up?',
    options: [
      { key: 'outside', label: 'Outside, moving, probably dirty', emoji: '🌳', tags: { ADVENTURER: 2, NATURE: 1 } },
      { key: 'inside-making', label: 'Inside, building or making something', emoji: '🏠', tags: { MAKER: 2 } },
      { key: 'inside-screen', label: 'Inside, on a screen', emoji: '📱', tags: { GAMER: 2 } },
      { key: 'both', label: 'Genuinely could go either way', emoji: '🔀', tags: { ADVENTURER: 1, MAKER: 1 } },
    ],
  },
  {
    id: 'making',
    title: 'How do they feel about building or crafting things?',
    options: [
      { key: 'sell', label: 'Loves making things — and wants to sell them', emoji: '🏷️', tags: { MAKER: 3, CONNECTOR: 1 } },
      { key: 'make-fun', label: 'Loves making things just for fun', emoji: '🎨', tags: { MAKER: 2 } },
      { key: 'not-really', label: 'Not really their thing', emoji: '🤷', tags: {} },
    ],
  },
  {
    id: 'friends',
    title: 'Their friend situation is best described as...',
    options: [
      { key: 'ton-of-friends', label: 'A ton of friends, always social', emoji: '👯', tags: { CONNECTOR: 3 } },
      { key: 'small-crew', label: 'One small, tight-knit crew', emoji: '🤝', tags: { CONNECTOR: 1 } },
      { key: 'avatar-friends', label: 'Mostly friends from games/online ("avatar friends")', emoji: '🎮', tags: { GAMER: 3 } },
      { key: 'solo', label: 'Happiest solo or with adults', emoji: '📖', tags: { MAKER: 1 } },
    ],
  },
  {
    id: 'screens',
    title: 'When they do get screen time, what are they doing?',
    options: [
      { key: 'gaming', label: 'Gaming', emoji: '🕹️', tags: { GAMER: 2 } },
      { key: 'watching', label: 'Watching / streaming shows', emoji: '📺', tags: { FANDOM: 1 } },
      { key: 'social', label: 'Social media / messaging friends', emoji: '💬', tags: { CONNECTOR: 1 } },
      { key: 'barely-any', label: 'Barely any screen time at all', emoji: '🌤️', tags: { NATURE: 1, ADVENTURER: 1 } },
    ],
  },
  {
    id: 'energy',
    title: "What's their energy level like?",
    options: [
      { key: 'burn-energy', label: 'Needs to move and burn energy, always', emoji: '⚡', tags: { ADVENTURER: 2 } },
      { key: 'focused', label: 'Happiest sitting and focusing on one thing', emoji: '🧩', tags: { MAKER: 1, GAMER: 1 } },
      { key: 'mix', label: 'A mix, depends on the day', emoji: '🌗', tags: { ADVENTURER: 1, MAKER: 1 } },
    ],
  },
  {
    id: 'performance',
    title: 'How do they feel about being on a stage?',
    options: [
      { key: 'loves-performing', label: 'Loves singing, dancing, or performing', emoji: '🎭', tags: { PERFORMER: 3 } },
      { key: 'loves-watching', label: 'Loves watching, not performing', emoji: '🍿', tags: { FANDOM: 1 } },
      { key: 'not-into-it', label: 'Not really into it', emoji: '🙅', tags: {} },
    ],
  },
  {
    id: 'animals',
    title: 'Where do they land on animals and nature?',
    options: [
      { key: 'obsessed-animals', label: 'Obsessed with animals', emoji: '🐾', tags: { NATURE: 3 } },
      { key: 'loves-nature', label: 'Loves nature and science stuff', emoji: '🔬', tags: { NATURE: 2 } },
      { key: 'not-particularly', label: 'Not particularly', emoji: '➖', tags: {} },
    ],
  },
  {
    id: 'competitive',
    title: 'How competitive are they?',
    options: [
      { key: 'loves-competing', label: 'Loves competing and winning', emoji: '🏆', tags: { ADVENTURER: 2, CONNECTOR: 1 } },
      { key: 'cooperative', label: 'Prefers cooperative, low-pressure stuff', emoji: '🕊️', tags: { MAKER: 1, CONNECTOR: 1 } },
      { key: 'in-between', label: 'Somewhere in between', emoji: '⚖️', tags: { ADVENTURER: 1, MAKER: 1 } },
    ],
  },
  {
    id: 'novelty',
    title: 'New experience or old favorite?',
    options: [
      { key: 'always-new', label: 'Always wants something new', emoji: '🆕', tags: { ADVENTURER: 1, FANDOM: 1 } },
      { key: 'loves-routine', label: 'Loves repeating their favorites', emoji: '🔁', tags: { MAKER: 1 } },
      { key: 'mix-novelty', label: 'A mix of both', emoji: '🔀', tags: {} },
    ],
  },
  {
    id: 'group-size',
    title: 'For a special outing, they would want...',
    options: [
      { key: 'big-group', label: 'A big group of friends along', emoji: '🎉', tags: { CONNECTOR: 3 } },
      { key: 'one-friend', label: 'Just one best friend', emoji: '🧍‍🤝‍🧍', tags: { CONNECTOR: 1 } },
      { key: 'family-only', label: 'Just family, no friends needed', emoji: '👨‍👩‍👧', tags: { MAKER: 1 } },
    ],
  },
  {
    id: 'budget',
    title: "What's the budget for this plan?",
    options: [
      { key: '$', label: '$ — Keep it low-key', emoji: '💵', tags: {} },
      { key: '$$', label: '$$ — Comfortable', emoji: '💳', tags: {} },
      { key: '$$$', label: '$$$ — Go all out', emoji: '💎', tags: {} },
    ],
  },
];

export interface KidTypeProfile {
  name: string;
  emoji: string;
  blurb: string;
  recommendations: { title: string; blurb: string }[];
  flexLine: (fandomLabel: string) => string;
}

const KID_TYPES: Record<KidTag, KidTypeProfile> = {
  ADVENTURER: {
    name: 'The Trailblazer',
    emoji: '🏔️',
    blurb: 'High-energy, always in motion, and happiest with a little bit of danger and a clear goal to chase.',
    recommendations: [
      { title: 'Obstacle course or ninja-warrior-style gym session', blurb: 'Built-in goals, built-in bragging rights.' },
      { title: 'A scavenger hunt or escape room themed around their favorite world', blurb: 'Turns their obsession into a mission.' },
      { title: 'A hike or bike outing with a "trailblazer badge" reward at the end', blurb: 'Movement plus a finish-line moment.' },
    ],
    flexLine: () => 'I know you like to move, so I found something that actually keeps up with you.',
  },
  MAKER: {
    name: 'The Builder',
    emoji: '🛠️',
    blurb: 'Happiest with their hands busy — building, crafting, and turning ideas into actual things.',
    recommendations: [
      { title: 'A hands-on maker workshop (pottery, woodworking, or a slime/craft lab)', blurb: 'Age-appropriate versions exist for nearly every skill level.' },
      { title: '"Start your own shop" afternoon — make and price things to sell at a mini pop-up', blurb: 'Speaks directly to a kid who wants to make and sell.' },
      { title: 'A building/robotics class (LEGO, circuits, or similar)', blurb: 'Structured creation with a real result to show off.' },
    ],
    flexLine: () => "I remembered you like making things, not just having things — so this one's hands-on.",
  },
  PERFORMER: {
    name: 'The Spotlight Kid',
    emoji: '🎤',
    blurb: 'Lights up around a stage, a mic, or an audience — performing is the point, not a bonus.',
    recommendations: [
      { title: 'A trial class in dance, theater, or music', blurb: 'Low commitment, high payoff if it clicks.' },
      { title: 'A kids\' karaoke night or open mic', blurb: 'Actual stage time, actual applause.' },
      { title: "Tickets to a live show tied to what they're into", blurb: 'Seeing it live hits differently than a screen.' },
    ],
    flexLine: (fandom) => `I know you'd rather be on stage than in the crowd, so I built this around that${fandom ? ` — and your ${fandom} thing` : ''}.`,
  },
  FANDOM: {
    name: 'The Superfan',
    emoji: '⭐',
    blurb: 'Deep in the lore, knows every detail, and lives for anything that lets them go further into the world they love.',
    recommendations: [
      { title: 'A comic con, anime expo, or themed pop-up experience near you', blurb: 'Their people, their world, all in one room.' },
      { title: 'A themed meetup or trading day (Pokémon, cards, cosplay) built around their fandom', blurb: 'Turns a solo obsession into a shared one.' },
      { title: 'A surprise tied specifically to their current favorite', blurb: 'Specificity is what makes it land.' },
    ],
    flexLine: (fandom) => `I actually paid attention to the ${fandom || 'thing you love'} obsession — this one is built around it.`,
  },
  CONNECTOR: {
    name: 'The Social Butterfly',
    emoji: '🦋',
    blurb: 'Thrives around people — the plan only really works if there\'s a crew involved.',
    recommendations: [
      { title: 'A group outing they can bring a couple friends to (bowling, trampoline park, mini golf)', blurb: 'The friends are the point, not a side effect.' },
      { title: 'A themed hangout or sleepover they get to plan themselves', blurb: 'Ownership makes it feel like a bigger deal.' },
      { title: 'A team sport or club tryout day', blurb: 'Structured social time with a built-in group.' },
    ],
    flexLine: () => "I know it's not really fun for you unless your friends are there, so I planned around that.",
  },
  GAMER: {
    name: 'The World Builder',
    emoji: '🎮',
    blurb: "Lives partly in digital worlds and the friendships there are just as real — this kid's community exists online first.",
    recommendations: [
      { title: 'A gaming lounge session or small LAN party with friends', blurb: 'Meets them in the world they already love.' },
      { title: 'A DIY tournament night at home with brackets, snacks, and a prize', blurb: 'Turns their normal into an event.' },
      { title: 'A game design, coding, or creator workshop', blurb: 'Channels the gaming interest into a new skill.' },
    ],
    flexLine: () => "I know your world isn't just the one outside the screen, so I planned for that one too.",
  },
  NATURE: {
    name: 'The Wild Explorer',
    emoji: '🦉',
    blurb: 'Animals, science, and the outdoors aren\'t a phase for this kid — it\'s the main interest.',
    recommendations: [
      { title: 'A zoo, aquarium, or nature center behind-the-scenes tour', blurb: 'Gets past the glass and into the real thing.' },
      { title: 'A backyard camping night or stargazing outing', blurb: 'Low-cost, high-memory.' },
      { title: 'A wildlife rescue or shelter volunteer morning (age permitting)', blurb: 'Turns the interest into something real.' },
    ],
    flexLine: () => 'I know animals are basically the whole personality, so I built this one around that.',
  },
};

const TAG_PRIORITY: KidTag[] = ['FANDOM', 'PERFORMER', 'MAKER', 'NATURE', 'GAMER', 'CONNECTOR', 'ADVENTURER'];

export interface KidPlanResult {
  typeName: string;
  typeEmoji: string;
  typeBlurb: string;
  ageLabel: string;
  fandomLabel: string;
  recommendations: { title: string; blurb: string }[];
  flexLine: string;
  funFact: string;
}

const FANDOM_LABELS: Record<string, string> = {
  anime: 'anime',
  pokemon: 'Pokémon',
  superheroes: 'superhero',
  popstar: 'pop star',
  other: '',
};

const FUN_FACTS = [
  "Kids remember who showed up and paid attention far more than what was bought.",
  'A plan built around a specific interest reads as effort — and effort is what actually lands.',
  "The bar for 'my parent gets me' is lower than it feels. Specificity clears it easily.",
  'Novelty plus their existing obsession is the combination that tends to stick.',
];

export function buildKidPlan(ageKey: string, answers: Record<string, string>): KidPlanResult {
  const scores: Record<KidTag, number> = {
    ADVENTURER: 0,
    MAKER: 0,
    PERFORMER: 0,
    FANDOM: 0,
    CONNECTOR: 0,
    GAMER: 0,
    NATURE: 0,
  };

  for (const question of KID_QUESTIONS) {
    const chosenKey = answers[question.id];
    const chosen = question.options.find((o) => o.key === chosenKey);
    if (!chosen) continue;
    for (const [tag, value] of Object.entries(chosen.tags)) {
      scores[tag as KidTag] += value || 0;
    }
  }

  let bestTag: KidTag = TAG_PRIORITY[0];
  let bestScore = -1;
  for (const tag of TAG_PRIORITY) {
    if (scores[tag] > bestScore) {
      bestScore = scores[tag];
      bestTag = tag;
    }
  }

  const profile = KID_TYPES[bestTag];
  const ageBand = AGE_BANDS.find((a) => a.key === ageKey) || AGE_BANDS[2];
  const fandomKey = answers.fandom;
  const fandomLabel = FANDOM_LABELS[fandomKey] || '';
  const funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

  return {
    typeName: profile.name,
    typeEmoji: profile.emoji,
    typeBlurb: profile.blurb,
    ageLabel: `${ageBand.label} (${ageBand.range})`,
    fandomLabel,
    recommendations: profile.recommendations,
    flexLine: profile.flexLine(fandomLabel),
    funFact,
  };
}
