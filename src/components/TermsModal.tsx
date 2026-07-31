import React from 'react';
import { ShieldCheck, FileText, Lock, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-sm border border-[#E8E2D9] p-6 sm:p-10 relative my-8 text-[#1A1816] shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C8377] hover:text-[#1A1816] p-2 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 border-b border-[#E8E2D9] pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FOR LOVE COACHING • LEGAL & TERMS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816]">
            Terms of Service & Privacy Policy
          </h2>
          <p className="text-xs text-[#8C8377] font-sans font-light">
            Swoon Plans Concierge is a protected division of For Love Coaching.
          </p>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 font-sans text-xs text-[#524B43] leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans">
              1. Proprietary Concierge & Coaching Services
            </h3>
            <p>
              Swoon Plans operates under For Love Coaching. All bespoke date itineraries, recommendation frameworks, conversation cards, and concierge processes provided are proprietary intellectual property protected under applicable federal and international copyright laws.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans">
              2. Custom Preference Questionnaire & Accuracy
            </h3>
            <p>
              To deliver custom-tailored date experiences suited specifically to your partner’s tastes, clients answer a 15-question preference assessment. Our matching algorithm generates itineraries based on submitted preferences. Client information remains strictly confidential and is never sold or shared.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans">
              3. Reservations & Third-Party Venues
            </h3>
            <p>
              Swoon Plans provides curated venue recommendations and direct reservation links for independent third-party venues (restaurants, rooftop lounges, private charters). You are responsible for completing your own reservations; venue policies and fulfillment remain under the jurisdiction of the respective venue management.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans">
              4. Client Privacy & Discretion Guarantee
            </h3>
            <p>
              We guarantee 100% discretion. All client inquiries, partner notes, and custom date plans are treated with strict confidentiality. Your partner will only know what you choose to share.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans">
              5. Intellectual Property Notice
            </h3>
            <p>
              © {new Date().getFullYear()} Swoon Plans Concierge • A Division of For Love Coaching. All rights reserved. Reproduction or unauthorized commercial redistribution of Swoon Plans materials without written consent is strictly prohibited.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8E2D9] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded cursor-pointer transition-colors"
          >
            I UNDERSTAND
          </button>
        </div>
      </div>
    </div>
  );
};
