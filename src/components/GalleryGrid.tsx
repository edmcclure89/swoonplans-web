import React, { useState } from 'react';
import { PORTFOLIO_PHOTOS, PhotoItem } from '../data/portfolio';
import { MapPin, Maximize2, Sparkles } from 'lucide-react';

interface GalleryGridProps {
  onSelectPhoto: (photo: PhotoItem) => void;
  filterCategory?: string;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ onSelectPhoto, filterCategory }) => {
  const [activeCategory, setActiveCategory] = useState<string>(filterCategory || 'all');

  const categories = [
    { id: 'all', label: 'All Experiences' },
    { id: 'evening', label: 'Evening Rooftops' },
    { id: 'destination', label: 'Sunset Coves' },
    { id: 'intimate', label: 'Waterfront Walks' },
  ];

  const filteredPhotos = activeCategory === 'all' 
    ? PORTFOLIO_PHOTOS 
    : PORTFOLIO_PHOTOS.filter((p) => p.category === activeCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Category Filter Navigation & Service Value Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E8E2D9] pb-6 mb-10 gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#8C8377] mb-1 font-bold">
            HOW SWOON PLANS WORKS
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-[#1A1816] italic">
            Curated Date Night Plans
          </h2>
          <p className="text-xs text-[#6E675F] font-sans mt-2 max-w-xl font-light leading-relaxed">
            Answer 15 short questions to receive a custom-tailored date itinerary with exact venue addresses, direct reservation links, conversation starters, and insider parking & seating tips.
          </p>
        </div>

        {/* Filter Pills matching Sleek Interface Theme */}
        <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] uppercase tracking-[0.25em] font-sans">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 transition-all cursor-pointer border ${
                activeCategory === cat.id
                  ? 'bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]'
                  : 'bg-[#EFEDEB]/60 text-[#6E675F] border-transparent hover:border-[#D8CEC0] hover:text-[#1A1816]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout - Editorial Bento Grid with Quotes from Happy Men */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredPhotos.map((photo, index) => {
          // Dynamic span styling for editorial rhythm
          const isWide = photo.aspectRatio === 'wide' || index % 5 === 0;

          return (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className={`group relative overflow-hidden bg-[#EFEDEB] border border-[#E8E2D9] rounded-sm cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between ${
                isWide ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Image with subtle hover zoom */}
              <div className="relative aspect-[4/3] sm:aspect-auto sm:h-[380px] w-full overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover object-center filter brightness-[0.94] contrast-[1.02] group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Dark Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-grain opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white/90">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-sans px-2.5 py-1 bg-black/50 backdrop-blur-md rounded border border-white/10 font-medium text-[#D5C29F]">
                    {photo.experienceType}
                  </span>
                  <div className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>

                {/* Bottom Caption & Quote Overlay */}
                <div className="absolute bottom-5 left-5 right-5 z-10 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#E2D5C3] font-light flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#D5C29F]" />
                    <span>{photo.location}</span>
                  </p>
                  <h3 className="text-lg sm:text-xl text-white font-serif italic font-light leading-snug">
                    {photo.title}
                  </h3>

                  {/* Quote from Happy Man */}
                  {photo.quote && (
                    <div className="pt-2 border-t border-white/20">
                      <p className="text-xs sm:text-sm font-serif italic text-white/95 font-light leading-relaxed">
                        "{photo.quote}"
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-sans text-[#D5C29F] mt-1 font-bold">
                        — {photo.quoteAuthor}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
