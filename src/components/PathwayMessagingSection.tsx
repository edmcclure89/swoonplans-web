import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PathwayMessagingSectionProps {
  onOpenSwoonHer: () => void;
  onOpenSelfCare: () => void;
  onOpenKidPlans: () => void;
}

// Vertical-specific messaging, one card per pathway. Sits directly below the
// hero so the hero carousel stays untouched. Accents match HERO_SLIDES in
// src/data/portfolio.ts so each card reads as the same pathway.
// Copy rule: only claim what each flow actually delivers. Kid Plans returns
// age-matched ideas, not venues, hours, or addresses, so its copy says so.
export const PathwayMessagingSection: React.FC<PathwayMessagingSectionProps> = ({
  onOpenSwoonHer,
  onOpenSelfCare,
  onOpenKidPlans,
}) => {
  const cards = [
    {
      key: 'swoonHer',
      eyebrow: 'COUPLES & PARTNERS',
      headline: 'Date Night, Solved',
      body:
        'You know the drill: dinner reservations, a plan that falls apart by 7pm, and a partner who deserves better than "I don\'t know, what do you want to do." Get a full itinerary, built around your city and your budget, in under two minutes.',
      cta: 'Plan date night',
      accent: '#D5C29F',
      onClick: onOpenSwoonHer,
    },
    {
      key: 'selfCare',
      eyebrow: 'SOLO / SELF CARE',
      headline: "A Day That's Just Yours",
      body:
        'Self-care shouldn\'t mean another spa gift card you never use. Get a real plan, a real schedule, and real places to go, so your time off actually feels like time off.',
      cta: 'Plan my day',
      accent: '#E08B6F',
      onClick: onOpenSelfCare,
    },
    {
      key: 'kidPlans',
      eyebrow: 'PARENTS / FAMILY',
      headline: 'Family Time, Actually Planned',
      body:
        'No more circling the block looking for "something to do." Get age-appropriate ideas built around what your kids are into right now, so the outing is about your kids, not logistics.',
      cta: 'Plan family time',
      accent: '#5FD068',
      onClick: onOpenKidPlans,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className="flex flex-col bg-[#F2EDE4] rounded-xl p-6 sm:p-7 border-t-4"
            style={{ borderTopColor: c.accent }}
          >
            <div className="text-[10px] sm:text-xs font-bold font-sans tracking-[0.18em] text-[#5A6472]">
              {c.eyebrow}
            </div>
            <h3 className="mt-2 font-serif italic font-light text-2xl sm:text-3xl text-[#1A2B4A] leading-tight">
              {c.headline}
            </h3>
            <p className="mt-3 text-sm font-sans text-[#5A6472] leading-relaxed flex-1">
              {c.body}
            </p>
            <button
              type="button"
              onClick={c.onClick}
              className="mt-5 inline-flex items-center gap-2 self-start text-sm font-sans font-semibold text-[#1A2B4A] hover:opacity-80 transition-opacity"
            >
              {c.cta}
              <ArrowRight className="w-4 h-4" style={{ color: c.accent }} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
