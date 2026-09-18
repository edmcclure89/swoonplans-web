import React, { useState } from 'react';
import { SwoonTypeQuiz } from './SwoonTypeQuiz';
import { SwoonTypeResults } from './SwoonTypeResults';
import { scoreAnswers, SwoonScores } from '../data/swoonType';
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
    // supabase.rpc() returns a PromiseLike, not a real Promise, so it has no
    // .catch. The two-argument then swallows failures the same way: this is
    // fire-and-forget analytics and must never break the quiz.
    .then(() => {}, () => {});
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

// Kept as a re-export so existing imports keep working.
export { readScoresFromQuery } from '../lib/swoonQuery';
