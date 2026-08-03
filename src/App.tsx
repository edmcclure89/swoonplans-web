/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GalleryGrid } from './components/GalleryGrid';
import { AppProcessSection } from './components/AppProcessSection';
import { HusbandsTestimonialsSection } from './components/HusbandsTestimonialsSection';
import { ItinerariesSection } from './components/ItinerariesSection';
import { BlogSection } from './components/BlogSection';
import { ForWomenSection } from './components/ForWomenSection';
import { ImageLightbox } from './components/ImageLightbox';
import { DateConciergeApp } from './components/DateConciergeApp';
import { TermsModal } from './components/TermsModal';
import { PricingSection } from './components/PricingSection';
import { ThreeStepSection } from './components/ThreeStepSection';
import { AudioPlayer } from './components/AudioPlayer';
import { PORTFOLIO_PHOTOS, PhotoItem } from './data/portfolio';
import { Instagram, Film, Mail, ArrowUp, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('stories');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const selectedPhoto = selectedPhotoIndex !== null ? PORTFOLIO_PHOTOS[selectedPhotoIndex] : null;

  const handleOpenLightboxByPhoto = (photo: PhotoItem) => {
    const idx = PORTFOLIO_PHOTOS.findIndex((p) => p.id === photo.id);
    if (idx !== -1) {
      setSelectedPhotoIndex(idx);
    } else {
      // If temporary photo, create virtual index or view directly
      setSelectedPhotoIndex(0);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! - 1 + PORTFOLIO_PHOTOS.length) % PORTFOLIO_PHOTOS.length);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! + 1) % PORTFOLIO_PHOTOS.length);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816] relative flex flex-col">
      {/* Audio Engine */}
      <AudioPlayer isPlaying={isAudioPlaying} />

      {/* Side Rail Accents matching Sleek Interface Theme */}
      <aside className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 origin-left -rotate-90 text-[9px] uppercase tracking-[0.4em] text-[#8C8377] font-sans pointer-events-none z-30 opacity-60 font-medium">
        SWOON PLANS
      </aside>
      <aside className="hidden xl:block fixed right-6 top-1/2 translate-y-1/2 origin-right -rotate-90 text-[9px] uppercase tracking-[0.4em] text-[#8C8377] font-sans pointer-events-none z-30 opacity-60 font-medium">
        YOUR DATE CONCIERGE
      </aside>

      {/* Main Header / Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInquire={() => setIsInquireOpen(true)}
        isMuted={!isAudioPlaying}
        toggleAudio={() => setIsAudioPlaying(!isAudioPlaying)}
      />

      {/* Content Area */}
      <main className="flex-1">
        {activeTab === 'stories' && (
          <>
            <HeroSection
              onOpenLightbox={handleOpenLightboxByPhoto}
              onOpenInquire={() => setIsInquireOpen(true)}
            />
            <ThreeStepSection onOpenInquire={() => setIsInquireOpen(true)} />
            <GalleryGrid onSelectPhoto={handleOpenLightboxByPhoto} />
            <HusbandsTestimonialsSection />
            <PricingSection onOpenInquire={() => setIsInquireOpen(true)} />
          </>
        )}

        {activeTab === 'itineraries' && (
          <>
            <ItinerariesSection onOpenInquire={() => setIsInquireOpen(true)} />
            <AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
          </>
        )}

        {activeTab === 'blog' && (
          <>
            <BlogSection onOpenInquire={() => setIsInquireOpen(true)} />
            <AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
          </>
        )}

        {activeTab === 'for-women' && (
          <>
            <ForWomenSection onOpenInquire={() => setIsInquireOpen(true)} />
            <AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-[#1A1816] text-[#FAF8F5] py-16 px-6 sm:px-12 border-t border-[#38332E] mt-20 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-2xl sm:text-3xl font-serif tracking-[0.2em] italic font-light">
              SWOON PLANS
            </h3>
            <p className="text-[10px] uppercase tracking-[0.35em] font-sans text-white/70 font-bold">
              YOUR DATE PLANNING CONCIERGE
            </p>
          </div>

          {/* Socials & Actions */}
          <div className="flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] font-sans text-white/70">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D5C29F] transition-colors flex items-center gap-1.5"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>INSTAGRAM</span>
            </a>
            <button
              onClick={() => setIsInquireOpen(true)}
              className="hover:text-[#D5C29F] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[#D5C29F]"
            >
              <Mail className="w-3.5 h-3.5 text-[#D5C29F]" />
              <span>FIRST PLAN FREE</span>
            </button>
            <button
              onClick={scrollToTop}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[9px] uppercase tracking-[0.25em] font-sans text-white/50 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© {new Date().getFullYear()} SWOON PLANS CONCIERGE • A DIVISION OF FOR LOVE COACHING. ALL RIGHTS RESERVED.</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-[#D5C29F] hover:underline cursor-pointer font-bold tracking-widest ml-1"
            >
              TERMS & PRIVACY
            </button>
          </div>
          <span>NEW YORK • LOS ANGELES • MIAMI • NATIONWIDE</span>
        </div>
      </footer>

      {/* Lightbox Component */}
      <ImageLightbox
        photo={selectedPhoto}
        onClose={() => setSelectedPhotoIndex(null)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
        onInquire={() => {
          setSelectedPhotoIndex(null);
          setIsInquireOpen(true);
        }}
      />

      {/* Interactive Quiz + Date Plan Generator */}
      <DateConciergeApp
        isOpen={isInquireOpen}
        onClose={() => setIsInquireOpen(false)}
      />

      {/* Terms & Privacy Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
