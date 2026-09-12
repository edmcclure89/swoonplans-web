import React from 'react';
import { Star, Quote, Heart, CheckCircle } from 'lucide-react';

export const HusbandsTestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      quote: "He planned a rooftop dinner, a cocktail bar I had never heard of, and dessert on the walk home. I sent one photo to my girlfriends and my phone did not stop buzzing for an hour. They all want to know who planned it. He did. Sort of.",
      author: "Alexis R.",
      title: "Together 3 Years",
      location: "Skyline Rooftop Rendezvous",
      rating: 5,
      highlight: "The Group Chat Is Jealous"
    },
    {
      id: 2,
      quote: "It is not about the money. It is that he thought about what I actually like. Three stops, all of them mine, reservations already made. I cried a little in the car. Twelve years together and he still surprises me.",
      author: "Danielle M.",
      title: "Married 12 Years",
      location: "Candlelit Garden Patio Date",
      rating: 5,
      highlight: "I Feel So Loved"
    },
    {
      id: 3,
      quote: "I love my wife. I am just terrible at this. SwoonPlans handed me real venues, exact addresses, and the booking links, and I looked like I had been planning for weeks. She has told the story four times.",
      author: "Carlos M.",
      title: "Husband & Father of 2",
      location: "Hilltop Sunset Wine Date",
      rating: 5,
      highlight: "Thank You For The Assist"
    },
    {
      id: 4,
      quote: "She deserves to be spoiled and I never knew where to start. Now I do. Two minutes on my phone and I gave her the night she had been describing to me for years without me realizing it.",
      author: "Jamal W.",
      title: "Grateful Husband",
      location: "Private Ocean Cove Dinner",
      rating: 5,
      highlight: "Finally Able To Spoil Her"
    },
    {
      id: 5,
      quote: "Planning my daughter\u2019s 7th birthday used to fill me with dread, but the Kid Plan framework completely changed the game. Having a structured 4-week countdown and an activity flow that kept ten high-energy kids fully engaged meant I actually got to enjoy the party instead of running around like a stressed-out stage manager. Absolute lifesaver!",
      author: "Sarah M.",
      title: "Verified Parent",
      location: "Austin, TX",
      rating: 5,
      highlight: "Actually Enjoyed The Party"
    },
    {
      id: 6,
      quote: "Managing severe peanut and dairy allergies for a group of eight-year-olds felt terrifying until we used the SwoonPlans kid menu guide. The build-your-own taco bar and allergen-safe snack ideas were a massive hit with both the kids and the parents. Everyone felt included, and it took all the guesswork out of hosting.",
      author: "David K.",
      title: "Verified Parent",
      location: "Denver, CO",
      rating: 4,
      highlight: "Zero Guesswork, Fully Included"
    },
    {
      id: 7,
      quote: "I was completely burnt out from juggling a demanding career and daily schedules. Taking just one weekend to follow the digital sunset and self-care blueprint felt like hitting a hard reset on my nervous system. I returned to my work week completely centered, calm, and clear-headed for the first time in months.",
      author: "Elena R.",
      title: "Verified Member",
      location: "Seattle, WA",
      rating: 5,
      highlight: "Complete Reset, Totally Centered"
    },
    {
      id: 8,
      quote: "The morning routine framework gave me back my mornings before the rest of the world started demanding my energy. Shifting away from my phone first thing and setting up a quiet, intentional start to my day has transformed my baseline anxiety. It\u2019s the ultimate form of everyday self-respect.",
      author: "Chloe V.",
      title: "Verified Member",
      location: "Chicago, IL",
      rating: 5,
      highlight: "Ultimate Self-Respect Habit"
    },
    {
      id: 9,
      quote: "I used SwoonPlans to coordinate a weekend getaway trip for my six bridesmaids in the mountains, and it was a total triumph. Between managing everyone\u2019s dietary needs, scheduling downtime, and keeping the itinerary seamless without feeling over-programmed, it eliminated all the usual group travel friction. We all laughed, bonded, and actually got to rest!",
      author: "Maya S.",
      title: "Verified Group Planner",
      location: "Nashville, TN",
      rating: 4,
      highlight: "Zero Group Travel Friction"
    }

  ];

  return (
    <section className="py-20 px-4 sm:px-8 bg-[#FAF8F5] text-[#1A1816] relative border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-[10px] uppercase tracking-[0.4em] font-sans text-[#8C8377] flex items-center justify-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#D5C29F] fill-[#D5C29F]" />
            <span>HAPPY CUSTOMERS</span>
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic">
            Happy Customers
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
