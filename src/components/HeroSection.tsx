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
className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05]"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/50" />
<div className="absolute inset-0 bg-grain pointer-events-none" />
</div>
))}

{/* Dual-entry overlay content */}
<div className="relative z-10 w-full px-6 sm:px-10 py-16 sm:py-20 text-center">
<span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#E2D5C3] font-bold">
Swoon Plans
</span>
<h1 className="text-3xl sm:text-5xl font-serif italic font-light text-white mt-4 mb-6 max-w-3xl mx-auto leading-tight drop-shadow-lg">
Every great date starts with being understood.
</h1>
<p className="font-sans text-[#E8E2D9] max-w-xl mx-auto mb-10 sm:mb-12">
Choose your path. All three take under two minutes.
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
<p className="font-sans text-sm text-[#E2D5C3]">
Plan your own solo day or night out, built around your vibe and your budget. First 3 plans free.
</p>
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
<p className="font-sans text-sm text-[#E2D5C3]">
Answer a few quick questions about her, get a full itinerary with real venues and reservation links.
</p>
</button>

<button
onClick={onOpenKidPlans}
className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 hover:border-[#5FD068] rounded-2xl p-6 sm:p-8 transition-colors"
>
<span className="text-[10px] uppercase tracking-widest font-sans text-[#5FD068] font-bold">
For Their Kids &middot; Newborn&ndash;18
</span>
<h2 className="font-serif italic text-2xl mt-2 mb-3 text-white">
Kid Plans
</h2>
<p className="font-sans text-sm text-[#E2D5C3]">
12 quick questions about their personality, not just their age, so the plan sounds like you actually get them.
</p>
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
