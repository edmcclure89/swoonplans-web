import React from 'react';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = 'August 21, 2026';
const LEGAL_ENTITY = 'For Love Coaching LLC';
const CONTACT_EMAIL = 'admin@makeherswoon.com';

interface Section {
  heading: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    heading: '1. Overview',
    body: (
      <p>
        This Privacy Policy explains what information Swoon Plans ({LEGAL_ENTITY}) collects when
        you use makeherswoon.com and the Swoon Plans concierge service, how we use it, and the
        choices you have. It applies to all users of the Services.
      </p>
    ),
  },
  {
    heading: '2. Information We Collect',
    body: (
      <>
        <p><strong>Account information:</strong> your email address and any name you provide when you create an account.</p>
        <p><strong>Partner preference data:</strong> the answers you submit in the 20-question intake about your partner, used to generate your itinerary. This may include preferences, interests, and other details you choose to share.</p>
        <p><strong>Payment information:</strong> if you subscribe to a paid plan, our payment processor Stripe collects your billing details directly. Swoon Plans does not receive or store your full card number.</p>
        <p><strong>Usage data:</strong> basic technical information such as pages visited, device and browser type, and general analytics collected through standard web analytics tools.</p>
        <p><strong>Communications:</strong> emails you send us, and transactional or marketing emails we send you.</p>
      </>
    ),
  },
  {
    heading: '3. How We Use Your Information',
    body: (
      <p>
        We use your information to create and manage your account, generate your date itinerary,
        process payments, respond to support requests, send you plan-related and account emails,
        and improve the Services. We do not use your partner's preference data for anything other
        than generating and improving your itinerary.
      </p>
    ),
  },
  {
    heading: '4. Automated & AI-Assisted Processing',
    body: (
      <p>
        Swoon Plans uses an automated, algorithm-driven matching engine, including AI-assisted
        processing, to turn your intake answers into a recommended itinerary. This processing
        happens automatically based on the information you submit and does not involve a human
        reviewing your answers as part of generating the plan.
      </p>
    ),
  },
  {
    heading: '5. Third-Party Service Providers',
    body: (
      <>
        <p>We share information with service providers who help us run the Services, including:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Supabase, for account authentication and database hosting.</li>
          <li>Stripe, for payment processing.</li>
          <li>Resend and Zoho Mail, for transactional and account email delivery.</li>
          <li>Vercel, for website hosting.</li>
          <li>Standard web analytics tools, to understand site usage.</li>
        </ul>
        <p>
          These providers only receive the information needed to perform their function and are
          not permitted to use it for their own purposes.
        </p>
      </>
    ),
  },
  {
    heading: '6. We Do Not Sell Your Data',
    body: (
      <p>
        We do not sell your personal information or your partner's preference data to third
        parties, and we do not share it with venues beyond what is needed to complete a
        reservation you choose to make.
      </p>
    ),
  },
  {
    heading: '7. Data Retention',
    body: (
      <p>
        We retain your account and preference data for as long as your account is active, and for
        a reasonable period afterward to comply with legal obligations, resolve disputes, and
        enforce our agreements. You can request deletion at any time (see Section 8).
      </p>
    ),
  },
  {
    heading: '8. Your Rights & Choices',
    body: (
      <p>
        You can access, correct, or delete your account information by contacting us at{' '}
        {CONTACT_EMAIL}. Depending on where you live, you may have additional rights under laws
        such as the California Consumer Privacy Act (CCPA) or, for EU/UK users, the GDPR, including
        the right to request a copy of your data or object to certain processing. We will respond
        to verified requests within a reasonable time.
      </p>
    ),
  },
  {
    heading: '9. Cookies & Tracking',
    body: (
      <p>
        We use cookies and similar technologies to keep you logged in and to understand how the
        Services are used. You can control cookies through your browser settings, though disabling
        them may affect how the Services function.
      </p>
    ),
  },
  {
    heading: '10. Children\u2019s Privacy',
    body: (
      <p>
        The Services are not directed to anyone under 18, and we do not knowingly collect
        information from children.
      </p>
    ),
  },
  {
    heading: '11. Data Security',
    body: (
      <p>
        We use reasonable technical and organizational measures to protect your information, but
        no method of transmission or storage is completely secure, and we cannot guarantee
        absolute security.
      </p>
    ),
  },
  {
    heading: '12. Changes to This Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. If we make material changes, we will
        update the "last updated" date below.
      </p>
    ),
  },
  {
    heading: '13. Contact',
    body: (
      <p>
        Questions about this Privacy Policy or your data? Email us at {CONTACT_EMAIL}.
      </p>
    ),
  },
];

export const PrivacyPage: React.FC = () => {
  const goHome = () => { window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816]">
      <header className="border-b border-[#E8E2D9] bg-[#FAF8F5]/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <button
            onClick={goHome}
            className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Swoon Plans
          </button>
          <a
            href="/terms"
            className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] font-bold">
          Legal
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif italic font-light text-[#1A1816] mt-3 leading-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#8C8377] font-sans mt-4">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8 font-sans text-sm sm:text-base text-[#38332E] leading-relaxed font-light mt-10">
          {SECTIONS.map((s) => (
            <div key={s.heading} className="space-y-2">
              <h2 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider font-sans not-italic">
                {s.heading}
              </h2>
              <div className="space-y-3">{s.body}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
