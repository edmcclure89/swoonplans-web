import React, { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { QUESTIONS, scoreAnswers } from '../data/swoonType';

interface SwoonTypeQuizProps {
  onComplete: (answers: Record<string, string>) => void;
  onClose: () => void;
}

export const SwoonTypeQuiz: React.FC<SwoonTypeQuizProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const question = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const choose = (optionId: string) => {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      setTimeout(() => onComplete(next), 300);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1816] text-[#FAF8F5] flex flex-col">
      <div className="flex items-center justify-between px-6 sm:px-12 py-6">
        <button
          onClick={goBack}
          className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-sans ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-[#B89860] hover:text-[#FAF8F5]'} transition-colors`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377]">
          {step + 1} / {QUESTIONS.length}
        </span>
        <button onClick={onClose} className="text-[#8C8377] hover:text-[#FAF8F5] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="h-[2px] bg-white/10 mx-6 sm:mx-12 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#B89860] transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 max-w-2xl mx-auto text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#B89860] font-bold mb-6">
          Discover Your Swoon Type
        </span>
        <h2 className="text-2xl sm:text-4xl font-serif italic font-light leading-snug mb-10">
          {question.prompt}
        </h2>

        <div className="w-full space-y-3">
          {question.options.map((opt) => {
            const selected = answers[question.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => choose(opt.id)}
                className={`w-full text-left px-6 py-5 rounded-xl border font-sans text-base sm:text-lg transition-all ${
                  selected
                    ? 'border-[#B89860] bg-[#B89860]/10 text-[#FAF8F5]'
                    : 'border-white/15 hover:border-[#B89860]/60 hover:bg-white/5 text-[#E8E2D9]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
