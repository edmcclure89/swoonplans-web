/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AppProcessSection } from './components/AppProcessSection';
import { HusbandsTestimonialsSection } from './components/HusbandsTestimonialsSection';
import { ItinerariesSection } from './components/ItinerariesSection';
import { BlogSection } from './components/BlogSection';
import { ForWomenSection } from './components/ForWomenSection';
import { ImageLightbox } from './components/ImageLightbox';
import { DateConciergeApp } from './components/DateConciergeApp';
import { TermsModal } from './components/TermsModal';
import { NudgeModal } from './components/NudgeModal';
import { AccessModal } from './components/AccessModal';
import { PricingSection } from './components/PricingSection';
import { ThreeStepSection } from './components/ThreeStepSection';
import { AudioPlayer } from './components/AudioPlayer';
import { PORTFOLIO_PHOTOS, PhotoItem } from './data/portfolio';
import { supabase } from './lib/supabase';
import { Instagram, Film, Mail, ArrowUp, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('stories');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isNudgeOpen, setIsNudgeOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Tracks whether the nudge modal has ever been opened this render-session
  // (manually or automatically), so the timer never reopens it.
  const nudgeOpenedRef = useRef(false);

  // Live mirrors of open state so the timers/listeners can read the current
  // value without re-subscribing. Used to guarantee the two auto-modals are
  // never open at the same time.
  const isNudgeOpenRef = useRef(false);
  const isAccessOpenRef = useRef(false);
  useEffect(() => { isNudgeOpenRef.current = isNudgeOpen; }, [isNudgeOpen]);
  useEffect(() => { isAccessOpenRef.current = isAccessOpen; }, [isAccessOpen]);

  // Send the visitor to the pre-registration page, preserving any inbound
  // ?ref= referral code so attribution survives the click from the homepage.
  const goToRegister = () => {
    let ref: string | null = null;
    try {
      ref = new URLSearchParams(window.location.search).get('ref');
    } catch {
      ref = null;
    }
    window.location.href = ref ? `/register?ref=${encodeURIComponent(ref)}` : '/register';
  };

  // Instant Access -> Founders Pass Stripe checkout (3-month upfront, one-time
  // 'payment' mode, resolved server-side to PRICE_ID_FOUNDERS). Purely a
  // payments redirect; if it can't start, we send them to pre-register instead.
  // No SMS/backend messaging is involved anywhere here.
  const handleInstantAccess = async () => {
    try {
      let userId: string | undefined;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id;
      } catch {
        userId = undefined;
      }
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'founders', userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      // Couldn't start checkout: send them to the pre-registration page instead.
      goToRegister();
    } catch {
      goToRegister();
    }
  };

  // Mark the nudge as "seen" whenever it opens by any means, and persist it for
  // the browser session so it only auto-opens once. Storage access is guarded
  // so blocked/private-mode storage can't crash the page.
  useEffect(() => {
    if (!isNudgeOpen) return;
    nudgeOpenedRef.current = true;
    try {
      sessionStorage.setItem('swoon_nudge_seen', '1');
    } catch {
      // ignore storage failures (private browsing, blocked storage, etc.)
    }
  }, [isNudgeOpen]);

  // Intent-based auto-open: exit-intent on desktop, scroll-depth on mobile,
  // with a 45s safety net. Once per session, and never if the user already
  // opened it manually.
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('swoon_nudge_seen') === '1';
    } catch {
      alreadySeen = false;
    }
    if (alreadySeen) return;

    // Guard so we only fire once and never after a manual open. Also suppressed
    // while the AccessModal is open so the two auto-modals never stack.
    let fired = false;
    const trigger = () => {
      if (fired || nudgeOpenedRef.current || isAccessOpenRef.current) return;
      fired = true;
      setIsNudgeOpen(true);
    };

    const isCoarse =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches;

    // Safety net: open after 45s if nothing else has triggered.
    const safetyTimer = setTimeout(trigger, 45000);

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const depth =
          (window.scrollY + window.innerHeight) /
          document.documentElement.scrollHeight;
        if (depth >= 0.4) trigger();
      });
    };

    const onMouseOut = (e: MouseEvent) => {
      // Cursor left toward the top of the viewport (tab bar / close button).
      if (!e.relatedTarget && e.clientY <= 0) trigger();
    };

    if (isCoarse) {
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      document.addEventListener('mouseout', onMouseOut);
    }

    return () => {
      clearTimeout(safetyTimer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  // Auto-open the AccessModal 6s after load, once per session. AccessModal
  // always takes priority: if the nudge happened to open first, close it so the
  // two never stack and AccessModal still shows.
  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('swoon_access_seen') === '1';
    } catch {
      alreadySeen = false;
    }
    if (alreadySeen) return;

    const t = setTimeout(() => {
      try {
        sessionStorage.setItem('swoon_access_seen', '1');
      } catch {
        // ignore storage failures (private browsing, blocked storage, etc.)
      }
      // Yield the screen to AccessModal, closing the nudge if it beat us here.
      if (isNudgeOpenRef.current) setIsNudgeOpen(false);
      setIsAccessOpen(true);
    }, 6000);

    return () => clearTimeout(t);
  }, []);

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
              onPreRegister={goToRegister}
              onInstantAccess={handleInstantAccess}
            />
            <ThreeStepSection onOpenInquire={() => setIsInquireOpen(true)} />
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

      {/* Floating Nudge Trigger — hidden while either auto-modal is open */}
      {!isNudgeOpen && !isAccessOpen && (
        <button
          onClick={() => setIsNudgeOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] rounded-full uppercase tracking-[0.2em] font-sans text-xs font-bold shadow-2xl cursor-pointer transition-colors"
        >
          Make Him Plan
        </button>
      )}

      {/* Floating Nudge Modal */}
      <NudgeModal
        isOpen={isNudgeOpen}
        onClose={() => setIsNudgeOpen(false)}
      />

      {/* Timed Access Modal */}
      <AccessModal
        isOpen={isAccessOpen}
        onClose={() => setIsAccessOpen(false)}
        onRequestAccess={() => {
          setIsAccessOpen(false);
          goToRegister();
        }}
        onInstantAccess={() => {
          setIsAccessOpen(false);
          handleInstantAccess();
        }}
      />
    </div>
  );
}
