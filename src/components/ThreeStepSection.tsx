import React from 'react';

interface ThreeStepSectionProps {
  onOpenInquire: () => void;
}

const STEPS = [
  {
    n: '1',
    label: 'TELL US ABOUT HER',
    sub: 'Tap through quick questions. No typing.',
    img: '/images/step-1_1.jpg',
  },
  {
    n: '2',
    label: 'THE COMPLETE ITINERARY',
    sub: 'Real venues, addresses, and instant booking.',
    img: '/images/step-2_1.jpg',
  },
  {
    n: '3',
    label: 'BOOK IT',
    sub: "One tap to book. You're the hero.",
    img: '/images/step-3.jpg',
  },
];

const HEADLINE_LINES = [
  { n: '1', line: 'Give us their traits.' },
  { n: '2', line: 'We send custom plan.' },
  { n: '3', line: 'You take the credit.' },
];

export const ThreeStepSection: React.FC<ThreeStepSectionProps> = ({ onOpenInquire }) => {
  return (
    <section className="w-full bg-[#FAF8F5] pt-8 pb-14 sm:pt-12 sm:pb-20 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16 items-center">

        <div className="bg-[#F2EDE4] rounded-xl p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col">
                <div className="text-center">
                  <div className="font-serif text-3xl sm:text-5xl text-[#D5C29F] leading-none">
                    {s.n}
                  </div>
                  <h3 className="mt-1.5 sm:mt-2 text-[10px] sm:text-sm font-bold font-sans tracking-[0.08em] text-[#1A2B4A] leading-tight">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-[9px] sm:text-xs font-sans text-[#5A6472] leading-snug min-h-[2.2em] sm:min-h-[2.6em]">
                    {s.sub}
                  </p>
                </div>
                <div className="mt-2 sm:mt-3 rounded-lg overflow-hidden bg-[#1A1816] aspect-[7/5]">
                  <img
                    src={s.img}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif italic font-light text-[1.625rem] min-[360px]:text-[1.875rem] sm:text-[2.5rem] lg:text-[2rem] xl:text-[2.5rem] text-[#1A1816] leading-[1.3]">
            {HEADLINE_LINES.map(({ n, line }) => (
              <span key={n} className="flex items-baseline gap-2.5 whitespace-nowrap">
                <span className="font-serif not-italic text-[0.6em] leading-none text-[#1A1816]">
                  {n}
                </span>
                <span>{line}</span>
              </span>
            ))}
          </h2>
          <button
            onClick={onOpenInquire}
            className="mt-7 inline-flex items-center gap-2 px-8 py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-all cursor-pointer shadow-lg shadow-[#D5C29F]/20"
          >
            Start now
          </button>
          <p className="text-xs text-[#8C8377] font-sans mt-3">First plan free.</p>
        </div>

      </div>
    </section>
  );
};
