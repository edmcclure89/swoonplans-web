import React, { useState } from 'react';
import { X, Zap, Loader2, Check } from 'lucide-react';
import { startFoundersCheckout } from '../lib/checkout';

interface AccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Opens the "remind me later" nudge, which owns the sms: handoff.
  onRemindLater: () => void;
}

const FOUNDERS_PERKS = [
  '3 months of full access, paid once upfront',
  'Operator-tier: up to 3 saved date profiles',
  'Curated venues, exact addresses, one-tap reservations',
];

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
      <div className="bg-[#FAF8F5] max-w-md w-full rounded-sm border border-[#E8E2D9] p-6 sm:p-10 relative my-8 text-[#1A1816] shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8377] hover:text-[#1A1816] p-2 transition-colors cursor-pointer"
          aria-label="Close founders pass"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 border-b border-[#E8E2D9] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>Founders Pass</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816]">
            Instant access, no subscription
          </h2>
          <p className="text-xs text-[#8C8377] font-sans font-light leading-relaxed">
            One payment unlocks three months upfront. Skip the quiz, skip the monthly billing.
          </p>
        </div>

        <ul className="space-y-3 font-sans text-xs text-[#524B43] leading-relaxed">
          {FOUNDERS_PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#D5C29F] shrink-0 mt-0.5" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="text-xs text-[#B4483A] font-sans tracking-wide">
            {error}
          </p>
        )}

        <button
          onClick={handleInstantAccess}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#1A1816] hover:bg-[#38332E] disabled:opacity-60 text-[#FAF8F5] font-bold text-[11px] uppercase tracking-[0.2em] font-sans rounded-sm transition-all cursor-pointer border border-[#D5C29F]/30"
          aria-label="Get instant access with the Founders Pass"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Instant Access
        </button>

        <button
          onClick={onRemindLater}
          className="w-full text-center text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          Remind me later
        </button>
      </div>
    </div>
  );
};
