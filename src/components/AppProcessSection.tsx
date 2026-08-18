import React from 'react';
import { Calendar, Zap, Heart, Smartphone, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface AppProcessSectionProps {
onOpenInquire: () => void;
}

export const AppProcessSection: React.FC<AppProcessSectionProps> = ({ onOpenInquire }) => {
const steps = [
{
number: '01',
title: 'Answer 20 questions about her',
icon: Calendar,
badge: '20 Targeted Questions'
},
{
number: '02',
title: 'Select budget',
icon: DollarSign,
badge: '$ to $$$$'
},
{
number: '03',
title: 'Receive custom date plan',
icon: FileText,
badge: 'Tailored Blueprint'
},
{
number: '04',
title: '1-Click booking & reservation',
icon: Zap,
badge: 'OpenTable & Resy Links'
},
{
number: '05',
title: 'She texts her girls to brag about you...',
icon: Heart,
badge: 'Unforgettable Date'
}
];

return (
<section className="py-6 sm:py-8 px-4 sm:px-8 bg-[#FAF8F5] text-[#1A1816] relative overflow-hidden my-2 sm:my-4 rounded-sm border-y border-[#E8E2D9]">
{/* Background Subtle Accents */}
<div className="absolute top-0 right-0 w-96 h-96 bg-[#D5C29F]/10 rounded-full filter blur-3xl pointer-events-none" />

<div className="max-w-5xl mx-auto relative z-10">
{/* Section Header */}
<div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D5C29F]/10 border border-[#D5C29F]/30 rounded-full text-[10px] uppercase tracking-[0.3em] text-[#B89860] font-sans">
<Smartphone className="w-3.5 h-3.5" />
<span>HOW THE APP WORKS</span>
</div>
<h2 className="text-2xl sm:text-3xl font-serif font-light text-[#1A1816] italic">
Simple Steps to Date Night Perfection
</h2>
</div>

{/* 5 Steps Full Width Stack */}
<div className="space-y-2.5 max-w-3xl mx-auto">
{steps.map((step) => {
const Icon = step.icon;
return (
<div
key={step.number}
className="p-4 sm:p-5 rounded bg-white border border-[#E8E2D9] hover:border-[#D5C29F]/60 transition-all flex items-center justify-between gap-4 shadow-sm"
>
<div className="flex items-center gap-4">
<span className="text-xs sm:text-sm font-sans font-bold tracking-widest px-2.5 py-1 rounded bg-[#D5C29F] text-[#1A1816] shrink-0">
{step.number}
</span>
<h3 className="text-base sm:text-lg font-serif text-[#1A1816] italic font-normal">
{step.title}
</h3>
</div>
<div className="flex items-center gap-2">
<span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-sans text-[#B89860] bg-[#D5C29F]/10 px-2.5 py-1 rounded border border-[#D5C29F]/30">
{step.badge}
</span>
<div className="p-2 rounded-full bg-[#D5C29F]/10 text-[#B89860] shrink-0">
<Icon className="w-4 h-4 sm:w-5 sm:h-5" />
</div>
</div>
</div>
);
})}
</div>

{/* CTA Button */}
<div className="mt-6 text-center">
<button
onClick={onOpenInquire}
className="px-6 py-2.5 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-xs cursor-pointer transition-all shadow-md border border-[#D5C29F]"
>
GET YOUR FIRST PLAN FREE
</button>
</div>
</div>
</section>
);
};
