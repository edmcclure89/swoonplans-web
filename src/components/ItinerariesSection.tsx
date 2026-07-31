import React, { useState } from 'react';
import { MapPin, Phone, Compass, ArrowRight, ExternalLink, DollarSign, Sparkles, User, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ItinerariesSectionProps {
  onOpenInquire: () => void;
}

export const ItinerariesSection: React.FC<ItinerariesSectionProps> = ({ onOpenInquire }) => {
  const [herName, setHerName] = useState<string>('Penny');
  const [selectedBudget, setSelectedBudget] = useState<string>('$$$$');

  const namesList = ['Penny', 'Sophia', 'Chloe', 'Sarah'];

  const sampleBlueprints = [
    {
      id: 'blueprint-miami',
      name: 'Penny',
      archetype: 'RITP // The Aesthetic Homebody',
      archetypeDesc: 'Relaxed and private, but drawn to what is new and trendy, with a preference for an organized plan.',
      estimatedTotal: '$348–$572',
      stops: [
        {
          number: 'STOP 1 // ARRIVAL & DRINKS',
          venue: 'Mila Lounge',
          priceLevel: '$$$$',
          priceRange: '$50–$80 pp',
          desc: 'Ultra-luxurious rooftop lounge with Mediterranean flair and ambient music.',
          address: '1636 Meridian Ave, Miami Beach, FL 33139',
          phone: '(786) 706-0740',
          reserveText: 'Click here for reservations on OpenTable',
          reserveUrl: 'https://www.opentable.com',
          reserveType: 'OpenTable'
        },
        {
          number: 'STOP 2 // THE MAIN EVENT',
          venue: 'Carbone Miami',
          priceLevel: '$$$$',
          priceRange: '$110–$180 pp',
          desc: 'Theatrical, high-end retro Italian-American glamour and world-class dining.',
          address: '401 Collins Ave, Miami Beach, FL 33139',
          phone: '(305) 534-2423',
          reserveText: 'Click here for reservations on Resy',
          reserveUrl: 'https://resy.com',
          reserveType: 'Resy'
        },
        {
          number: 'STOP 3 // THE NIGHTCAP',
          venue: 'Afternoon Tea & Cocktails at The Biltmore',
          priceLevel: '$$$',
          priceRange: '$14–$26 pp',
          desc: 'Grand historic-hotel lounge for intimate nightcaps and dessert.',
          address: '1200 Anastasia Ave, Coral Gables, FL 33134',
          phone: '(855) 311-6903',
          reserveText: 'Click here for reservations & venue details',
          reserveUrl: 'https://www.biltmorehotel.com',
          reserveType: 'Direct Website'
        }
      ]
    },
    {
      id: 'blueprint-dc',
      name: 'Sophia',
      archetype: 'RSCP // The Classic Socialite',
      archetypeDesc: 'Relaxed but loves being around people, sticks to timeless favorites, and likes a seamless plan.',
      estimatedTotal: '$120–$220',
      stops: [
        {
          number: 'STOP 1 // ARRIVAL & COFFEE/WINE',
          venue: 'Northside Social Coffee & Wine',
          priceLevel: '$$',
          priceRange: '$8–$18 pp',
          desc: 'Low-key coffee & wine bar, easy conversation starter in a warm neighborhood setting.',
          address: '3211 Wilson Blvd, Arlington, VA 22201',
          phone: '(703) 465-0145',
          reserveText: 'Walk-in welcome • Click here for venue info',
          reserveUrl: 'https://northsidesocialva.com',
          reserveType: 'Direct Website'
        },
        {
          number: 'STOP 2 // THE ACTIVITY',
          venue: 'One More Page Books',
          priceLevel: '$',
          priceRange: 'Free to browse',
          desc: 'Independent bookstore, great for slow browsing side-by-side.',
          address: '2200 N Westmoreland St, Ste 101, Arlington, VA 22213',
          phone: '(703) 300-9746',
          reserveText: 'Click here for store hours & directions',
          reserveUrl: 'https://www.onemorepagebooks.com',
          reserveType: 'Direct Website'
        },
        {
          number: 'STOP 3 // THE CAPSTONE',
          venue: 'The Liberty Tavern',
          priceLevel: '$$$',
          priceRange: '$20–$40 pp',
          desc: 'Neighborhood gastropub, warm and reliably exceptional dining.',
          address: '3195 Wilson Blvd, Arlington, VA 22201',
          phone: '(703) 465-9360',
          reserveText: 'Click here for reservations on OpenTable',
          reserveUrl: 'https://www.opentable.com',
          reserveType: 'OpenTable'
        }
      ]
    }
  ];

  const activeBlueprint = sampleBlueprints.find(b => b.name === herName) || sampleBlueprints[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] border border-[#D5C29F]/30 rounded-full text-[10px] uppercase tracking-[0.35em] font-sans">
          <Compass className="w-3.5 h-3.5" />
          <span>APP IN ACTION • LIVE BLUEPRINT PREVIEW</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#1A1816] italic">
          Bespoke Date Plans
        </h2>
        <p className="text-xs sm:text-sm text-[#6E675F] font-sans font-light leading-relaxed">
          Answer 15 short questions to receive a custom date plan like these—complete with her name, price levels, exact venue addresses, phone numbers, and direct reservation links.
        </p>
      </div>

      {/* Showcase App in Action Preview Screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#EFEDEB]/80 p-6 sm:p-8 rounded-sm border border-[#E8E2D9]">
        {/* App Action Screen 1: Setting the Scene */}
        <div className="bg-white rounded-lg p-6 border border-[#E8E2D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8C8377] font-bold font-sans">
            <span>SETTING THE SCENE FOR {herName.toUpperCase()}</span>
            <span className="text-[#1A1816] bg-[#D5C29F]/20 px-2 py-0.5 rounded">QUESTIONNAIRE STEP 2</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1816]">
            What's the Budget?
          </h3>
          <p className="text-xs text-[#6E675F]">Set the range and every venue suggestion will fit it.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              { level: '$', label: 'Keep it simple' },
              { level: '$$', label: 'A solid night out' },
              { level: '$$$', label: 'Something special' },
              { level: '$$$$', label: 'Go all out' }
            ].map((b) => (
              <button
                key={b.level}
                onClick={() => setSelectedBudget(b.level)}
                className={`p-3 rounded border text-left cursor-pointer transition-all ${
                  selectedBudget === b.level
                    ? 'border-[#1A1816] bg-[#1A1816] text-[#D5C29F] shadow'
                    : 'border-[#E8E2D9] bg-[#FAF8F5] text-[#1A1816] hover:border-[#8C8377]'
                }`}
              >
                <div className="font-bold text-sm font-sans">{b.level}</div>
                <div className="text-[10px] opacity-80 mt-1">{b.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* App Action Screen 2: Occasion */}
        <div className="bg-white rounded-lg p-6 border border-[#E8E2D9] shadow-sm space-y-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8C8377] font-bold font-sans">
            <span>SETTING THE SCENE FOR {herName.toUpperCase()}</span>
            <span className="text-[#1A1816] bg-[#D5C29F]/20 px-2 py-0.5 rounded">QUESTIONNAIRE STEP 3</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#1A1816]">
            What's the Occasion?
          </h3>
          <p className="text-xs text-[#6E675F]">Tell us what we're planning around.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded border border-[#1A1816] bg-[#1A1816] text-[#D5C29F] space-y-1">
              <div className="font-bold text-sm">First Date</div>
              <div className="text-[11px] text-[#FAF8F5]/80">Making a strong first impression</div>
            </div>
            <div className="p-3.5 rounded border border-[#E8E2D9] bg-[#FAF8F5] text-[#1A1816] space-y-1">
              <div className="font-bold text-sm">A Specific Holiday / Anniversary</div>
              <div className="text-[11px] text-[#8C8377]">Valentine's Day, her birthday, anniversary</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Blueprint Display */}
      <div className="bg-white rounded-lg border border-[#E8E2D9] p-6 sm:p-10 shadow-md space-y-8">
        {/* Top Header Bar with Woman's Name */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.25em] font-sans font-bold">
              <Sparkles className="w-3 h-3" />
              <span>PLAN READY</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1816]">
              {herName.toLowerCase()}'s Date Blueprint
            </h3>
          </div>

          {/* Switch Woman's Name Control */}
          <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded border border-[#E8E2D9]">
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-[#8C8377] px-2 flex items-center gap-1">
              <User className="w-3 h-3 text-[#1A1816]" />
              <span>Her Name:</span>
            </span>
            <div className="flex gap-1">
              {namesList.map((name) => (
                <button
                  key={name}
                  onClick={() => setHerName(name)}
                  className={`px-3 py-1 text-xs font-sans rounded transition-all cursor-pointer font-bold ${
                    herName === name
                      ? 'bg-[#1A1816] text-[#D5C29F] shadow-sm'
                      : 'text-[#524B43] hover:bg-[#E8E2D9]'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Archetype Banner */}
        <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-4 sm:p-5 rounded space-y-1">
          <div className="inline-block px-2.5 py-0.5 bg-[#1A1816] text-[#D5C29F] text-[10px] font-bold font-sans rounded tracking-wider uppercase">
            {activeBlueprint.archetype}
          </div>
          <p className="text-xs text-[#524B43] font-sans pt-1">
            {activeBlueprint.archetypeDesc}
          </p>
        </div>

        {/* Venue Stops List with Address, Phone, Price Level, and Reservation Link */}
        <div className="space-y-6">
          {activeBlueprint.stops.map((stop, i) => (
            <div key={i} className="bg-[#FAF8F5] border border-[#E8E2D9] rounded p-5 sm:p-6 space-y-3 hover:border-[#1A1816]/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E2D9] pb-2">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#8C8377]">
                  {stop.number}
                </span>
                <div className="flex items-center gap-2 text-xs font-sans font-bold text-[#1A1816] bg-[#D5C29F]/30 px-2.5 py-1 rounded">
                  <span>PRICE LEVEL: {stop.priceLevel}</span>
                  <span className="text-[#8C8377]">({stop.priceRange})</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1816]">
                  {stop.venue}
                </h4>
                <p className="text-xs sm:text-sm text-[#524B43] font-sans">
                  {stop.desc}
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-[#524B43]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1A1816] shrink-0" />
                  <span>{stop.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#1A1816] shrink-0" />
                  <span>{stop.phone}</span>
                </div>
              </div>

              {/* Reservation Callout Button */}
              <div className="pt-2">
                <a
                  href={stop.reserveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] text-xs font-bold font-sans uppercase tracking-wider rounded transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D5C29F]" />
                  <span>{stop.reserveText}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated Total Bar */}
        <div className="bg-[#1A1816] text-[#FAF8F5] p-5 rounded flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-[#D5C29F]/30">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#D5C29F] font-bold">
              ESTIMATED TOTAL
            </div>
            <div className="text-xs text-white/70 font-sans">
              All three stops, for two people
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#D5C29F]">
            {activeBlueprint.estimatedTotal}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onOpenInquire}
            className="px-8 py-3.5 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded cursor-pointer transition-all shadow-md inline-flex items-center gap-2"
          >
            <span>GET YOUR CUSTOMIZED PLAN FREE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

