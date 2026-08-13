import React from 'react';
import { Zap, ArrowRight, Check } from 'lucide-react';

// Landing page shown after a successful Founders Pass checkout. Stripe's
// success_url points here (/welcome). It is intentionally a self-contained
// confirmation screen with a single path back into the app.
export const WelcomePage: React.FC = () => {
  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816] flex items-center justify-center px-4">
      <main className="max-w-lg w-full text-center space-y-8 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Founders Pass Active</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-serif italic font-light text-balance">
            You&apos;re in.
          </h1>
          <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed text-pretty">
            Your Founders Pass is confirmed. You have full access for the next three months, ready whenever you are.
          </p>
        </div>

        <ul className="space-y-3 text-left inline-flex flex-col mx-auto font-sans text-xs text-[#524B43] leading-relaxed">
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#D5C29F] shrink-0 mt-0.5" />
            <span>Up to 3 saved date profiles</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#D5C29F] shrink-0 mt-0.5" />
            <span>Curated venues with exact addresses</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#D5C29F] shrink-0 mt-0.5" />
            <span>One-tap reservations, ready when you are</span>
          </li>
        </ul>

        <button
          onClick={goHome}
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-all shadow-lg cursor-pointer hover:scale-[1.02]"
        >
          Plan her next night
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>
    </div>
  );
};
