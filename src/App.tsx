/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PathwayMessagingSection } from './components/PathwayMessagingSection';
import { AppProcessSection } from './components/AppProcessSection';
import { HusbandsTestimonialsSection } from './components/HusbandsTestimonialsSection';
import { ImageLightbox } from './components/ImageLightbox';
import { PricingSection } from './components/PricingSection';
import { ThreeStepSection } from './components/ThreeStepSection';
import { AudioPlayer } from './components/AudioPlayer';
import { readScoresFromQuery } from './lib/swoonQuery';
// Quizzes, blog, legal and account screens are code-split: see src/lib/lazyModules.tsx.
import { Lazy, ModalLoading } from './lib/lazyModules';
import { PORTFOLIO_PHOTOS, PhotoItem } from './data/portfolio';
import { Mail, ArrowUp } from 'lucide-react';
import { socialLinks } from './data/socialLinks';

// True from the first time `open` is true onwards. Lets a split-out modal
// download only when first opened, then stay mounted so it keeps its state.
function useOpenedOnce(open: boolean): boolean {
const [opened, setOpened] = useState(open);
if (open && !opened) setOpened(true);
return opened || open;
}

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
    // ssrPath is set at build time so the prerenderer can emit a real /blog
    // hub page. Without it SSR always falls through to 'stories' and crawlers
    // never see a single link to any article.
    const path = ssrPath ?? (typeof window !== 'undefined' ? window.location.pathname : null);
    const onBlogRoute = path ? path.replace(/\/$/, '') === '/blog' : false;
    if (typeof window === 'undefined') return onBlogRoute ? 'blog' : 'stories';
    const params = new URLSearchParams(window.location.search);
    return onBlogRoute || params.get('tab') === 'blog' ? 'blog' : 'stories';
  });
const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
const [isInquireOpen, setIsInquireOpen] = useState(false);
const [isAudioPlaying, setIsAudioPlaying] = useState(false);
const [isSwoonTypeOpen, setIsSwoonTypeOpen] = useState(false);
const [isSelfCareOpen, setIsSelfCareOpen] = useState(false);
const [isKidPlansOpen, setIsKidPlansOpen] = useState(false);
const dateOpened = useOpenedOnce(isInquireOpen);
const selfCareOpened = useOpenedOnce(isSelfCareOpen);
const kidPlansOpened = useOpenedOnce(isKidPlansOpen);

// Magic-link / gate emails redirect here with ?app=1 so returning users
// land back inside the concierge modal instead of a bare homepage.
useEffect(() => {
if (typeof window === 'undefined') return;
const params = new URLSearchParams(window.location.search);
if (params.get('app') === '1') {
setIsInquireOpen(true);
}
if (params.get('selfcare') === '1') {
setIsSelfCareOpen(true);
}
if (params.get('kidplans') === '1') {
setIsKidPlansOpen(true);
}
}, []);

// WebMCP: register real product actions as agent-callable tools. Purely
// additive and experimental (Chrome origin trial as of 2026); no-ops
// safely in every other browser since it just returns early below.
useEffect(() => {
const modelContext = (typeof document !== 'undefined' && (document as any).modelContext)
|| (typeof navigator !== 'undefined' && (navigator as any).modelContext);
if (!modelContext || typeof modelContext.registerTool !== 'function') return;

const tools = [
{
name: 'open_swoon_her_planner',
description: "Open the Swoon Her date-planning quiz. Use when the user wants to plan a romantic date night for a partner. Answers 20 quick questions to generate a custom itinerary with real venues and reservation links.",
inputSchema: { type: 'object', properties: {}, required: [] },
execute: async () => { setIsInquireOpen(true); return { opened: 'swoon_her' }; },
},
{
name: 'open_self_care_planner',
description: "Open the Self Care solo date-planning quiz. Use when the user wants to plan a solo day or night out for themselves, built around their own vibe and budget.",
inputSchema: { type: 'object', properties: {}, required: [] },
execute: async () => { setIsSelfCareOpen(true); return { opened: 'self_care' }; },
},
{
name: 'open_kid_plan_planner',
description: "Open the Kid Plan family activity quiz. Use when the user wants weekend activity ideas for a child, matched to the kid's personality, for ages 0-18.",
inputSchema: { type: 'object', properties: {}, required: [] },
execute: async () => { setIsKidPlansOpen(true); return { opened: 'kid_plan' }; },
},
];

tools.forEach((tool) => {
try { modelContext.registerTool(tool); } catch { /* ignore */ }
});

return () => {
tools.forEach((tool) => {
try { modelContext.unregisterTool && modelContext.unregisterTool(tool.name); } catch { /* ignore */ }
});
};
}, []);

// Current route. ssrPath is set at build time (src/entry-server.tsx) so every
// route below can be prerendered with its real content; in the browser it is
// always undefined and window.location is used.
const ssrOrBrowserPath = ssrPath ?? (typeof window !== 'undefined' ? window.location.pathname : null);
const routePath = ssrOrBrowserPath ? ssrOrBrowserPath.replace(/\/+$/, '') || '/' : '/';
const goHome = () => { window.location.href = '/'; };

// Standalone article pages. Routed at /blog/:slug (see vercel.json
// rewrite) so every post has its own real, shareable URL instead of
// living inside a modal.
const blogSlugMatch = routePath.match(/^\/blog\/([^/]+)$/);
if (blogSlugMatch) {
return <Lazy k="blogPost" slug={blogSlugMatch[1]} />;
}

// Post-checkout landing. Stripe's success_url sends buyers to /welcome; this
// SPA renders the confirmation screen for that path instead of the funnel.
if (routePath === '/welcome') {
return <Lazy k="welcome" />;
}

if (routePath === '/register') {
return <Lazy k="register" />;
}

// Standalone legal pages, routed at /terms and /privacy (see vercel.json
// rewrite) so they have real, shareable, crawlable URLs instead of living
// in a modal.
if (routePath === '/terms') {
return <Lazy k="terms" />;
}

if (routePath === '/privacy') {
return <Lazy k="privacy" />;
}

// Swoon Type quiz + results, routed at /swoon-type (see vercel.json
// rewrite). A shared results link carries ?v=&p=&e= so it opens straight
// to results instead of the quiz. Also reachable from the homepage dual
// entry without a full navigation, via isSwoonTypeOpen below.
if (routePath === '/swoon-type') {
const sharedScores = readScoresFromQuery();
return (
<>
{/* The quiz screen's visible title is an h2; the results screen has its own h1. */}
{!sharedScores && <h1 className="sr-only">Swoon Type quiz: find your date night type</h1>}
<Lazy k="swoonType" onClose={goHome} initialScores={sharedScores} />
</>
);
}

// Kid Plans quiz, routed at /kid-plans (see vercel.json rewrite) so it has
// a real, shareable URL. Also reachable from the homepage dual entry
// without a full navigation, via isKidPlansOpen below.
if (routePath === '/kid-plans') {
return (
<>
<h1 className="sr-only">Kid Plans: weekend activity ideas matched to your kid</h1>
<Lazy k="kidPlans" isOpen={true} onClose={goHome} />
</>
);
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

if (isSwoonTypeOpen) {
return <Lazy k="swoonType" fallback={<ModalLoading />} onClose={() => setIsSwoonTypeOpen(false)} />;
}

return (
<div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816] relative flex flex-col">
{/* Audio Engine */}
<AudioPlayer isPlaying={isAudioPlaying} />

{/* Side Rail Accents matching Sleek Interface Theme */}
<aside className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 origin-left -rotate-90 text-[9px] uppercase tracking-[0.4em] text-[#8C8377] font-sans pointer-events-none z-30 opacity-60 font-medium">
PLAN GLEE
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
{/* The page's single H1. The hero headline rotates every few seconds, so it
    is styled text rather than a heading; this names what the page is. */}
<h1 className="sr-only">Plan Glee: custom date nights, self-care days and kid activity plans with real venues</h1>
<HeroSection
onOpenLightbox={handleOpenLightboxByPhoto}
onOpenInquire={() => setIsInquireOpen(true)}
onOpenSwoonType={() => setIsSwoonTypeOpen(true)}
onOpenSelfCare={() => setIsSelfCareOpen(true)}
onOpenKidPlans={() => setIsKidPlansOpen(true)}
/>
<PathwayMessagingSection
  onOpenSwoonHer={() => setIsInquireOpen(true)}
  onOpenSelfCare={() => setIsSelfCareOpen(true)}
  onOpenKidPlans={() => setIsKidPlansOpen(true)}
/>
<ThreeStepSection onOpenInquire={() => setIsInquireOpen(true)} />
<HusbandsTestimonialsSection />
<PricingSection onOpenInquire={() => setIsInquireOpen(true)} />
</>
)}

{activeTab === 'itineraries' && (
<>
<Lazy k="itineraries" fallback={<div className="min-h-[60vh]" />} onOpenInquire={() => setIsInquireOpen(true)} />
<AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
</>
)}

{activeTab === 'blog' && (
<>
<Lazy k="blogIndex" fallback={<div className="min-h-[60vh]" />} onOpenInquire={() => setIsInquireOpen(true)} />
<AppProcessSection onOpenInquire={() => setIsInquireOpen(true)} />
</>
)}

</main>

{/* Minimal Footer */}
<footer className="bg-[#FAF8F5] text-[#1A1816] py-16 px-6 sm:px-12 border-t border-[#E8E2D9] mt-20 relative z-20">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
<div className="text-center md:text-left space-y-1">
<img src="/images/planglee-logo-300w.webp" width={300} height={133} alt="Plan Glee" loading="lazy" className="h-14 sm:h-16 w-auto mx-auto md:mx-0" />
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
className="p-2 -m-2 text-[#6E675F] hover:text-[#B89860] transition-colors"
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

{/* Real links (not buttons) so crawlers can reach the Journal and the
    standalone planner pages from every page. */}
<nav aria-label="Footer" className="max-w-7xl mx-auto mt-10 flex flex-wrap items-center justify-center md:justify-start gap-x-7 gap-y-3 text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
<a href="/blog" className="text-[#B89860] hover:underline">Journal</a>
<a href="/kid-plans" className="text-[#B89860] hover:underline">Kid Plans</a>
<a href="/swoon-type" className="text-[#B89860] hover:underline">Swoon Type Quiz</a>
</nav>

<div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between text-[9px] uppercase tracking-[0.25em] font-sans text-[#8C8377] gap-4">
<div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
<span>© {new Date().getFullYear()} PLAN GLEE CONCIERGE • A DIVISION OF FOR LOVE COACHING. ALL RIGHTS RESERVED.</span>
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

{/* Interactive Quiz + Date Plan Generator (code-split; loads on first open) */}
<Lazy
k="date"
load={dateOpened}
fallback={isInquireOpen ? <ModalLoading /> : null}
isOpen={isInquireOpen}
onClose={() => setIsInquireOpen(false)}
/>

{/* Self Care concierge */}
<Lazy
k="selfCare"
load={selfCareOpened}
fallback={isSelfCareOpen ? <ModalLoading /> : null}
isOpen={isSelfCareOpen}
onClose={() => setIsSelfCareOpen(false)}
/>

{/* Kid Plans concierge */}
<Lazy
k="kidPlans"
load={kidPlansOpened}
fallback={isKidPlansOpen ? <ModalLoading /> : null}
isOpen={isKidPlansOpen}
onClose={() => setIsKidPlansOpen(false)}
/>
</div>
);
}
