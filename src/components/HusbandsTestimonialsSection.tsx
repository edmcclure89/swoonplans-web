import React from 'react';
import { Star, Quote, Heart, CheckCircle } from 'lucide-react';

export const HusbandsTestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Her girlfriend group text is full of jealous BFFs now. Swoon Plans found a rooftop spot I never would have thought to look for, with the reservation link ready to go and exact timing laid out.",
      author: "Marcus T.",
      title: "Husband (Married 5 Years)",
      location: "Skyline Rooftop Rendezvous",
      rating: 5,
      highlight: "Group Text Legend"
    },
    {
      id: 2,
      quote: "I used Swoon Plans for my proposal night. It gave me the perfect private spot with a direct booking link, so I could focus on the moment instead of scrambling to find somewhere special.",
      author: "David Chen",
      title: "Newly Engaged",
      location: "Private Ocean Cove Proposal",
      rating: 5,
      highlight: "Perfect Proposal"
    },
    {
      id: 3,
      quote: "As a busy executive, I rarely have 10 hours to research and plan extravagant date nights. This app is a complete cheat code for men. 2 minutes on my phone and I earned major hero points for months.",
      author: "Carlos Martinez",
      title: "Husband & Father of 2",
      location: "Hilltop Sunset Wine Date",
      rating: 5,
      highlight: "Zero Stress Planning"
    },
    {
      id: 4,
      quote: "She hasn't stopped showing the photos to her sisters and coworkers. The spot Swoon Plans found had the exact candlelit patio vibe she loves. Best investment I've ever made in our relationship.",
      author: "Jamal Washington",
      title: "Grateful Husband",
      location: "Candlelit Garden Patio Date",
      rating: 5,
      highlight: "Unforgettable Memories"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-8 bg-[#FAF8F5] text-[#1A1816] relative border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#8C8377] flex items-center justify-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#D5C29F] fill-[#D5C29F]" />
            <span>WORDS FROM GRATEFUL MEN & HUSBANDS</span>
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic text-balance">
            Exclusivity is intentional. Member access is limited by ZIP code so our venues never feel crowded.
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-[#EFEDEB]/70 border border-[#D8CEC0] p-8 rounded relative space-y-6 flex flex-col justify-between hover:border-[#1A1816]/40 transition-colors shadow-sm"
            >
              <div className="space-y-4">
                {/* Rating & Highlight Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D5C29F] text-[#D5C29F]" />
                    ))}
                  </div>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-sans bg-[#1A1816] text-[#FAF8F5] px-2.5 py-1 rounded">
                    {t.highlight}
                  </span>
                </div>

                {/* Quote Text */}
                <div className="relative">
                  <Quote className="w-8 h-8 text-[#D5C29F]/30 absolute -top-3 -left-2 -z-0" />
                  <p className="text-sm sm:text-base font-serif italic text-[#2C2825] leading-relaxed relative z-10 pl-2">
                    "{t.quote}"
                  </p>
                </div>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-[#D8CEC0] flex items-center justify-between text-xs font-sans">
                <div>
                  <div className="font-medium text-[#1A1816] text-sm flex items-center gap-1.5">
                    <span>{t.author}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-[#8C8377]" />
                  </div>
                  <div className="text-[10px] text-[#6E675F] font-light">{t.title}</div>
                </div>
                <div className="text-right text-[10px] text-[#8C8377] uppercase tracking-wider">
                  {t.location}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
