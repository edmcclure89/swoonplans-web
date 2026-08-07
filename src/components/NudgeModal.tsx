import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPhone = (digits: string): string => {
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const isMobileDevice = (): boolean =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export const NudgeModal: React.FC<NudgeModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [handedOff, setHandedOff] = useState(false);
  const [copied, setCopied] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 10;

  // The message is composed on-device and sent from HER phone, from HER number.
  // SwoonPlans never transmits the message and never stores his number.
  const message =
    `Hi, it\u2019s ${name.trim() || 'me'} \u{1F49E} I found this thing that plans a whole date night for you. ` +
    `Three stops, real places, reservations and all. First plan is free. ` +
    `No pressure. But I\u2019d swoon. makeherswoon.com`;

  const smsHref = `sms:${digits}?&body=${encodeURIComponent(message)}`;

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setName('');
        setPhone('');
        setHandedOff(false);
        setCopied(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!isValid) return;
    setHandedOff(true);
    if (isMobileDevice()) {
      window.location.href = smsHref;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = message;
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[380px] animate-[slideIn_0.45s_cubic-bezier(0.22,1,0.36,1)]">
      <div className="bg-[#FAF8F5] border border-[#E8E2D9] sm:border-r-0 sm:border-b-0 rounded-t-2xl sm:rounded-tr-none sm:rounded-tl-2xl shadow-2xl p-6 sm:p-7 relative text-[#1A1816]">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#8C8377] hover:text-[#1A1816] p-2 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portrait */}
        <div className="flex justify-center mb-4">
          <svg
            viewBox="0 0 200 200"
            role="img"
            aria-label="Illustration of a smiling woman looking content"
            className="w-[76px] h-[76px] rounded-full border-[3px] border-[#D5C29F] bg-[#FAF8F5]"
          >
            <defs>
              <clipPath id="nm-circle"><circle cx="100" cy="100" r="100" /></clipPath>
              <linearGradient id="nm-bg" x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor="#F4EADF" />
                <stop offset="100%" stopColor="#FAF8F5" />
              </linearGradient>
              <radialGradient id="nm-bloom" cx="0.74" cy="0.18" r="0.62">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="nm-hair" x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#7C4B37" />
                <stop offset="100%" stopColor="#4E2E22" />
              </linearGradient>
              <linearGradient id="nm-skin" x1="0.3" y1="0" x2="0.75" y2="1">
                <stop offset="0%" stopColor="#F4CFB5" />
                <stop offset="100%" stopColor="#E6B99B" />
              </linearGradient>
              <radialGradient id="nm-blush">
                <stop offset="0%" stopColor="#D9899B" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#D9899B" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g clipPath="url(#nm-circle)">
              <rect width="200" height="200" fill="url(#nm-bg)" />
              <rect width="200" height="200" fill="url(#nm-bloom)" />
              <path d="M100 44 C71 44 51 66 51 96 C51 122 44 158 30 200 L170 200 C156 158 149 122 149 96 C149 66 129 44 100 44 Z" fill="url(#nm-hair)" />
              <path d="M87 110 L113 110 L113 134 C113 143 87 143 87 134 Z" fill="#DBA68A" />
              <path d="M100 131 C136 131 166 157 175 200 L25 200 C34 157 64 131 100 131 Z" fill="#FFFDFB" />
              <path d="M100 131 C107 131 114 132 120 134 C114 145 108 150 100 150 C92 150 86 145 80 134 C86 132 93 131 100 131 Z" fill="#E8DAC4" />
              <ellipse cx="100" cy="90" rx="34" ry="38" fill="url(#nm-skin)" />
              <path d="M100 46 C74 46 62 66 62 84 C64 74 70 66 82 62 C97 57 118 60 129 70 C135 75 138 79 139 86 C140 64 126 46 100 46 Z" fill="url(#nm-hair)" />
              <path d="M62 84 C60 70 66 56 78 50 C69 60 65 72 65 84 Z" fill="#8E5B45" opacity="0.6" />
              <path d="M80 79 C85 75 92 75 96 78" stroke="#4E2E22" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d="M104 78 C108 75 115 75 120 79" stroke="#4E2E22" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
              <path d="M80 92 C85 86 92 86 96 92" stroke="#4E2E22" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M104 92 C108 86 115 86 120 92" stroke="#4E2E22" strokeWidth="3" fill="none" strokeLinecap="round" />
              <ellipse cx="78" cy="102" rx="10" ry="6.5" fill="url(#nm-blush)" />
              <ellipse cx="122" cy="102" rx="10" ry="6.5" fill="url(#nm-blush)" />
              <path d="M100 96 L100 103 C100 105 101.5 106 103 106" stroke="#D19E82" strokeWidth="1.9" fill="none" strokeLinecap="round" />
              <path d="M90 112 C95 118 105 118 110 112" stroke="#B8737F" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {!handedOff ? (
          <>
            <h2 className="text-center font-serif italic font-light text-xl leading-snug text-[#1A1816] mb-5">
              You know he loves you. Let&rsquo;s give him a nudge.
            </h2>

            <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
              Your Name / Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sarah"
              className="w-full px-3.5 py-2.5 mb-4 bg-white border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
            />

            <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
              His Mobile Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={14}
              value={phone}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, '');
                if (raw.length === 11 && raw.charAt(0) === '1') raw = raw.slice(1);
                setPhone(formatPhone(raw));
              }}
              placeholder="(555) 000-0000"
              className="w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
            />

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full mt-5 px-6 py-3 bg-[#1A1816] hover:bg-[#38332E] disabled:opacity-40 disabled:cursor-not-allowed text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors"
            >
              Send Him the Gentle Nudge &#10024;
            </button>

            <p className="mt-3 text-center text-[10px] leading-relaxed font-sans text-[#8C8377]">
              Opens your own Messages app so the text comes from you. We never text him
              ourselves and we don&rsquo;t store his number.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-center font-serif italic font-light text-xl text-[#1A1816] mb-4">
              Ready to send &#10024;
            </h2>

            <div className="bg-white border border-[#E8E2D9] rounded p-3.5 font-sans text-xs leading-relaxed text-[#524B43] max-h-[150px] overflow-auto whitespace-pre-wrap break-words">
              {message}
            </div>

            <a
              href={smsHref}
              className="mt-3 w-full flex items-center justify-center gap-2 px-6 py-2.5 border border-[#D5C29F] hover:bg-[#F1E7D6] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Open Messages
            </a>

            <button
              onClick={handleCopy}
              className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-2.5 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy message'}
            </button>

            <p className="mt-3 text-center text-[10px] leading-relaxed font-sans text-[#8C8377]">
              Send it whenever you like. Nothing goes out until you hit send.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[slideIn_0\\.45s_cubic-bezier\\(0\\.22\\,1\\,0\\.36\\,1\\)\\] { animation: none; }
        }
      `}</style>
    </div>
  );
};
