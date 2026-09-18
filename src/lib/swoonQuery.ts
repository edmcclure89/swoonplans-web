import type { SwoonScores, Vibe, Pace, Energy } from '../data/swoonType';

// Reads ?v=&p=&e= from the URL so a shared results link opens straight to
// someone's Swoon Type results instead of the quiz. Lives in its own tiny
// module (type-only imports) so App.tsx can call it without pulling the
// whole Swoon Type flow, and Supabase with it, into the homepage bundle.
export function readScoresFromQuery(): SwoonScores | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v') as Vibe | null;
  const p = params.get('p') as Pace | null;
  const e = params.get('e') as Energy | null;
  if (!v || !p || !e) return null;
  return { vibe: v, pace: p, energy: e };
}
