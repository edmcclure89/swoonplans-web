import React, { useState } from 'react';
import { Heart, Send, Copy, Check, MessageSquare, Sparkles, Shield, Gift, Share2, EyeOff } from 'lucide-react';

interface ForWomenSectionProps {
onOpenInquire: () => void;
}

export const ForWomenSection: React.FC<ForWomenSectionProps> = ({ onOpenInquire }) => {
const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
const [emailForm, setEmailForm] = useState({ partnerEmail: '', partnerName: '', hintText: "I found this date concierge for guys and thought you'd love it..." });
const [emailSent, setEmailSent] = useState(false);

const hints = [
{
id: 1,
title: 'The Subtle Wink',
text: "Hey babe, saw this date concierge for guys that plans turnkey date nights and thought of you 😉 makeherswoon.com"
},
{
id: 2,
title: 'The Direct Wishlist',
text: "Hint hint for our next date night... First plan is free! Check out makeherswoon.com"
},
{
id: 3,
title: 'The Group Chat Recommendation',
text: "A friend was just telling me about this concierge that plans rooftop dates with direct reservation links. Look at makeherswoon.com!"
}
];

const handleCopy = (text: string, index: number) => {
navigator.clipboard.writeText(text);
setCopiedIndex(index);
setTimeout(() => setCopiedIndex(null), 2500);
};

const handleSendNudge = (e: React.FormEvent) => {
e.preventDefault();
if (!emailForm.partnerEmail) return;
setEmailSent(true);
setTimeout(() => {
setEmailSent(false);
setEmailForm({ partnerEmail: '', partnerName: '', hintText: "I found this date concierge for guys and thought you'd love it..." });
}, 4000);
};

return (
<section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
{/* Header Banner */}
<div className="bg-[#FAF8F5] text-[#1A1816] rounded-sm p-8 sm:p-12 border border-[#D5C29F]/40 text-center max-w-4xl mx-auto mb-16 shadow-xl relative overflow-hidden">
<div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D5C29F]/10 rounded-full filter blur-2xl pointer-events-none" />

<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D5C29F]/20 text-[#B89860] border border-[#D5C29F]/30 rounded-full text-[10px] uppercase tracking-[0.35em] font-sans mb-4 font-bold">
<EyeOff className="w-3.5 h-3.5 text-[#B89860]" />
<span>FOR WOMEN ONLY • DISCREET NUDGE</span>
</div>

<h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic leading-tight mb-4">
Give Him the Cheat Code to Your Dream Date Night
</h2>

<p className="text-xs sm:text-sm text-[#6E675F] font-sans max-w-2xl mx-auto font-light leading-relaxed mb-6">
You love a man who takes initiative, books the table, and handles every detail. Swoon Plans gives him curated date plans with direct reservation links and zero stress—making him look like a hero while you get the romantic evening you deserve.
</p>

<div className="flex flex-wrap justify-center gap-4 text-xs font-sans">
<span className="bg-[#D5C29F]/10 px-3 py-1.5 rounded border border-[#D5C29F]/30 text-[#B89860] flex items-center gap-1.5 font-medium">
<Sparkles className="w-3.5 h-3.5" />
<span>100% Discreet & Effortless</span>
</span>
<span className="bg-[#D5C29F]/10 px-3 py-1.5 rounded border border-[#D5C29F]/30 text-[#B89860] flex items-center gap-1.5 font-medium">
<Gift className="w-3.5 h-3.5" />
<span>His First Plan Is Free</span>
</span>
</div>
</div>

{/* 3 Quick Ways to Nudge Him */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
<div className="bg-[#EFEDEB]/60 border border-[#E8E2D9] p-6 rounded space-y-3">
<div className="w-10 h-10 bg-[#1A1816] text-[#D5C29F] rounded-full flex items-center justify-center font-bold text-sm">
01
</div>
<h3 className="text-lg font-serif italic text-[#1A1816]">Send a Quick Text</h3>
<p className="text-xs text-[#6E675F] font-sans font-light leading-relaxed">
Copy one of our pre-written text hints below and drop it in his messages.
</p>
</div>

<div className="bg-[#EFEDEB]/60 border border-[#E8E2D9] p-6 rounded space-y-3">
<div className="w-10 h-10 bg-[#1A1816] text-[#D5C29F] rounded-full flex items-center justify-center font-bold text-sm">
02
</div>
<h3 className="text-lg font-serif italic text-[#1A1816]">Send an Anonymous Nudge</h3>
<p className="text-xs text-[#6E675F] font-sans font-light leading-relaxed">
Use our discreet email tool to send him an intriguing invitation to Swoon Plans.
</p>
</div>

<div className="bg-[#EFEDEB]/60 border border-[#E8E2D9] p-6 rounded space-y-3">
<div className="w-10 h-10 bg-[#1A1816] text-[#D5C29F] rounded-full flex items-center justify-center font-bold text-sm">
03
</div>
<h3 className="text-lg font-serif italic text-[#1A1816]">Enjoy The Evening</h3>
<p className="text-xs text-[#6E675F] font-sans font-light leading-relaxed">
Sit back as he answers 20 questions, receives exact venue details, and takes you out.
</p>
</div>
</div>

{/* Interactive Text Nudge Cards */}
<div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded p-6 sm:p-10 mb-16 space-y-6">
<div>
<span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] font-bold">
1-CLICK TEXT MESSAGES
</span>
<h3 className="text-2xl sm:text-3xl font-serif italic text-[#1A1816] mt-1">
Pick a Subtle Text to Send Him
</h3>
<p className="text-xs text-[#6E675F] font-sans mt-1">
Click to copy any text directly to your clipboard.
</p>
</div>

<div className="space-y-4">
{hints.map((hint, idx) => (
<div
key={hint.id}
className="p-4 bg-white rounded border border-[#E8E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
>
<div className="space-y-1">
<span className="text-[10px] uppercase tracking-widest font-sans font-bold text-[#D5C29F] bg-[#1A1816] px-2 py-0.5 rounded">
{hint.title}
</span>
<p className="text-xs sm:text-sm font-sans text-[#38332E] italic pt-1">
"{hint.text}"
</p>
</div>

<button
onClick={() => handleCopy(hint.text, idx)}
className={`px-4 py-2 text-xs font-sans uppercase tracking-wider font-bold rounded cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
copiedIndex === idx
? 'bg-green-700 text-white'
: 'bg-[#1A1816] text-[#D5C29F] hover:bg-[#38332E]'
}`}
>
{copiedIndex === idx ? (
<>
<Check className="w-3.5 h-3.5" />
<span>COPIED!</span>
</>
) : (
<>
<Copy className="w-3.5 h-3.5" />
<span>COPY TEXT</span>
</>
)}
</button>
</div>
))}
</div>
</div>

{/* Discreet Email Nudge Form */}
<div className="bg-[#FAF8F5] text-[#1A1816] rounded p-6 sm:p-10 border border-[#D5C29F]/40 max-w-3xl mx-auto space-y-6 shadow-lg">
<div className="text-center space-y-2">
<Share2 className="w-6 h-6 text-[#B89860] mx-auto" />
<h3 className="text-2xl sm:text-3xl font-serif italic text-[#1A1816]">
Send Him an Anonymous Email Nudge
</h3>
<p className="text-xs text-[#6E675F] font-sans max-w-lg mx-auto">
We’ll send him a clean, elegant email inviting him to claim his free date plan on Swoon Plans. We won't sell or spam his email address.
</p>
</div>

{emailSent ? (
<div className="p-6 bg-[#D5C29F]/20 border border-[#D5C29F] text-center rounded space-y-2">
<Sparkles className="w-6 h-6 text-[#B89860] mx-auto animate-bounce" />
<p className="text-sm font-serif italic text-[#1A1816]">
Nudge sent successfully!
</p>
<p className="text-xs text-[#6E675F] font-sans">
He'll receive an invitation to create a custom date plan.
</p>
</div>
) : (
<form onSubmit={handleSendNudge} className="space-y-4">
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<div>
<label className="block text-[10px] uppercase tracking-widest text-[#B89860] font-sans font-bold mb-1">
HIS EMAIL ADDRESS *
</label>
<input
type="email"
required
placeholder="partner@example.com"
value={emailForm.partnerEmail}
onChange={(e) => setEmailForm({ ...emailForm, partnerEmail: e.target.value })}
className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded text-xs text-[#1A1816] placeholder-[#B5ADA2] focus:outline-none focus:border-[#D5C29F]"
/>
</div>

<div>
<label className="block text-[10px] uppercase tracking-widest text-[#B89860] font-sans font-bold mb-1">
YOUR NAME (OPTIONAL)
</label>
<input
type="text"
placeholder="Leave blank for Anonymous"
value={emailForm.partnerName}
onChange={(e) => setEmailForm({ ...emailForm, partnerName: e.target.value })}
className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded text-xs text-[#1A1816] placeholder-[#B5ADA2] focus:outline-none focus:border-[#D5C29F]"
/>
</div>
</div>

<div>
<label className="block text-[10px] uppercase tracking-widest text-[#B89860] font-sans font-bold mb-1">
INCLUDED NOTE
</label>
<textarea
rows={2}
value={emailForm.hintText}
onChange={(e) => setEmailForm({ ...emailForm, hintText: e.target.value })}
className="w-full px-3 py-2.5 bg-white border border-[#E8E2D9] rounded text-xs text-[#1A1816] focus:outline-none focus:border-[#D5C29F]"
/>
</div>

<button
type="submit"
className="w-full py-3 bg-[#D5C29F] hover:bg-[#c4af89] text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded transition-colors cursor-pointer flex items-center justify-center gap-2"
>
<Send className="w-4 h-4" />
<span>SEND HIM A SUBTLE NUDGE</span>
</button>
</form>
)}
</div>

{/* Quotes from Women */}
<div className="mt-16 pt-12 border-t border-[#E8E2D9] grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
<div className="p-6 bg-[#EFEDEB]/60 rounded border border-[#E8E2D9] space-y-2">
<p className="text-xs sm:text-sm font-serif italic text-[#1A1816]">
"I texted him the link on a Wednesday, and by Friday he had booked a sunset rooftop dinner at the perfect candlelit spot. Swoon Plans is a cheat code!"
</p>
<p className="text-[10px] uppercase tracking-widest text-[#8C8377] font-sans font-bold">
— Elena V., New York
</p>
</div>

<div className="p-6 bg-[#EFEDEB]/60 rounded border border-[#E8E2D9] space-y-2">
<p className="text-xs sm:text-sm font-serif italic text-[#1A1816]">
"He thought he came up with the whole idea himself! Best date we've had in 3 years. Thank you Swoon Plans!"
</p>
<p className="text-[10px] uppercase tracking-widest text-[#8C8377] font-sans font-bold">
— Chloe R., Los Angeles
</p>
</div>
</div>
</section>
);
};
