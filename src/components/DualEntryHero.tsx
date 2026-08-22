import React from 'react';

interface DualEntryHeroProps {
  onChooseSwoonType: () => void;
  onChoosePlanDate: () => void;
}

export const DualEntryHero: React.FC<DualEntryHeroProps> = ({ onChooseSwoonType, onChoosePlanDate }) => {
  return (
    <section className="bg-[#FAF8F5] px-6 sm:px-12 py-16 sm:py-24 text-center">
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#8C8377] font-bold">
        Swoon Plans
      </span>
      <h1 className="text-3xl sm:text-5xl font-serif italic font-light text-[#1A1816] mt-4 mb-6 max-w-3xl mx-auto leading-tight">
        Every great date starts with being understood.
      </h1>
      <p className="font-sans text-[#38332E] max-w-xl mx-auto mb-12">
        Choose your path. Both take under two minutes.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
        <button
          onClick={onChooseSwoonType}
          className="group bg-white border border-[#E8E2D9] hover:border-[#B89860] rounded-2xl p-8 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-widest font-sans text-[#B89860] font-bold">
            For Her
          </span>
          <h2 className="font-serif italic text-2xl mt-2 mb-3 text-[#1A1816]">
            I want to be taken out
          </h2>
          <p className="font-sans text-sm text-[#8C8377]">
            Discover your Swoon Type. A quick, beautiful quiz that tells him exactly how to date you.
          </p>
        </button>

        <button
          onClick={onChoosePlanDate}
          className="group bg-white border border-[#E8E2D9] hover:border-[#B89860] rounded-2xl p-8 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-widest font-sans text-[#B89860] font-bold">
            For Him (Or Anyone Planning)
          </span>
          <h2 className="font-serif italic text-2xl mt-2 mb-3 text-[#1A1816]">
            I want to plan a custom date
          </h2>
          <p className="font-sans text-sm text-[#8C8377]">
            Answer 20 quick questions, get a full itinerary with real venues and reservation links.
          </p>
        </button>
      </div>
    </section>
  );
};
