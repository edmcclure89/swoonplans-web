import React, { useState } from 'react';
import { BookOpen, ArrowRight, ChevronRight, Share2, Check } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';

interface BlogSectionProps {
onOpenInquire: () => void;
}

// Each post now lives at its own standalone, shareable URL (see
// BlogPostPage.tsx + the /blog/:slug rewrite in vercel.json). This section
// is just an index of cards linking out to those pages.
export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenInquire }) => {
const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
const posts = BLOG_POSTS;
const featured = posts[0];
const rest = posts.slice(1);

const sharePost = async (slug: string, title: string) => {
const url = `${window.location.origin}/blog/${slug}`;
if (navigator.share) {
try {
await navigator.share({ title, url });
return;
} catch {
/* user cancelled, fall through to copy */
}
}
try {
await navigator.clipboard.writeText(url);
} catch {
const ta = document.createElement('textarea');
ta.value = url;
ta.style.position = 'absolute';
ta.style.left = '-9999px';
document.body.appendChild(ta);
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
}
setCopiedSlug(slug);
setTimeout(() => setCopiedSlug((s) => (s === slug ? null : s)), 2000);
};

return (
<section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
{/* Header */}
<div className="text-center max-w-2xl mx-auto mb-12">
<div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] border border-[#D5C29F]/30 rounded-full text-[10px] uppercase tracking-[0.35em] font-sans mb-3">
<BookOpen className="w-3.5 h-3.5" />
<span>SWOON PLANS JOURNAL</span>
</div>
<h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic">
The Date Planning Journal
</h2>
<p className="text-xs sm:text-sm text-[#6E675F] font-sans mt-3 font-light leading-relaxed">
Insider guides, romance psychology, and effortless date night strategies for the modern gentleman.
</p>
<div className="w-12 h-px bg-[#D5C29F] mx-auto mt-6" />
</div>

{/* Featured Blog Card */}
<div className="mb-16 bg-[#FAF8F5] text-[#1A1816] rounded-sm p-6 sm:p-10 border border-[#D5C29F]/40 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg">
<div className="lg:col-span-7 space-y-4">
<div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-sans text-[#B89860]">
<span className="bg-[#D5C29F]/20 px-2.5 py-1 rounded border border-[#D5C29F]/30 font-bold">
FEATURED GUIDE
</span>
<span>•</span>
<span>{featured.readTime}</span>
</div>
<h3 className="text-2xl sm:text-4xl font-serif italic font-light text-[#1A1816] leading-tight">
{featured.title}
</h3>
<p className="text-xs sm:text-sm text-[#6E675F] font-sans font-light leading-relaxed">
{featured.summary}
</p>

<div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
<a
href={`/blog/${featured.slug}`}
className="px-6 py-3 bg-[#D5C29F] hover:bg-[#c4af89] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors flex items-center justify-center gap-2"
>
<span>READ FULL ARTICLE</span>
<ArrowRight className="w-4 h-4" />
</a>
<button
onClick={() => sharePost(featured.slug, featured.title)}
className="px-6 py-3 bg-[#1A1816]/5 hover:bg-[#1A1816]/10 text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors border border-[#E8E2D9] text-center flex items-center justify-center gap-2"
>
{copiedSlug === featured.slug ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
{copiedSlug === featured.slug ? 'LINK COPIED' : 'SHARE'}
</button>
</div>
</div>

<div className="lg:col-span-5 relative rounded overflow-hidden h-72 border border-[#E8E2D9]">
<img
src={featured.image}
alt={featured.title}
className="w-full h-full object-cover"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
<div className="absolute bottom-4 left-4 right-4 text-xs font-serif italic text-[#D5C29F]">
"Answer 20 targeted questions to unlock your custom date plan."
</div>
</div>
</div>

{/* Grid of remaining articles */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{rest.map((post) => (
<div
key={post.id}
className="group bg-[#EFEDEB]/60 border border-[#E8E2D9] rounded-sm overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
>
<a href={`/blog/${post.slug}`} className="block cursor-pointer">
<div className="relative h-48 overflow-hidden">
<img
src={post.image}
alt={post.title}
className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />
<div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[9px] uppercase tracking-[0.25em] font-sans text-[#D5C29F]">
{post.category}
</div>
</div>

<div className="p-6 space-y-3">
<div className="flex items-center justify-between text-[10px] font-sans text-[#8C8377]">
<span>{post.date}</span>
<span>{post.readTime}</span>
</div>
<h3 className="text-xl font-serif italic text-[#1A1816] group-hover:text-[#8C8377] transition-colors">
{post.title}
</h3>
<p className="text-xs text-[#6E675F] font-sans font-light leading-relaxed line-clamp-3">
{post.summary}
</p>
</div>
</a>

<div className="px-6 pb-6 pt-2 border-t border-[#E8E2D9]/50 flex items-center justify-between text-xs font-sans font-bold text-[#1A1816]">
<a href={`/blog/${post.slug}`} className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-1 hover:text-[#8C8377] transition-colors">
READ GUIDE
<ChevronRight className="w-4 h-4 text-[#D5C29F] group-hover:translate-x-1 transition-transform" />
</a>
<button
onClick={() => sharePost(post.slug, post.title)}
className="p-1.5 text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
aria-label={`Share ${post.title}`}
title="Share this article"
>
{copiedSlug === post.slug ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
</button>
</div>
</div>
))}
</div>

<div className="text-center mt-12">
<button
onClick={onOpenInquire}
className="px-8 py-3.5 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm cursor-pointer transition-colors"
>
GET YOUR FIRST PLAN FREE
</button>
</div>
</section>
);
};
