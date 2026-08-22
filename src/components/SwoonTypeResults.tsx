import React, { useState } from 'react';
import { Send, Lock, ArrowLeft } from 'lucide-react';
import { SwoonScores, getTypeName, buildCheatSheet, SOLO_CATEGORIES } from '../data/swoonType';
import { startSoloUnlockCheckout } from '../lib/checkout';

interface SwoonTypeResultsProps {
  scores: SwoonScores;
  onRetake: () => void;
  onTrackChange?: (track: 'partnered' | 'solo') => void;
  onShare?: () => void;
}

type Track = 'partnered' | 'solo';

// Web Share API is only reliable on mobile, where it opens the native share
// sheet (Messages, Mail, etc). On desktop Chrome/Edge it exists but often
// does nothing visible depending on what's configured on the OS, so we only
// attempt it on touch/mobile devices and go straight to clipboard elsewhere.
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Legacy fallback that works even when the async Clipboard API is blocked
// (missing permission, insecure context edge cases, older browsers).
function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export const SwoonTypeResults: React.FC<SwoonTypeResultsProps> = ({ scores, onRetake, onTrackChange, onShare }) => {
  const [track, setTrack] = useState<Track>('partnered');
  const [shareCopied, setShareCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const typeName = getTypeName(scores);
  const cheatSheet = buildCheatSheet(scores);
  const soloCategory = SOLO_CATEGORIES[scores.energy];

  const isUnlocked =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unlocked') === '1';

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/swoon-type?v=${scores.vibe}&p=${scores.pace}&e=${scores.energy}`
    : '';

  const shareMessage = `I just found out my Swoon Type is "${typeName}." Here's how to date me: ${shareUrl}`;

  const changeTrack = (next: Track) => {
    setTrack(next);
    onTrackChange?.(next);
  };

  const handleSendToHim = async () => {
    onShare?.();
    setShareFallback(null);

    if (isMobileDevice() && navigator.share) {
      try {
        await navigator.share({ title: 'My Swoon Type', text: shareMessage, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard below.
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
        return;
      } catch {
        // fall through to legacy copy
      }
    }

    if (legacyCopy(shareMessage)) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
      return;
    }

    // Last resort: nothing copied automatically, show the message in a
    // visible, selectable box so the person can copy it by hand.
    setShareFallback(shareMessage);
  };

  const handleUnlock = async () => {
    setUnlockError(null);
    setUnlockLoading(true);
    const returnPath = typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '/swoon-type';
    const result = await startSoloUnlockCheckout(returnPath);
    if (!result.ok) {
      setUnlockError(result.error || "Couldn't start checkout. Try again in a moment.");
      setUnlockLoading(false);
    }
    // On success the page navigates away to Stripe Checkout, so no need to
    // reset loading state here.
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif">
      <header className="border-b border-[#E8E2D9] px-6 sm:px-12 py-5 flex items-center justify-between">
        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retake
        </button>
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377]">Swoon Plans</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 sm:px-12 py-14 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#B89860] font-bold">
          Your Swoon Type
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif italic font-light mt-3 mb-6 leading-tight">
          {typeName}
        </h1>
        <p className="font-sans text-[#38332E] leading-relaxed mb-10">
          A blend of {scores.vibe}, {scores.pace}, and {scores.energy} energy. This is the shorthand for what
          makes you feel truly seen, and it's exactly what he needs to know.
        </p>

        {/* Track toggle */}
        <div className="inline-flex rounded-full border border-[#E8E2D9] p-1 mb-12 font-sans text-sm">
          <button
            onClick={() => changeTrack('partnered')}
            className={`px-5 py-2 rounded-full transition-colors ${track === 'partnered' ? 'bg-[#1A1816] text-[#FAF8F5]' : 'text-[#8C8377]'}`}
          >
            Partnered & Seen
          </button>
          <button
            onClick={() => changeTrack('solo')}
            className={`px-5 py-2 rounded-full transition-colors ${track === 'solo' ? 'bg-[#1A1816] text-[#FAF8F5]' : 'text-[#8C8377]'}`}
          >
            Solo & Thriving
          </button>
        </div>

        {track === 'partnered' ? (
          <div className="text-left space-y-8">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8">
              <h2 className="font-sans text-xs uppercase tracking-widest font-bold text-[#1A1816] mb-4">
                How to Date Me
              </h2>

              <p className="font-sans text-sm text-[#8C8377] uppercase tracking-wider mb-2">Do this</p>
              <ul className="font-sans text-[#38332E] space-y-1.5 mb-5 list-disc pl-5">
                {cheatSheet.dos.map((d) => <li key={d}>{d}</li>)}
              </ul>

              <p className="font-sans text-sm text-[#8C8377] uppercase tracking-wider mb-2">Avoid this</p>
              <ul className="font-sans text-[#38332E] space-y-1.5 mb-5 list-disc pl-5">
                {cheatSheet.donts.map((d) => <li key={d}>{d}</li>)}
              </ul>

              <p className="font-sans text-sm text-[#8C8377] uppercase tracking-wider mb-2">Try this</p>
              <ul className="font-sans text-[#38332E] space-y-1.5 list-disc pl-5">
                {cheatSheet.dateIdeas.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>

            <button
              onClick={handleSendToHim}
              className="w-full flex items-center justify-center gap-2 bg-[#B89860] hover:bg-[#a3865298] text-[#1A1816] font-sans font-bold uppercase tracking-widest text-xs py-4 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
              {shareCopied ? 'Copied, go paste it to him' : 'Send to Him'}
            </button>

            {shareFallback && (
              <div className="font-sans text-xs text-[#38332E] bg-white border border-[#E8E2D9] rounded-xl p-4">
                <p className="text-[#8C8377] mb-2">Couldn't copy automatically. Select and copy this manually:</p>
                <input
                  readOnly
                  value={shareFallback}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full text-xs p-2 border border-[#E8E2D9] rounded-md bg-[#FAF8F5]"
                />
              </div>
            )}

            <p className="font-sans text-xs text-[#8C8377] text-center">
              He'll see your type and this cheat sheet. Full custom date itineraries unlock when he does.
            </p>
          </div>
        ) : (
          <div className="text-left space-y-6">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <h2 className="font-serif italic text-2xl mb-2">{soloCategory.title}</h2>
              <p className="font-sans text-[#38332E] leading-relaxed mb-6">{soloCategory.blurb}</p>

              {isUnlocked ? (
                <div className="rounded-xl border border-[#D5C29F] bg-[#FAF6EE] p-6 text-center">
                  <p className="font-sans text-sm text-[#38332E]">
                    You're unlocked. Your curated solo itineraries are being finalized and will be emailed to you shortly.
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-dashed border-[#D5C29F] p-6 text-center">
                  <Lock className="w-5 h-5 mx-auto mb-3 text-[#B89860]" />
                  <p className="font-sans text-sm text-[#8C8377] mb-4">
                    Curated solo itineraries for your type unlock here.
                  </p>
                  <button
                    onClick={handleUnlock}
                    disabled={unlockLoading}
                    className="font-sans text-xs font-bold uppercase tracking-widest bg-[#B89860] hover:bg-[#a3865298] text-[#1A1816] px-6 py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {unlockLoading ? 'Loading checkout...' : 'Unlock Solo Itineraries'}
                  </button>
                  {unlockError && (
                    <p className="font-sans text-xs text-red-600 mt-3">{unlockError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
