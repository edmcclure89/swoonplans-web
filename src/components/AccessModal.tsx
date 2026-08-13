import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAccess: () => void;
  onInstantAccess: () => void;
}

// Uses an existing hero asset from /public/images so we never reference a file
// that isn't in the repo. If this asset is ever removed, the dark ink panel
// underneath still keeps the gold headline legible.
const BG_IMAGE = '/images/waitlist-hero.jpg';

export const AccessModal: React.FC<AccessModalProps> = ({
  isOpen,
  onClose,
  onRequestAccess,
  onInstantAccess,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card slides down from the top */}
      <div className="relative w-full max-w-[560px] mt-6 sm:mt-14 rounded-2xl overflow-hidden shadow-2xl bg-[#1A1816] animate-[dropIn_0.5s_cubic-bezier(0.22,1,0.36,1)]">
        {/* Background image + dark overlay */}
        <img
          src={BG_IMAGE}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1A1816]/[0.55]" aria-hidden="true" />

        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 text-white/70 hover:text-white p-2 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-[1] px-7 py-10 sm:px-10 sm:py-12">
          <h2 className="text-center font-serif italic font-light text-2xl sm:text-3xl leading-snug text-[#D5C29F] text-balance drop-shadow-lg">
            {'\u2018He Adores You.\u2019 Register Him So Our Algorithm Can Help Him Show You.'}
          </h2>

          <div className="mt-8 space-y-3">
            <button
              onClick={onRequestAccess}
              className="w-full px-6 py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-colors cursor-pointer"
            >
              Request Access
            </button>
            <button
              onClick={onInstantAccess}
              className="w-full px-6 py-4 bg-transparent border border-[#D5C29F] text-[#D5C29F] hover:bg-[#D5C29F]/15 font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-colors cursor-pointer"
            >
              Instant Access
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropIn {
          from { transform: translateY(-120%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[dropIn_0\\.5s_cubic-bezier\\(0\\.22\\,1\\,0\\.36\\,1\\)\\] { animation: none; }
        }
      `}</style>
    </div>
  );
};
