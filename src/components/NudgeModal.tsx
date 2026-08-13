import React from 'react';
import { X, MessageSquare } from 'lucide-react';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A soft "remind me later" nudge. Its only handoff is an sms: link that
// pre-fills a reminder text on the buyer's own phone. This is a pure client
// handoff: there is no backend SMS sending here, and this handoff must not
// be changed to route through checkout or any server.
const REMINDER_BODY =
  "Reminder from Swoon Plans: grab the Founders Pass for instant access. https://www.makeherswoon.com";
const SMS_HREF = `sms:?&body=${encodeURIComponent(REMINDER_BODY)}`;

export const NudgeModal: React.FC<NudgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] max-w-md w-full rounded-sm border border-[#E8E2D9] p-6 sm:p-10 relative my-8 text-[#1A1816] shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8377] hover:text-[#1A1816] p-2 transition-colors cursor-pointer"
          aria-label="Close reminder"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 border-b border-[#E8E2D9] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Remind Me Later</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816]">
            Text yourself a reminder
          </h2>
          <p className="text-xs text-[#8C8377] font-sans font-light leading-relaxed">
            Not ready right now? Send a quick reminder to your phone so the Founders Pass is one tap away later.
          </p>
        </div>

        <a
          href={SMS_HREF}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-[11px] uppercase tracking-[0.2em] font-sans rounded-sm transition-all cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          Text me the reminder
        </a>

        <button
          onClick={onClose}
          className="w-full text-center text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
        >
          No thanks
        </button>
      </div>
    </div>
  );
};
