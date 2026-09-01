import React, { useState } from 'react';
import { SwoonTypeQuiz } from './SwoonTypeQuiz';
import { SwoonTypeResults } from './SwoonTypeResults';
import { scoreAnswers, SwoonScores, Vibe, Pace, Energy } from '../data/swoonType';
import { supabase } from '../lib/supabase';

interface SwoonTypeFlowProps {
  onClose: () => void;
  initialScores?: SwoonScores | null;
}

// Fire-and-forget analytics logging. Never blocks the UI and never surfaces
// errors to the user; a failed log shouldn't interrupt someone's quiz.
function logSwoonEvent(eventType: string, scores: SwoonScores | null, track?: string) {
  supabase
    .rpc('log_swoon_event', {
      p_event_type: eventType,
      p_vibe: scores?.vibe ?? null,
      p_pace: scores?.pace ?? null,
      p_energy: scores?.energy ?? null,
      p_track: track ?? null,
    })
    .then(() => {})
    .catch(() => {});
}

export const SwoonTypeFlow: React.FC<SwoonTypeFlowProps> = ({ onClose, initialScores = null }) => {
  const [scores, setScores] = useState<SwoonScores | null>(initialScores);

  if (!scores) {
    return (
      <SwoonTypeQuiz
        onClose={onClose}
        onComplete={(answers) => {
          const computed = scoreAnswers(answers);
          logSwoonEvent('quiz_completed', computed);
          setScores(computed);
        }}
      />
    );
  }

  return (
    <SwoonTypeResults
      scores={scores}
      onRetake={() => setScores(null)}
      onTrackChange={(track) => logSwoonEvent('track_viewed', scores, track)}
      onShare={() => logSwoonEvent('share_clicked', scores)}
    />
  );
};

// Reads ?v=&p=&e= from the URL so a shared results link opens straight to
// someone's Swoon Type results instead of the quiz.
export function readScoresFromQuery(): SwoonScores | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get('v') as Vibe | null;
  const p = params.get('p') as Pace | null;
  const e = params.get('e') as Energy | null;
  if (!v || !p || !e) return null;
  return { vibe: v, pace: p, energy: e };
}
