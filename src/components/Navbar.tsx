import React from 'react';
import { Camera, Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';
import { socialLinks } from '../data/socialLinks';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenInquire: () => void;
  onOpenAccess: () => void;
  isMuted: boolean;
  toggleAudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInquire,
  onOpenAccess,
  isMuted,
  toggleAudio,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      {/* Main Header Layout matching Sleek Interface Theme */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 grid grid-cols-3 items-center">
        {/* Left Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] font-sans justify-start">
          <button
            onClick={() => setActiveTab('stories')}
            className={`transition-all duration-200 cursor-pointer ${
              activeTab === 'stories'
                ? 'text-[#1A1816] font-bold border-b-2 border-[#1A1816] pb-0.5'
                : 'text-[#6E675F] hover:text-[#1A1816]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('itineraries')}
            className={`transition-all duration-200 cursor-pointer ${
              activeTab === 'itineraries'
                ? 'text-[#1A1816] font-bold border-b-2 border-[#1A1816] pb-0.5'
                : 'text-[#6E675F] hover:text-[#1A1816]'
            }`}
          >
            Itineraries
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`transition-all duration-200 cursor-pointer ${
              activeTab === 'blog'
                ? 'text-[#1A1816] font-bold border-b-2 border-[#1A1816] pb-0.5'
                : 'text-[#6E675F] hover:text-[#1A1816]'
            }`}
          >
            Blog
          </button>
          <button
            onClick={() => setActiveTab('for-women')}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all duration-200 cursor-pointer text-xs tracking-[0.15em] border ${
              activeTab === 'for-women'
                ? 'bg-[#1A1816] text-[#D5C29F] border-[#1A1816] shadow-sm'
                : 'bg-[#D5C29F]/25 text-[#1A1816] hover:bg-[#D5C29F] border-[#D5C29F]/60'
            }`}
          >
            For Women Only
          </button>
        </nav>

        {/* Center Logo */}
        <div className="text-center col-span-3 lg:col-span-1">
          <button
            onClick={() => setActiveTab('stories')}
            className="group cursor-pointer inline-block text-center"
          >
            <img
              src="/images/swoonplans-logo.png"
              alt="Swoon Plans"
              className="h-6 sm:h-7 md:h-8 w-auto mx-auto group-hover:opacity-80 transition-opacity"
            />
            <span className="block text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-[#1A1816] mt-1">
              Your Date Planning Concierge
            </span>
          </button>
        </div>

        {/* Right Navigation */}
        <div className="hidden lg:flex items-center justify-end gap-4 sm:gap-6 text-xs font-medium uppercase tracking-[0.2em] font-sans">
          <div className="flex items-center gap-3.5">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-[#6E675F] hover:text-[#1A1816] transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
          <button
            onClick={onOpenAccess}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[#1A1816] hover:text-[#38332E] transition-all duration-300 text-xs tracking-[0.2em] font-bold cursor-pointer border border-[#D5C29F] hover:bg-[#D5C29F]/20"
          >
            <Zap className="w-3.5 h-3.5" />
            INSTANT ACCESS
          </button>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="lg:hidden flex items-center justify-around py-2.5 px-2 border-t border-[#E8E2D9] text-xs uppercase tracking-[0.15em] font-sans text-[#6E675F] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('stories')}
          className={activeTab === 'stories' ? 'text-[#1A1816] font-bold underline' : ''}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('itineraries')}
          className={activeTab === 'itineraries' ? 'text-[#1A1816] font-bold underline' : ''}
        >
          Itineraries
        </button>
        <button
          onClick={() => setActiveTab('blog')}
          className={activeTab === 'blog' ? 'text-[#1A1816] font-bold underline' : ''}
        >
          Blog
        </button>
        <button
          onClick={() => setActiveTab('for-women')}
          className={`px-2.5 py-1 rounded-full font-bold transition-all text-xs tracking-[0.1em] ${
            activeTab === 'for-women'
              ? 'bg-[#1A1816] text-[#D5C29F]'
              : 'bg-[#D5C29F]/30 text-[#1A1816] border border-[#D5C29F]/60'
          }`}
        >
          For Women
        </button>
        <div className="flex items-center gap-3 pl-1 ml-1 border-l border-[#E8E2D9] shrink-0">
          {socialLinks.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-[#6E675F] hover:text-[#1A1816] transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
};
