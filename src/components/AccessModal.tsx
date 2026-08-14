import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { startFoundersCheckout } from '../lib/checkout';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Opens the "remind me later" nudge, which owns the sms: handoff.
  onRemindLater: () => void;
}

// Background art has the headline and both buttons painted into the image
// itself (public/images/access-modal.jpg). The two hit targets below are
// transparent overlays positioned by percentage over the painted buttons,
// measured off the source image: both at left 27.7% / width 44%; Request
// Access top 62.3-70.3%; Instant Access top 72.7-80.8%.
export const AccessModal: React.FC<AccessModalProps> = ({ isOpen, onClose, onRemindLater }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInstantAccess = async () => {
    setError('');
    setLoading(true);
    const result = await startFoundersCheckout();
    if (!result.ok) {
      setError(result.error || "Couldn't start checkout. Try again in a moment.");
      setLoading(false);
    }
    // On success the browser is redirecting to Stripe; keep the button busy.
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-md w-full my-8">
        <div className="relative rounded-sm overflow-hidden shadow-2xl border border-[#E8E2D9]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-1.5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <img
            src="/images/access-modal.jpg"
            alt="He adores you. Register him so our algorithm can help him show you."
            className="w-full h-auto block select-none"
            draggable={false}
          />

          {/* Request Access hit target */}
          <a
            href="/register"
            className="absolute rounded-sm cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5C29F] focus-visible:ring-offset-2"
            style={{ left: '27.7%', width: '44%', top: '62.3%', height: '8%' }}
            aria-label="Request access: go to the pre-register page"
          />

          {/* Instant Access hit target */}
          <button
            type="button"
            onClick={handleInstantAccess}
            disabled={loading}
            className="absolute rounded-sm cursor-pointer disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D5C29F] focus-visible:ring-offset-2 flex items-center justify-center"
            style={{ left: '27.7%', width: '44%', top: '72.7%', height: '8.1%' }}
            aria-label="Get instant access with the Founders Pass"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-xs text-[#F0C9C0] font-sans text-center tracking-wide">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onRemindLater}
          className="w-full mt-3 text-center text-[10px] uppercase tracking-[0.25em] font-sans text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
};
