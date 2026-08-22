import React, { useState } from 'react';
import { Send, Lock, ArrowLeft } from 'lucide-react';
import { SwoonScores, getTypeName, buildCheatSheet, SOLO_CATEGORIES } from '../data/swoonType';

interface SwoonTypeResultsProps {
  scores: SwoonScores;
  onRetake: () => void;
  onTrackChange?: (track: 'partnered' | 'solo') => void;
  onShare?: () => void;
}

type Track = 'partnered' | 'solo';

export const SwoonTypeResults: React.FC<SwoonTypeResultsProps> = ({ scores, onRetake, onTrackChange, onShare }) => {
  const [track, setTrack] = useState<Track>('partnered');
  const [shareCopied, setShareCopied] = useState(false);

  const typeName = getTypeName(scores);
  const cheatSheet = buildCheatSheet(scores);
  const soloCategory = SOLO_CATEGORIES[scores.energy];

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
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Swoon Type', text: shareMessage, url: shareUrl });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareMessage);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // no-op, clipboard may be unavailable
    }
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

            <p className="font-sans text-xs text-[#8C8377] text-center">
              He'll see your type and this cheat sheet. Full custom date itineraries unlock when he does.
            </p>
          </div>
        ) : (
          <div className="text-left space-y-6">
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <h2 className="font-serif italic text-2xl mb-2">{soloCategory.title}</h2>
              <p className="font-sans text-[#38332E] leading-relaxed mb-6">{soloCategory.blurb}</p>

              <div className="relative rounded-xl border border-dashed border-[#D5C29F] p-6 text-center">
                <Lock className="w-5 h-5 mx-auto mb-3 text-[#B89860]" />
                <p className="font-sans text-sm text-[#8C8377] mb-4">
                  Curated solo itineraries for your type unlock here.
                </p>
                <button
                  disabled
                  className="font-sans text-xs font-bold uppercase tracking-widest bg-[#1A1816]/10 text-[#8C8377] px-6 py-3 rounded-full cursor-not-allowed"
                  title="Checkout opens soon"
                >
                  Unlock &middot; Coming Soon
                </button>
              </div>
            </div>
            <p className="font-sans text-xs text-[#8C8377] text-center">
              Solo unlock pricing and checkout are being finalized. Check back shortly.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
