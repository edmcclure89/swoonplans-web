import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAccess: () => void;
  onInstantAccess: () => void;
}

// The headline and buttons are baked into this artwork, so the modal renders it
// full-bleed at its native 3:2 aspect ratio and layers invisible hit targets
// over the two painted buttons.
const BG_IMAGE = '/images/access-modal.jpg';

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
        {/* Full-bleed 3:2 artwork with the headline + buttons baked in */}
        <div className="relative w-full aspect-[3/2]">
          <img
            src={BG_IMAGE}
            alt="He adores you. Register him so our algorithm can help him show you."
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Invisible hit targets over the painted buttons */}
          <button
            onClick={onRequestAccess}
            aria-label="Request Access"
            className="absolute cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1816]"
            style={{ left: '27.7%', width: '44%', top: '62.3%', height: '8%' }}
          />
          <button
            onClick={onInstantAccess}
            aria-label="Instant Access"
            className="absolute cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1816]"
            style={{ left: '27.7%', width: '44%', top: '72.7%', height: '8.1%' }}
          />

          <button
            onClick={onClose}
            className="absolute top-3 right-4 z-10 text-white/80 hover:text-white p-2 transition-colors cursor-pointer drop-shadow-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
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
