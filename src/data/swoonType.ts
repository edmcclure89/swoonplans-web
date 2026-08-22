export type Vibe = 'playful' | 'romantic' | 'intense';
export type Pace = 'spontaneous' | 'slowburn' | 'deliberate';
export type Energy = 'social' | 'intimate' | 'solo';

export interface SwoonScores {
  vibe: Vibe;
  pace: Pace;
  energy: Energy;
}

interface QuizOption {
  id: string;
  label: string;
  value: Vibe | Pace | Energy;
}

interface QuizQuestion {
  id: string;
  axis: 'vibe' | 'pace' | 'energy';
  prompt: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    axis: 'vibe',
    prompt: 'A surprise evening opens up. Your gut reaction?',
    options: [
      { id: 'a', label: 'Let\u2019s make it fun, no rules', value: 'playful' },
      { id: 'b', label: 'Something that feels like a movie moment', value: 'romantic' },
      { id: 'c', label: 'I want it to mean something, not just fill time', value: 'intense' },
    ],
  },
  {
    id: 'q2',
    axis: 'pace',
    prompt: 'Which describes the last time you felt truly relaxed?',
    options: [
      { id: 'a', label: 'Something unplanned that just happened', value: 'spontaneous' },
      { id: 'b', label: 'A night that unfolded slowly, no rush', value: 'slowburn' },
      { id: 'c', label: 'A plan I knew was already taken care of', value: 'deliberate' },
    ],
  },
  {
    id: 'q3',
    axis: 'energy',
    prompt: 'When someone\u2019s trying to impress you, what actually lands?',
    options: [
      { id: 'a', label: 'Bringing energy into a room full of people', value: 'social' },
      { id: 'b', label: 'Making me feel like the only person in the room', value: 'intimate' },
      { id: 'c', label: 'Respecting that I might just want quiet that day', value: 'solo' },
    ],
  },
  {
    id: 'q4',
    axis: 'vibe',
    prompt: 'Your ideal Sunday morning, no obligations.',
    options: [
      { id: 'a', label: 'Something silly and light with someone I love', value: 'playful' },
      { id: 'b', label: 'Slow coffee, soft light, no phones', value: 'romantic' },
      { id: 'c', label: 'A real conversation that goes somewhere', value: 'intense' },
    ],
  },
  {
    id: 'q5',
    axis: 'pace',
    prompt: 'When plans change last minute, you feel...',
    options: [
      { id: 'a', label: 'Honestly kind of excited', value: 'spontaneous' },
      { id: 'b', label: 'Fine, as long as the night still breathes', value: 'slowburn' },
      { id: 'c', label: 'A little thrown, I like knowing what to expect', value: 'deliberate' },
    ],
  },
  {
    id: 'q6',
    axis: 'energy',
    prompt: 'Your energy after a big social night?',
    options: [
      { id: 'a', label: 'Buzzing, I could keep going', value: 'social' },
      { id: 'b', label: 'Good, but I needed the quiet moments in it', value: 'intimate' },
      { id: 'c', label: 'Drained, I need a day to myself after', value: 'solo' },
    ],
  },
  {
    id: 'q7',
    axis: 'vibe',
    prompt: 'What makes you feel most \u201cseen\u201d by a partner?',
    options: [
      { id: 'a', label: 'They tease me the way only they can', value: 'playful' },
      { id: 'b', label: 'They notice the small details and remember them', value: 'romantic' },
      { id: 'c', label: 'They go deep with me, not just small talk', value: 'intense' },
    ],
  },
  {
    id: 'q8',
    axis: 'pace',
    prompt: 'A gift that would genuinely move you.',
    options: [
      { id: 'a', label: 'Something spur-of-the-moment and unexpected', value: 'spontaneous' },
      { id: 'b', label: 'An entire evening they clearly put thought into', value: 'slowburn' },
      { id: 'c', label: 'Something planned around what I actually said I wanted', value: 'deliberate' },
    ],
  },
  {
    id: 'q9',
    axis: 'energy',
    prompt: 'The compliment that means the most.',
    options: [
      { id: 'a', label: '\u201cYou lit up that whole room\u201d', value: 'social' },
      { id: 'b', label: '\u201cI feel like I really know you\u201d', value: 'intimate' },
      { id: 'c', label: '\u201cI love that you know how to just be still\u201d', value: 'solo' },
    ],
  },
  {
    id: 'q10',
    axis: 'vibe',
    prompt: 'Your idea of real intimacy.',
    options: [
      { id: 'a', label: 'Laughing until it hurts, no pressure', value: 'playful' },
      { id: 'b', label: 'A slow evening with no agenda but each other', value: 'romantic' },
      { id: 'c', label: 'Saying the hard things out loud', value: 'intense' },
    ],
  },
  {
    id: 'q11',
    axis: 'pace',
    prompt: 'What you need after a hard week.',
    options: [
      { id: 'a', label: 'Something spontaneous to shake the week off', value: 'spontaneous' },
      { id: 'b', label: 'A long, unhurried night that lets me exhale', value: 'slowburn' },
      { id: 'c', label: 'A plan already made so I don\u2019t have to think', value: 'deliberate' },
    ],
  },
  {
    id: 'q12',
    axis: 'energy',
    prompt: 'If someone got this one thing right, you\u2019d know they paid attention.',
    options: [
      { id: 'a', label: 'They included the people I love', value: 'social' },
      { id: 'b', label: 'They carved out real one-on-one time', value: 'intimate' },
      { id: 'c', label: 'They gave me room to just recharge', value: 'solo' },
    ],
  },
];

// --- Type naming --------------------------------------------------------

const TYPE_NAMES: Record<string, string> = {
  'playful-spontaneous-social': 'The Spark',
  'playful-spontaneous-intimate': 'The Firefly',
  'playful-spontaneous-solo': 'The Wildcard',
  'playful-slowburn-social': 'The Sunbeam',
  'playful-slowburn-intimate': 'The Confidant',
  'playful-slowburn-solo': 'The Daydreamer',
  'playful-deliberate-social': 'The Ringleader',
  'playful-deliberate-intimate': 'The Tease',
  'playful-deliberate-solo': 'The Free Spirit',
  'romantic-spontaneous-social': 'The Muse',
  'romantic-spontaneous-intimate': 'The Whirlwind',
  'romantic-spontaneous-solo': 'The Wanderer',
  'romantic-slowburn-social': 'The Warm Light',
  'romantic-slowburn-intimate': 'The Quiet Flame',
  'romantic-slowburn-solo': 'The Dreamer',
  'romantic-deliberate-social': 'The Curator',
  'romantic-deliberate-intimate': 'The Devoted',
  'romantic-deliberate-solo': 'The Poet',
  'intense-spontaneous-social': 'The Magnet',
  'intense-spontaneous-intimate': 'The Storm',
  'intense-spontaneous-solo': 'The Live Wire',
  'intense-slowburn-social': 'The Smolder',
  'intense-slowburn-intimate': 'The Undertow',
  'intense-slowburn-solo': 'The Still Water',
  'intense-deliberate-social': 'The Commander',
  'intense-deliberate-intimate': 'The Anchor',
  'intense-deliberate-solo': 'The Sovereign',
};

export function getTypeName(scores: SwoonScores): string {
  const key = `${scores.vibe}-${scores.pace}-${scores.energy}`;
  return TYPE_NAMES[key] ?? 'The Original';
}

// --- Scoring -------------------------------------------------------------

export function scoreAnswers(answers: Record<string, string>): SwoonScores {
  const tally = { vibe: {} as Record<string, number>, pace: {} as Record<string, number>, energy: {} as Record<string, number> };

  for (const q of QUESTIONS) {
    const chosenOptionId = answers[q.id];
    if (!chosenOptionId) continue;
    const opt = q.options.find((o) => o.id === chosenOptionId);
    if (!opt) continue;
    tally[q.axis][opt.value] = (tally[q.axis][opt.value] ?? 0) + 1;
  }

  const pickTop = (bucket: Record<string, number>, fallback: string) => {
    let best = fallback;
    let bestCount = -1;
    for (const [value, count] of Object.entries(bucket)) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  };

  return {
    vibe: pickTop(tally.vibe, 'romantic') as Vibe,
    pace: pickTop(tally.pace, 'slowburn') as Pace,
    energy: pickTop(tally.energy, 'intimate') as Energy,
  };
}

// --- Axis-level content blocks (combined at render time) ----------------

interface AxisCopy {
  dos: string[];
  donts: string[];
  dateIdeas: string[];
}

export const VIBE_COPY: Record<Vibe, AxisCopy> = {
  playful: {
    dos: ['Keep things light and funny', 'Tease her, don\u2019t just compliment her'],
    donts: ['Overplan every minute', 'Take yourself too seriously'],
    dateIdeas: ['Trivia night with a side bet', 'Arcade bar'],
  },
  romantic: {
    dos: ['Set the scene, lighting and music matter', 'Write things down, don\u2019t just say them'],
    donts: ['Treat romance like a checklist', 'Rush the moment'],
    dateIdeas: ['Candlelit dinner with a view', 'Sunset walk, no phones'],
  },
  intense: {
    dos: ['Go deep in conversation, skip small talk', 'Match her energy, don\u2019t dim it'],
    donts: ['Keep things surface-level', 'Play it too safe'],
    dateIdeas: ['Something adrenaline-adjacent', 'A late-night deep-talk spot'],
  },
};

export const PACE_COPY: Record<Pace, AxisCopy> = {
  spontaneous: {
    dos: ['Text her same-day sometimes'],
    donts: ['Lock in every detail weeks out'],
    dateIdeas: ['Last-minute reservation'],
  },
  slowburn: {
    dos: ['Let the night unfold over hours, not minutes'],
    donts: ['Cram too much into one outing'],
    dateIdeas: ['A multi-stop evening, dinner into a nightcap'],
  },
  deliberate: {
    dos: ['Show her you thought it through'],
    donts: ['Wing it and hope it works'],
    dateIdeas: ['A reservation-only, well-reviewed spot'],
  },
};

export const ENERGY_COPY: Record<Energy, AxisCopy> = {
  social: {
    dos: ['Include her friends sometimes'],
    donts: ['Isolate her from her circle'],
    dateIdeas: ['A lively bar or event, double date'],
  },
  intimate: {
    dos: ['Prioritize real one-on-one time'],
    donts: ['Default to group settings when she needs quiet'],
    dateIdeas: ['A quiet dinner for two, no distractions'],
  },
  solo: {
    dos: ['Respect her need for solo time, don\u2019t take it personally'],
    donts: ['Overschedule her social calendar'],
    dateIdeas: ['A calm, low-key outing, or let her recharge first'],
  },
};

export function buildCheatSheet(scores: SwoonScores) {
  const v = VIBE_COPY[scores.vibe];
  const p = PACE_COPY[scores.pace];
  const e = ENERGY_COPY[scores.energy];

  return {
    dos: [...v.dos, ...p.dos, ...e.dos].slice(0, 4),
    donts: [...v.donts, ...p.donts, ...e.donts].slice(0, 4),
    dateIdeas: [...v.dateIdeas, ...p.dateIdeas, ...e.dateIdeas].slice(0, 4),
  };
}

// --- Solo track content ---------------------------------------------------

export const SOLO_CATEGORIES: Record<Energy, { title: string; blurb: string }> = {
  social: {
    title: 'Solo, But Make It a Scene',
    blurb: 'You recharge around people, even alone. Curated solo experiences in rooms with energy: a bar with a view, a class full of strangers, a table for one at a place made for being seen.',
  },
  intimate: {
    title: 'Solo, Quiet & Unhurried',
    blurb: 'A day built entirely around you, no performance required: a long spa afternoon, a slow solo dinner, a museum morning with nowhere else to be.',
  },
  solo: {
    title: 'Solo, Deep Recharge',
    blurb: 'Real restoration, not another obligation dressed up as self-care: a full reset day, low stimulation, low noise, entirely on your terms.',
  },
};
