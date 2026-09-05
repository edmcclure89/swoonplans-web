import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES } from '../data/portfolio';
import type { HeroPathway, HeroReview } from '../data/portfolio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenLightbox?: (photo: any) => void;
  onOpenInquire: () => void;
  onOpenSwoonType: () => void;
  onOpenSelfCare: () => void;
  onOpenKidPlans: () => void;
}

const ReviewBar: React.FC<{ review: HeroReview; accent: string }> = ({ review, accent }) => (
  <div className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-black/35 px-3.5 py-2 backdrop-blur-md">
    <span
      className="text-xs leading-none tracking-[0.15em]"
      style={{ color: accent }}
      aria-hidden="true"
    >
      {'\u2605'.repeat(review.rating)}
    </span>
    <span className="sr-only">{review.rating} out of 5 stars.</span>
    <span className="font-sans text-[11px] font-medium leading-none text-[#E8E2D9]">
      {review.name}
    </span>
  </div>
);

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenInquire,
  onOpenSelfCare,
  onOpenKidPlans,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Autoplay pauses while the hero is hovered or keyboard-focused. Begin means
  // a different thing on every slide, so rotating out from under someone who is
  // reaching for it would start the wrong flow.
  const [paused, setPaused] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reduceMotion.current) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const activeSlide = HERO_SLIDES[currentIndex];

  const actions: Record<HeroPathway, () => void> = {
    swoonHer: onOpenInquire,
    selfCare: onOpenSelfCare,
    kidPlans: onOpenKidPlans,
  };

  const go = (next: number) =>
    setCurrentIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section className="relative w-full px-4 sm:px-8 pt-4 pb-6">
      <div
        className="relative min-h-[72vh] sm:min-h-[80vh] rounded-sm overflow-hidden bg-[#1A1816] border border-[#E8E2D9] shadow-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={idx !== currentIndex}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover filter brightness-[1.05] contrast-[1.03]"
              style={{ objectPosition: s.focal ?? 'center' }}
            />
            {/* Scrim runs left to right so the copy stays legible while the
                right side of the photograph is left clear. */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent sm:hidden" />
            <div className="absolute inset-0 bg-grain pointer-events-none" />
          </div>
        ))}

        {/* Copy and call to action, vertically centred on the left. */}
        <div className="relative z-10 flex min-h-[72vh] sm:min-h-[80vh] items-center">
          <div className="w-full max-w-lg px-6 pb-24 sm:max-w-xl sm:px-12 sm:pb-0 lg:px-16 text-left">
            {/* Short accent rule keys the copy to whichever pathway is showing. */}
            <span
              className="block h-[3px] w-14 rounded-full"
              style={{ backgroundColor: activeSlide.accent }}
              aria-hidden="true"
            />
            <h1 className="mt-6 font-serif italic font-light text-white text-[2.1rem] leading-[1.08] sm:text-[3.4rem] lg:text-[4rem] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
              {activeSlide.headline}
            </h1>
            <p className="mt-5 max-w-sm font-sans text-sm font-light leading-relaxed text-[#E8E2D9]/90 sm:text-base">
              {activeSlide.subheadline}
            </p>

            <button
              onClick={actions[activeSlide.pathway]}
              className="mt-8 inline-flex items-center justify-center rounded-full px-12 py-4 font-sans text-[13px] font-bold uppercase tracking-[0.18em] text-[#1A1816] transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 cursor-pointer"
              style={{
                backgroundColor: activeSlide.accent,
                boxShadow: `0 10px 30px -8px ${activeSlide.accent}99`,
              }}
            >
              Begin
            </button>

            {activeSlide.review && (
              <div>
                <ReviewBar review={activeSlide.review} accent={activeSlide.accent} />
              </div>
            )}
          </div>
        </div>

        {/* Pathway selector. Named rather than anonymous dots so all three
            products stay visible instead of only the one currently showing. */}
        <div className="absolute bottom-5 left-6 right-6 z-20 flex flex-wrap items-center gap-x-2 gap-y-2 sm:left-12 sm:right-auto lg:left-16">
          {HERO_SLIDES.map((s, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(idx)}
                aria-current={active ? 'true' : undefined}
                className={`rounded-full border px-3.5 py-1.5 font-sans text-[11px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  active
                    ? 'border-transparent font-bold text-[#1A1816]'
                    : 'border-white/25 bg-black/30 text-[#E8E2D9] backdrop-blur-md hover:bg-black/50'
                }`}
                style={active ? { backgroundColor: s.accent } : undefined}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-5 right-6 z-20 hidden items-center gap-2 sm:flex">
          <button
            onClick={() => go(currentIndex - 1)}
            className="p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-colors cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => go(currentIndex + 1)}
            className="p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-colors cursor-pointer border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
