import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/portfolio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onOpenLightbox?: (photo: any) => void;
  onOpenInquire: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInquire }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentIndex];

  return (
    <section className="relative w-full px-4 sm:px-8 pt-4 pb-6 flex flex-col justify-between">
      {/* Main Image Frame matching Sleek Interface Theme */}
      <div className="relative h-[72vh] sm:h-[80vh] rounded-sm overflow-hidden group bg-[#1A1816] border border-[#E8E2D9] shadow-sm flex items-center justify-center">
        {/* Slide Background Image */}
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
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
            <div className="absolute inset-0 bg-grain pointer-events-none" />
          </div>
        ))}

        {/* Main Image Copy - Lower Left Overlay */}
        <div className="absolute bottom-8 sm:bottom-10 left-6 sm:left-10 z-10 max-w-2xl text-left space-y-2">
          <h1 className="text-2xl sm:text-4xl md:text-5xl text-white font-light leading-tight font-serif italic drop-shadow-lg tracking-tight">
            "{slide.headline}"
          </h1>
          <p className="text-xs sm:text-base text-[#E2D5C3] font-serif italic tracking-wide font-light opacity-90">
            {slide.subheadline}
          </p>
        </div>

        {/* Minimal Controls at Bottom Right */}
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
