/**
* @license
* SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AppProcessSection } from './components/AppProcessSection';
import { HusbandsTestimonialsSection } from './components/HusbandsTestimonialsSection';
import { ItinerariesSection } from './components/ItinerariesSection';
import { BlogSection } from './components/BlogSection';
import { BlogPostPage } from './components/BlogPostPage';
import { ImageLightbox } from './components/ImageLightbox';
import { DateConciergeApp } from './components/DateConciergeApp';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { WelcomePage } from './components/WelcomePage';
import { RegisterPage } from './components/RegisterPage';
import { PricingSection } from './components/PricingSection';
import { ThreeStepSection } from './components/ThreeStepSection';
import { AudioPlayer } from './components/AudioPlayer';
import { PORTFOLIO_PHOTOS, PhotoItem } from './data/portfolio';
import { Film, Mail, ArrowUp, ShieldCheck } from 'lucide-react';
import { socialLinks } from './data/socialLinks';

interface AppProps {
// Only set during build-time SSR (see src/entry-server.tsx). Lets the
// per-post prerender script render the correct route (e.g. a specific
// /blog/:slug) without a real window.location to read from. Always
// undefined in the browser, where window.location is used instead.
ssrPath?: string;
}

export default function App({ ssrPath }: AppProps = {}) {
// Deep-link into the Journal tab, e.g. a "More From the Journal" link
// from a standalone article pointing back at /?tab=blog.
const [activeTab, setActiveTab] = useState<string>(() => {
if (typeof window === 'undefined') return 'stories';
const params = new URLSearchParams(window.location.search);
return params.get('tab') === 'blog' ? 'blog' : 'stories';
});
const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
const [isInquireOpen, setIsInquireOpen] = useState(false);
const [isAudioPlaying, setIsAudioPlaying] = useState(false);

// Magic-link / gate emails redirect here with ?app=1 so returning users
// land back inside the concierge modal instead of a bare homepage.
useEffect(() => {
if (typeof window === 'undefined') return;
const params = new URLSearchParams(window.location.search);
if (params.get('app') === '1') {
setIsInquireOpen(true);
}
}, []);

// Standalone article pages. Routed at /blog/:slug (see vercel.json
// rewrite) so every post has its own real, shareable URL instead of
// living inside a modal.
const ssrOrBrowserPath = ssrPath ?? (typeof window !== 'undefined' ? window.location.pathname : null);
const blogSlugMatch = ssrOrBrowserPath ? ssrOrBrowserPath.match(/^\/blog\/([^/]+)\/?$/) : null;
if (blogSlugMatch) {
return <BlogPostPage slug={blogSlugMatch[1]} />;
}

// Post-checkout landing. Stripe's success_url sends buyers to /welcome; this
// SPA renders the confirmation screen for that path instead of the funnel.
const isWelcomeRoute =
typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/welcome';
if (isWelcomeRoute) {
return <WelcomePage />;
}

const isRegisterRoute =
typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/register';
if (isRegisterRoute) {
return <RegisterPage />;
}

// Standalone legal pages, routed at /terms and /privacy (see vercel.json
// rewrite) so they have real, shareable, crawlable URLs instead of living
// in a modal.
const isTermsRoute =
typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/terms';
if (isTermsRoute) {
return <TermsPage />;
}

const isPrivacyRoute =
typeof window !== 'undefined' && window.location.pathname.replace(/\/$/, '') === '/privacy';
if (isPrivacyRoute) {
return <PrivacyPage />;
}

const selectedPhoto = selectedPhotoIndex !== null ? PORTFOLIO_PHOTOS[selectedPhotoIndex] : null;

const handleOpenLightboxByPhoto = (photo: PhotoItem) => {
const idx = PORTFOLIO_PHOTOS.findIndex((p) => p.id === photo.id);
if (idx !== -1) {
setSelectedPhotoIndex(idx);
} else {
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
<AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
)}
</main>

{/* Minimal Footer */}
<footer className="bg-[#FAF8F5] text-[#1A1816] py-16 px-6 sm:px-12 border-t border-[#E8E2D9] mt-20 relative z-20">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
<div className="text-center md:text-left space-y-1">
<h3 className="text-2xl sm:text-3xl font-serif tracking-[0.2em] italic font-light">
SWOON PLANS
</h3>
<p className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#6E675F] font-bold">
YOUR DATE PLANNING CONCIERGE
</p>
</div>

<div className="flex items-center gap-8 text-[10px] uppercase tracking-[0.3em] font-sans text-[#6E675F]">
<div className="flex items-center gap-5">
{socialLinks.map(({ label, href, Icon }) => (
<a
key={label}
href={href}
target="_blank"
rel="noopener noreferrer"
aria-label={label}
className="text-[#6E675F] hover:text-[#B89860] transition-colors"
>
<Icon className="w-4 h-4" />
</a>
))}
</div>
<button
onClick={() => setIsInquireOpen(true)}
className="hover:text-[#c4af89] transition-colors flex items-center gap-1.5 cursor-pointer font-bold text-[#B89860]"
>
<Mail className="w-3.5 h-3.5 text-[#B89860]" />
<span>FIRST PLAN FREE</span>
</button>
<button
onClick={scrollToTop}
className="p-2.5 bg-[#1A1816]/5 hover:bg-[#1A1816]/10 rounded-full transition-colors cursor-pointer"
title="Return to top"
>
<ArrowUp className="w-4 h-4 text-[#1A1816]" />
</button>
</div>
</div>

<div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between text-[9px] uppercase tracking-[0.25em] font-sans text-[#8C8377] gap-4">
<div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
<span>© {new Date().getFullYear()} SWOON PLANS CONCIERGE • A DIVISION OF FOR LOVE COACHING. ALL RIGHTS RESERVED.</span>
<span className="flex items-center gap-3 ml-1">
<a href="/terms" className="text-[#B89860] hover:underline cursor-pointer font-bold tracking-widest">
TERMS
</a>
<a href="/privacy" className="text-[#B89860] hover:underline cursor-pointer font-bold tracking-widest">
PRIVACY
</a>
</span>
</div>
<span>WASHINGTON DC • NEW YORK • LOS ANGELES • NATIONWIDE</span>
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
</div>
);
}
