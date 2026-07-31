import React, { useState } from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles, CheckCircle2, ChevronRight, User, Share2 } from 'lucide-react';

interface BlogSectionProps {
  onOpenInquire: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  summary: string;
  content: string[];
  keyTakeaway: string;
  image: string;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ onOpenInquire }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = [
    {
      id: 'post-1',
      title: '4 Simple Steps to Date Night Perfection',
      category: 'CONCIERGE GUIDE',
      readTime: '4 min read',
      date: 'JULY 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_african_american_couple_1785457444161.jpg',
      summary: 'No research, no stress, no guesswork. The ultimate tool for men to effortlessly create unforgettable, swoon-worthy dates and capture lasting memories.',
      keyTakeaway: 'Answer 15 short questions to unlock a custom date plan with direct reservation links and exact venue addresses.',
      content: [
        'Step 1: Pick The Vibe & Date Idea — Choose from hand-curated romantic atmospheres, whether it’s a candlelit rooftop, a private sunset beach setup, or a secret garden lounge.',
        'Step 2: Direct Reservation Links — Swoon Plans hands you the exact venue, address, and a direct link to book on OpenTable, Resy, or the venue\'s own site, so you can lock it in yourself in seconds.',
        'Step 3: Show Up Prepared — Receive exact addresses, parking notes, and timing tips so your evening moves without a single hitch.',
        'Step 4: Swoon & Relive The Magic — Watch her beam with genuine joy while you take 100% credit for an unforgettable, perfectly executed evening.'
      ]
    },
    {
      id: 'post-2',
      title: 'The Psychology of an Unforgettable Date Atmosphere',
      category: 'ROMANCE STRATEGY',
      readTime: '5 min read',
      date: 'JUNE 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_hispanic_couple_1785457480644.jpg',
      summary: 'Why lighting, seating angles, and acoustic warmth dictate romantic chemistry far more than expensive menu items.',
      keyTakeaway: 'A corner booth with warm amber light and low ambient jazz generates 3x more emotional intimacy than a crowded noisy room.',
      content: [
        'Most men focus exclusively on restaurant prestige or price tags, but research in environmental psychology proves that physical intimacy is governed by spatial warmth.',
        '1. Seating Orientation: Side-by-side or right-angle corner booths lower defensive body posture compared to face-to-face interrogation-style dining tables.',
        '2. Illuminance Levels: Candlelight and low amber lighting (below 2700K) dilate pupils, which humans subconsciously process as high attraction and deep affection.',
        '3. Acoustic Comfort: Decibel levels above 70dB force shouting, raising cortisol. Acoustic warmth allows quiet whispers that create instant private worlds.'
      ]
    },
    {
      id: 'post-3',
      title: 'Why Direct Reservation Links Change the Entire Evening',
      category: 'EXECUTIVE ETIQUETTE',
      readTime: '3 min read',
      date: 'MAY 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_asian_couple_1785457457487.jpg',
      summary: 'How having the exact venue and a direct booking link ready to go eliminates awkward last-minute scrambling.',
      keyTakeaway: 'Showing up with a reservation already booked signals more confidence than any pickup line ever will.',
      content: [
        'There is no faster way to kill date momentum than standing by a noisy host stand with no reservation, hoping for a table.',
        'Swoon Plans gives you the exact venue, address, and a direct link to book it yourself on OpenTable, Resy, or the venue\'s own site, days before the date.',
        'When you arrive with a confirmed reservation already in hand, the whole night starts smoother.',
        'That kind of preparation demonstrates foresight, confidence, and respect for her time.'
      ]
    },
    {
      id: 'post-4',
      title: '3 Conversation Starters That Spark Genuine Romance',
      category: 'CONNECTION & TALK',
      readTime: '4 min read',
      date: 'APRIL 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_mixed_race_couple1_1785457469307.jpg',
      summary: 'Move past routine work updates and domestic logistics with intentional questions that awaken emotional passion.',
      keyTakeaway: 'Ask questions that invite nostalgia, future dreams, and playful imagination rather than daily stress.',
      content: [
        'When couples get busy, conversations easily revert to logistics: schedule updates, household errands, and work stress.',
        'Prompt 1: "If we could wake up tomorrow in any city in the world with no responsibilities, where are we having coffee first?"',
        'Prompt 2: "What is a secret dream or hobby you’ve been thinking about lately that you haven’t told anyone about?"',
        'Prompt 3: "What was the exact moment early in our relationship when you realized we had something special?"'
      ]
    },
    {
      id: 'post-5',
      title: 'How to Turn a Standard Tuesday into a Core Memory',
      category: 'SURPRISE & DELIGHT',
      readTime: '5 min read',
      date: 'MARCH 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_hispanic_couple_1785457480644.jpg',
      summary: 'You do not need an anniversary or birthday to create magic. Unplanned mid-week dates yield maximum emotional impact.',
      keyTakeaway: 'The element of surprise amplifies dopamine. A unexpected Tuesday date feels 10x more romantic than a mandated Valentine’s Day.',
      content: [
        'Anniversaries and birthdays carry high expectations. But a completely unexpected date on an ordinary Tuesday breaks routine and creates an unforgettable memory.',
        'How Swoon Plans makes it effortless:',
        '1. Send her a calendar invite Tuesday morning titled: "Dress up. I have everything taken care of tonight."',
        '2. Use Swoon Plans to pick a 2-hour sunset lounge itinerary near her workplace.',
        '3. Pick her up with her favorite flower and enjoy a relaxed, zero-stress evening that brightens her entire week.'
      ]
    },
    {
      id: 'post-6',
      title: 'The Modern Gentleman’s Guide to Effortless Romance',
      category: 'LIFESTYLE & LEADERSHIP',
      readTime: '4 min read',
      date: 'FEBRUARY 2026',
      author: 'Swoon Plans Concierge',
      image: '/images/date_african_american_couple_1785457444161.jpg',
      summary: 'How busy men balance demanding careers and deep romantic relationships without losing hours to endless research.',
      keyTakeaway: 'Delegating date logistics to Swoon Plans gives you back 10+ hours while upgrading her experience.',
      content: [
        'Being a modern leader means working smarter, not harder. You delegate complex logistics in business—why spent 4 hours reading Yelp reviews for date night?',
        'Swoon Plans acts as your personal date concierge.',
        'You answer 15 simple preference questions, and our algorithm crafts a complete date itinerary tailored to her tastes.',
        'You look like a hero, she feels deeply cherished, and your schedule remains completely protected.'
      ]
    }
  ];

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

      {/* Featured Blog Card (Post 1: 4 Simple Steps) */}
      <div className="mb-16 bg-[#1A1816] text-[#FAF8F5] rounded-sm p-6 sm:p-10 border border-[#D5C29F]/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-sans text-[#D5C29F]">
            <span className="bg-[#D5C29F]/20 px-2.5 py-1 rounded border border-[#D5C29F]/30 font-bold">
              FEATURED GUIDE
            </span>
            <span>•</span>
            <span>{posts[0].readTime}</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-serif italic font-light text-white leading-tight">
            {posts[0].title}
          </h3>
          <p className="text-xs sm:text-sm text-white/70 font-sans font-light leading-relaxed">
            {posts[0].summary}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={() => setSelectedPost(posts[0])}
              className="px-6 py-3 bg-[#D5C29F] hover:bg-[#c4af89] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <span>READ FULL ARTICLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenInquire}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors border border-white/20 text-center"
            >
              FIRST PLAN FREE
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded overflow-hidden h-72 border border-white/10">
          <img
            src={posts[0].image}
            alt={posts[0].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs font-serif italic text-[#D5C29F]">
            "Answer 15 short questions to unlock your custom date plan."
          </div>
        </div>
      </div>

      {/* Grid of Other 5 Blog Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(1).map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group bg-[#EFEDEB]/60 border border-[#E8E2D9] rounded-sm overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
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
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-[#E8E2D9]/50 flex items-center justify-between text-xs font-sans font-bold text-[#1A1816]">
              <span className="text-[10px] uppercase tracking-[0.2em]">READ GUIDE</span>
              <ChevronRight className="w-4 h-4 text-[#D5C29F] group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF8F5] max-w-3xl w-full rounded-sm border border-[#E8E2D9] p-6 sm:p-10 relative my-8 text-[#1A1816] shadow-2xl">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 text-xs font-sans font-bold uppercase tracking-widest px-3 py-1 bg-[#1A1816] text-white rounded cursor-pointer hover:bg-[#38332E]"
            >
              CLOSE ✕
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] font-bold">
                  {selectedPost.category} • {selectedPost.readTime}
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif italic text-[#1A1816]">
                  {selectedPost.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#8C8377] font-sans italic">
                  <User className="w-3.5 h-3.5 text-[#D5C29F]" />
                  <span>By {selectedPost.author}</span>
                  <span>•</span>
                  <span>{selectedPost.date}</span>
                </div>
              </div>

              <div className="bg-[#1A1816] text-[#FAF8F5] p-4 rounded border-l-4 border-[#D5C29F] space-y-1">
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#D5C29F] font-bold">
                  KEY TAKEAWAY
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-white/90">
                  "{selectedPost.keyTakeaway}"
                </p>
              </div>

              <div className="space-y-4 font-sans text-sm text-[#38332E] leading-relaxed font-light">
                {selectedPost.content.map((p, idx) => (
                  <p key={idx} className="bg-white/60 p-3 rounded border border-[#E8E2D9]">
                    {p}
                  </p>
                ))}
              </div>

              <div className="pt-6 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-serif italic text-[#1A1816]">Ready for a curated date plan?</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#8C8377]">Answer 15 short questions today.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPost(null);
                    onOpenInquire();
                  }}
                  className="px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer"
                >
                  FIRST PLAN FREE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
