import React, { useEffect } from 'react';
import { X, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { PhotoItem } from '../data/portfolio';

interface ImageLightboxProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onInquire?: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  photo,
  onClose,
  onPrev,
  onNext,
  onInquire,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0E0D]/95 backdrop-blur-xl flex flex-col justify-between text-[#FAF8F5] animate-fade-in">
      {/* Lightbox Header */}
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <span className="text-lg sm:text-xl font-serif tracking-[0.2em] text-[#E2D5C3]">
            SWOON PLANS
          </span>
          <span className="hidden sm:inline-block text-white/30">|</span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.3em] font-sans text-white/60">
            {photo.category.toUpperCase()} PORTFOLIO
          </span>
        </div>

        <div className="flex items-center gap-4">
          {onInquire && (
            <button
              onClick={onInquire}
              className="text-[10px] uppercase tracking-[0.25em] font-sans px-3 py-1.5 border border-[#D5C29F] text-[#D5C29F] hover:bg-[#D5C29F] hover:text-[#1A1816] transition-all cursor-pointer font-medium"
            >
              PLAN A DATE LIKE THIS
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden group">
        {/* Navigation Arrows */}
        {onPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 sm:left-8 z-20 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full border border-white/20 transition-all cursor-pointer"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* High Res Image */}
        <div className="relative max-w-6xl max-h-[75vh] sm:max-h-[80vh] flex items-center justify-center">
          <img
            src={photo.src}
            alt={photo.title}
            className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-sm shadow-2xl filter brightness-[0.98] contrast-[1.02]"
          />
        </div>

        {onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 sm:right-8 z-20 p-3 bg-black/40 hover:bg-black/80 text-white rounded-full border border-white/20 transition-all cursor-pointer"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Lightbox Footer Bar */}
      <div className="p-4 sm:p-6 bg-[#171513] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h2 className="font-serif text-xl text-[#FAF8F5] italic font-light">
            {photo.title}
          </h2>
          {photo.caption && (
            <p className="text-white/60 text-xs font-sans mt-0.5 font-light">
              "{photo.caption}"
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] uppercase tracking-[0.25em] font-sans text-white/70">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D5C29F]" />
            <span>{photo.location}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#D5C29F]" />
            <span>{photo.experienceType || 'Date Planning Concierge'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
