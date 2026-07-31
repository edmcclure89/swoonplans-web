import React, { useState } from 'react';
import { FEATURED_STORIES, StoryItem, PhotoItem } from '../data/portfolio';
import { MapPin, Calendar, ArrowRight, Maximize2, Sparkles } from 'lucide-react';

interface RealStoriesSectionProps {
  onSelectPhoto: (photo: PhotoItem) => void;
  onOpenInquire: () => void;
}

export const RealStoriesSection: React.FC<RealStoriesSectionProps> = ({
  onSelectPhoto,
  onOpenInquire,
}) => {
  const [selectedStory, setSelectedStory] = useState<StoryItem>(FEATURED_STORIES[0]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#8C8377] mb-2 font-medium">
          CURATED DATE ESSAYS
        </p>
        <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic">
          Featured Romance Itineraries
        </h2>
        <div className="w-12 h-px bg-[#D5C29F] mx-auto mt-4" />
      </div>

      {/* Story Tabs */}
      <div className="flex justify-center border-b border-[#E8E2D9] mb-12 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 sm:gap-8 pb-3">
          {FEATURED_STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className={`text-xs sm:text-sm uppercase tracking-[0.25em] font-sans transition-all cursor-pointer whitespace-nowrap pb-2 ${
                selectedStory.id === story.id
                  ? 'text-[#1A1816] font-medium border-b-2 border-[#1A1816]'
                  : 'text-[#8C8377] hover:text-[#1A1816]'
              }`}
            >
              {story.couple}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Story Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#EFEDEB]/40 p-6 sm:p-10 rounded border border-[#E8E2D9] mb-16">
        {/* Cover Image */}
        <div 
          onClick={() => onSelectPhoto(selectedStory.photos[0])}
          className="lg:col-span-7 relative group overflow-hidden rounded cursor-pointer border border-[#E8E2D9]"
        >
          <img
            src={selectedStory.coverImage}
            alt={selectedStory.title}
            className="w-full h-[380px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end z-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#D5C29F]">COVER IMAGE</p>
              <h3 className="text-2xl font-serif italic">{selectedStory.couple}</h3>
            </div>
            <div className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Minimalist Story Intro & Meta */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] mb-2">
              <MapPin className="w-3 h-3 text-[#D5C29F]" />
              <span>{selectedStory.location}</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-serif italic text-[#1A1816] font-light leading-tight mb-4">
              {selectedStory.title}
            </h3>

            <p className="text-sm font-sans text-[#524B43] leading-relaxed font-light italic">
              "{selectedStory.intro}"
            </p>
          </div>

          <div className="pt-6 border-t border-[#E8E2D9]">
            <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] mb-4">
              <Calendar className="w-3 h-3 inline mr-1 text-[#D5C29F]" />
              <span>{selectedStory.date}</span>
            </div>

            <button
              onClick={onOpenInquire}
              className="w-full py-3 bg-[#1A1816] text-[#FAF8F5] text-[10px] uppercase tracking-[0.3em] font-sans hover:bg-[#38332E] transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
            >
              <span>PLAN A DATE LIKE THIS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D5C29F]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
