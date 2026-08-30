import React, { useState, useEffect } from 'react';
import { HERO_SLIDES } from '../data/portfolio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
onOpenLightbox?: (photo: any) => void;
onOpenInquire: () => void;
onOpenSwoonType: () => void;
onOpenSelfCare: () => void;
onOpenKidPlans: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInquire, onOpenSwoonType, onOpenSelfCare, onOpenKidPlans }) => {
const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
const timer = setInterval(() => {
setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
}, 6000);
return () => clearInterval(timer);
}, []);

const activeSlide = HERO_SLIDES[currentIndex];

return (
<section className="relative w-full px-4 sm:px-8 pt-4 pb-6 flex flex-col justify-between">
<div className="relative min-h-[72vh] sm:min-h-[80vh] rounded-sm overflow-hidden group bg-[#1A1816] border border-[#E8E2D9] shadow-sm flex items-center justify-center">
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
className="w-full h-full object-cover object-center filter brightness-[1.1] contrast-[1.02]"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/20" />
<div className="absolute inset-0 bg-grain pointer-events-none" />
</div>
))}

{/* Single review badge, top-right corner */}
<div className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-lg px-4 py-2.5 max-w-[220px] text-left hidden sm:block">
<div className="text-[#E08B6F] text-xs mb-1">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
<p className="font-sans text-xs text-[#E8E2D9] leading-snug">"Planned an unforgettable anniversary in under two minutes without a single argument."</p>
<p className="font-sans text-[10px] text-[#B5ADA2] mt-1">&#mdash; Marcus T.</p>
</div>

{/* Dual-entry overlay content */}
<div className="relative z-10 w-full px-6 sm:px-10 py-16 sm:py-20 text-center">
<h1 className="text-3xl sm:text-5xl font-serif italic font-light text-white mt-4 mb-4 max-w-3xl mx-auto leading-tight drop-shadow-lg">
{activeSlide.headline}
</h1>
<p className="font-sans text-[#E8E2D9] max-w-xl mx-auto mb-10 sm:mb-12">
{activeSlide.subheadline}
</p>

<div className="grid sm:grid-cols-3 gap-5 max-w-5xl mx-auto text-left">
<button
onClick={onOpenSelfCare}
className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 hover:border-[#E08B6F] rounded-2xl p-6 sm:p-8 transition-colors"
>
<span className="text-[10px] uppercase tracking-widest font-sans text-[#E08B6F] font-bold">
For Her, Solo
</span>
<h2 className="font-serif italic text-2xl mt-2 mb-3 text-white">
Self Care
</h2>
<p className="font-sans text-sm text-[#E2D5C3] font-bold mb-2">
Reclaim your time. Reward your soul.
</p>
<ul className="font-sans text-xs text-[#E2D5C3] space-y-1 list-disc pl-4">
<li>Zero mental load required</li>
<li>Curated to reset, recharge, and spoil yourself</li>
<li>Built entirely around your exact vibe</li>
</ul>
</button>

<button
onClick={onOpenInquire}
className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 hover:border-[#D5C29F] rounded-2xl p-6 sm:p-8 transition-colors"
>
<span className="text-[10px] uppercase tracking-widest font-sans text-[#D5C29F] font-bold">
For Him
</span>
<h2 className="font-serif italic text-2xl mt-2 mb-3 text-white">
Swoon Her
</h2>
<p className="font-sans text-sm text-[#E2D5C3] font-bold mb-2">
Look like a genius without lifting a finger.
</p>
<ul className="font-sans text-xs text-[#E2D5C3] space-y-1 list-disc pl-4">
<li>Stop the endless scrolling and guessing</li>
<li>A tailored date night planned in 90 seconds</li>
<li>Your ultimate competitive advantage</li>
</ul>
</button>

<button
onClick={onOpenKidPlans}
className="group relative bg-[#5FD068]/10 hover:bg-[#5FD068]/20 backdrop-blur-md border border-[#5FD068]/25 hover:border-[#5FD068] rounded-2xl p-6 sm:p-8 transition-colors"
>
<svg
viewBox="0 0 100 100"
className="absolute -top-5 -right-5 w-20 h-20 sm:w-24 sm:h-24 drop-shadow-lg pointer-events-none rotate-[8deg]"
aria-hidden="true"
>
<polygon
points="50.0,0.0 57.8,21.0 75.0,6.7 71.2,28.8 93.3,25.0 79.0,42.2 100.0,50.0 79.0,57.8 93.3,75.0 71.2,71.2 75.0,93.3 57.8,79.0 50.0,100.0 42.2,79.0 25.0,93.3 28.8,71.2 6.7,75.0 21.0,57.8 0.0,50.0 21.0,42.2 6.7,25.0 28.8,28.8 25.0,6.7 42.2,21.0"
fill="#FFC629"
stroke="#1A1816"
strokeWidth="2.5"
strokeLinejoin="round"
/>
<text
x="50"
y="46"
textAnchor="middle"
fontFamily="Arial, sans-serif"
fontWeight="900"
fontSize="17"
fill="#D2232A"
stroke="#1A1816"
strokeWidth="0.6"
>
ALL
</text>
<text
x="50"
y="64"
textAnchor="middle"
fontFamily="Arial, sans-serif"
fontWeight="900"
fontSize="17"
fill="#D2232A"
stroke="#1A1816"
sstrokeWidth="0.6"
>
NEW
</text>
</svg>
<span className="text-[10px] uppercase tracking-widest font-sans text-[#5FD068] font-bold">
For Their Kids &middot; 0&ndash;18
</span>
<h2 className="font-serif italic text-2xl mt-2 mb-3 text-white">
Kid Plan
</h2>
<p className="font-sans text-sm text-[#E2D5C3] font-bold mb-2">
Be the cool parent. Skip the planning panic.
</p>
<ul className="font-sans text-xs text-[#E2D5C3] space-y-1 list-disc pl-4">
<li>Eradicate the chaos of keeping everyone entertained</li>
<li>Custom family plans, zero guesswork</li>
<li>Leaves the group chat green with envy</li>
</ul>
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
)
;}

