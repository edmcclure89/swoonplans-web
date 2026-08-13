import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/portfolio';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenLightbox?: (photo: any) => void;
  onOpenInquire: () => void;
  onInstantAccess: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInquire, onInstantAccess }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full px-4 sm:px-8 pt-4 pb-6 flex flex-col justify-between">
      <div className="relative h-[72vh] sm:h-[80vh] rounded-sm overflow-hidden group bg-[#1A1816] border border-[#E8E2D9] shadow-sm flex items-center justify-center">
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-grain pointer-events-none" />
          </div>
        ))}

        {/* Primary headline — overlays every slide, top center */}
        <div className="absolute top-8 sm:top-12 inset-x-0 z-10 px-6 flex justify-center">
          <h1 className="max-w-3xl text-center text-3xl sm:text-5xl md:text-6xl text-white font-light leading-[1.1] font-serif italic drop-shadow-xl tracking-tight text-balance">
            {'Ladies, You\u2019re Worth Our Algorithm'}
          </h1>
        </div>

        <div className="absolute bottom-8 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 z-10 max-w-2xl text-left space-y-3">
          <p className="text-xs sm:text-base text-[#E2D5C3] font-serif italic tracking-wide font-light opacity-90 text-pretty">
            Dates customized to you and your preferences. He answers 15 questions about you, your likes, selects a budget and our algorithm delivers your bespoke date plan, with addresses and even direct links to reservations.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenInquire}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs sm:text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all shadow-2xl shadow-black/40 cursor-pointer hover:scale-[1.02]"
              aria-label="Pre-register now"
            >
              <Sparkles className="w-4 h-4" />
              Pre-Register Now
            </button>
            <button
              onClick={onInstantAccess}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] border border-[#D5C29F] font-bold text-xs sm:text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all shadow-2xl shadow-black/40 cursor-pointer hover:scale-[1.02]"
              aria-label="Get instant access"
            >
              Instant Access
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-colors cursor-pointer border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5 px-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#D5C29F]' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="p-2 bg-black/40 hover:bg-black/70 backdrop-blur-md text-white rounded-full transition-colors cursor-pointer border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </section>
  );
};
