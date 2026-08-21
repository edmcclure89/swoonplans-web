import React from 'react';
import { ArrowLeft } from 'lucide-react';

const SITE_URL = 'https://www.makeherswoon.com';
const LAST_UPDATED = 'August 21, 2026';
const LEGAL_ENTITY = 'For Love Coaching LLC';
const GOVERNING_STATE = 'Virginia';
const CONTACT_EMAIL = 'admin@makeherswoon.com';

interface Section {
  heading: string;
  body: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    heading: '1. Agreement to Terms',
    body: (
      <p>
        These Terms of Service ("Terms") are a binding agreement between you and {LEGAL_ENTITY},
        operating as Swoon Plans ("Swoon Plans," "we," "us," or "our"). By creating an account,
        starting a date plan, or otherwise using makeherswoon.com and the Swoon Plans concierge
        service (the "Services"), you agree to these Terms. If you do not agree, do not use the
        Services.
      </p>
    ),
  },
  {
    heading: '2. What Swoon Plans Does',
    body: (
      <>
        <p>
          Swoon Plans is a date-planning recommendation service for you and your partner. You
          answer a 20-question intake about your partner, and our matching engine generates a
          custom itinerary suggesting real venues, addresses, and direct reservation links.
        </p>
        <p>
          Swoon Plans uses an automated, algorithm-driven system (including AI-assisted matching)
          to generate itinerary recommendations from the answers you provide. We do not manually
          curate every plan, and recommendations are only as accurate as the information you
          submit.
        </p>
      </>
    ),
  },
  {
    heading: '3. Accounts & Eligibility',
    body: (
      <p>
        You must be at least 18 years old to use the Services. You are responsible for keeping
        your login credentials confidential and for all activity that happens under your account.
        You agree to provide accurate information during the intake questionnaire and account
        registration.
      </p>
    ),
  },
  {
    heading: '4. Plans, Billing & Cancellation',
    body: (
      <>
        <p>
          Your first date plan is free and does not require a payment method. Paid plans
          (Starter, Operator, and Command) are billed monthly in U.S. dollars and renew
          automatically until you cancel.
        </p>
        <p>
          You can cancel anytime from your account. Your access continues through the end of the
          period you already paid for, and you will not be charged again after cancellation.
          Unless required by law, payments already made are non-refundable. For billing questions
          or refund requests, email {CONTACT_EMAIL}.
        </p>
        <p>
          Payments are processed by Stripe. Swoon Plans does not store your full card number.
        </p>
      </>
    ),
  },
  {
    heading: '5. Acceptable Use',
    body: (
      <p>
        You agree not to misuse the Services, including by attempting to access other users'
        accounts or data, reverse-engineering the recommendation engine, submitting content that
        is unlawful or infringes another person's rights, or using the Services for any purpose
        other than personal date planning.
      </p>
    ),
  },
  {
    heading: '6. Third-Party Venues & Reservations',
    body: (
      <p>
        Swoon Plans provides recommendations and reservation links for independent third-party
        venues. We are not affiliated with, and do not accept payment on behalf of, any venue
        listed in a plan. Reservations, venue policies, pricing, availability, and any spending at
        a venue are between you and that venue. We are not responsible for a venue's conduct,
        cancellation policy, or the accuracy of information a venue provides to us.
      </p>
    ),
  },
  {
    heading: '7. Intellectual Property',
    body: (
      <p>
        The Swoon Plans name, website, recommendation engine, and all associated content and
        branding are the property of {LEGAL_ENTITY} and are protected by applicable copyright and
        trademark law. We grant you a limited, personal, non-transferable license to use the
        Services for your own date planning. You retain ownership of the information you submit
        about your partner, and you grant us a license to use it solely to generate and improve
        your itinerary and the Services.
      </p>
    ),
  },
  {
    heading: '8. Disclaimer of Warranties',
    body: (
      <p>
        The Services, including all itinerary recommendations, are provided "as is" and "as
        available," without warranties of any kind, express or implied. We do not guarantee that
        any recommended venue, reservation link, or itinerary detail will be accurate, available,
        or error-free at the time you use it.
      </p>
    ),
  },
  {
    heading: '9. Limitation of Liability',
    body: (
      <p>
        To the maximum extent permitted by law, {LEGAL_ENTITY} and its owners, employees, and
        contractors will not be liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of profits or data, arising from your use of the Services or
        any venue, reservation, or third party referenced in a plan. Our total liability for any
        claim relating to the Services will not exceed the amount you paid us in the three months
        before the claim arose.
      </p>
    ),
  },
  {
    heading: '10. Indemnification',
    body: (
      <p>
        You agree to indemnify and hold {LEGAL_ENTITY} harmless from any claim or demand, including
        reasonable attorneys' fees, arising out of your misuse of the Services or your violation of
        these Terms.
      </p>
    ),
  },
  {
    heading: '11. Dispute Resolution: Binding Arbitration & Class Action Waiver',
    body: (
      <>
        <p>
          You and Swoon Plans agree to resolve any dispute arising out of or relating to these
          Terms or the Services through final and binding individual arbitration, rather than in
          court, except that either party may bring an individual claim in small claims court.
        </p>
        <p>
          You and Swoon Plans each waive the right to a jury trial and the right to participate in
          a class action, class arbitration, or representative action. Any arbitration will be
          conducted on an individual basis only.
        </p>
      </>
    ),
  },
  {
    heading: '12. Governing Law',
    body: (
      <p>
        These Terms are governed by the laws of the Commonwealth of {GOVERNING_STATE}, without
        regard to its conflict-of-laws rules, except where the Federal Arbitration Act applies to
        Section 11.
      </p>
    ),
  },
  {
    heading: '13. Termination',
    body: (
      <p>
        We may suspend or terminate your account if you violate these Terms. You may stop using
        the Services and cancel your account at any time.
      </p>
    ),
  },
  {
    heading: '14. Changes to These Terms',
    body: (
      <p>
        We may update these Terms from time to time. If we make material changes, we will update
        the "last updated" date below. Continued use of the Services after a change means you
        accept the revised Terms.
      </p>
    ),
  },
  {
    heading: '15. Contact',
    body: (
      <p>
        Questions about these Terms? Email us at {CONTACT_EMAIL}.
      </p>
    ),
  },
];

export const TermsPage: React.FC = () => {
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
            href="/privacy"
            className="text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#8C8377] font-bold">
          Legal
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif italic font-light text-[#1A1816] mt-3 leading-tight">
          Terms of Service
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
