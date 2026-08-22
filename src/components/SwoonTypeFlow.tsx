import React, { useState } from 'react';
import { SwoonTypeQuiz } from './SwoonTypeQuiz';
import { SwoonTypeResults } from './SwoonTypeResults';
import { scoreAnswers, SwoonScores, Vibe, Pace, Energy } from '../data/swoonType';

interface SwoonTypeFlowProps {
  onClose: () => void;
  initialScores?: SwoonScores | null;
}

export const SwoonTypeFlow: React.FC<SwoonTypeFlowProps> = ({ onClose, initialScores = null }) => {
  const [scores, setScores] = useState<SwoonScores | null>(initialScores);

  if (!scores) {
    return (
      <SwoonTypeQuiz
        onClose={onClose}
        onComplete={(answers) => setScores(scoreAnswers(answers))}
      />
    );
  }

  return <SwoonTypeResults scores={scores} onRetake={() => setScores(null)} />;
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
