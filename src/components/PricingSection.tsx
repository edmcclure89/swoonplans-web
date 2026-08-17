import React from 'react';
import { Check, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onOpenInquire: () => void;
}

// Prices mirror the live Stripe catalog exactly ($11.87 / $32.50 / $197.00 per
// month). If a price changes in Stripe it must change here too, or the public
// page will contradict what customers are actually charged.
const PLANS = [
  {
    name: 'Starter',
    price: '$11.87',
    cadence: 'per month',
    blurb: 'For the one woman you are planning around.',
    features: [
      '1 saved date profile',
      'Unlimited date plans for her',
      'Real venues with addresses and phone numbers',
      'Direct reservation links',
      'Swap any stop you do not like',
    ],
    featured: false,
  },
  {
    name: 'Operator',
    price: '$32.50',
    cadence: 'per month',
    blurb: 'For anniversaries, birthdays, and everyone you plan for.',
    features: [
      'Up to 3 saved date profiles',
      'Everything in Starter',
      'Text or share the finished plan',
      'Priority venue matching',
    ],
    featured: true,
  },
  {
    name: 'Command',
    price: '$197',
    cadence: 'per month',
    blurb: 'For concierges, planners, and anyone booking at volume.',
    features: [
      'Unlimited saved date profiles',
      'Everything in Operator',
      'Text or share the finished plan',
      'Priority support',
    ],
    featured: false,
  },
];

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenInquire }) => {
  return (
    <section id="pricing" className="w-full bg-[#FAF8F5] py-20 px-6 sm:px-12 border-t border-[#E8E2D9]">
      <div className="max-w-6xl mx-auto">

        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#8C8377] font-bold">
            Membership
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-3">
            Simple Pricing
          </h2>
          <p className="text-sm sm:text-base text-[#6E675F] font-sans mt-4 font-light leading-relaxed">
            Swoon Plans is a date planning service. Answer 20 short questions about her and
            we build a full evening: real venues, exact addresses, and direct reservation
            links. Your first plan is free. No card required to try it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col p-8 rounded-sm border transition-all ${
                plan.featured
                  ? 'border-[#1A1816] bg-[#1A1816] shadow-xl'
                  : 'border-[#E8E2D9] bg-white'
              }`}
            >
              {plan.featured && (
                <span className="self-start text-[9px] uppercase tracking-[0.3em] font-sans font-bold text-[#1A1816] bg-[#D5C29F] px-2.5 py-1 rounded-sm mb-4">
                  Most Popular
                </span>
              )}

              <h3
                className={`text-xl font-serif italic ${
                  plan.featured ? 'text-white' : 'text-[#1A1816]'
                }`}
              >
                {plan.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-serif ${
                    plan.featured ? 'text-[#D5C29F]' : 'text-[#1A1816]'
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-xs font-sans ${
                    plan.featured ? 'text-[#A89B88]' : 'text-[#8C8377]'
                  }`}
                >
                  {plan.cadence}
                </span>
              </div>

              <p
                className={`text-sm font-sans font-light mt-3 leading-relaxed ${
                  plan.featured ? 'text-[#A89B88]' : 'text-[#6E675F]'
                }`}
              >
                {plan.blurb}
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.featured ? 'text-[#D5C29F]' : 'text-[#8FB89E]'
                      }`}
                    />
                    <span
                      className={`text-sm font-sans font-light leading-snug ${
                        plan.featured ? 'text-[#E2D5C3]' : 'text-[#4A443F]'
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onOpenInquire}
                className={`mt-8 w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-all cursor-pointer ${
                  plan.featured
                    ? 'bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816]'
                    : 'bg-[#1A1816] hover:bg-[#2A2622] text-[#FAF8F5]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Start Free
              </button>
            </div>
          ))}
        </div>

        {/* Billing terms. Stripe requires that cancellation, renewal, and refund
            terms be findable without creating an account. */}
        <div className="mt-14 max-w-3xl mx-auto border-t border-[#E8E2D9] pt-10">
          <h3 className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-[#8C8377] text-center">
            Billing Terms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mt-6">
            <div>
              <p className="text-sm font-semibold text-[#1A1816] font-sans">Free first plan</p>
              <p className="text-sm text-[#6E675F] font-sans font-light mt-1 leading-relaxed">
                Your first date plan is free and requires no payment method.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1816] font-sans">Monthly renewal</p>
              <p className="text-sm text-[#6E675F] font-sans font-light mt-1 leading-relaxed">
                Plans are billed monthly in US dollars and renew automatically until cancelled.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1816] font-sans">Cancel anytime</p>
              <p className="text-sm text-[#6E675F] font-sans font-light mt-1 leading-relaxed">
                Cancel whenever you like. Access continues through the end of the period you
                already paid for, and you are not charged again.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1816] font-sans">Questions or refunds</p>
              <p className="text-sm text-[#6E675F] font-sans font-light mt-1 leading-relaxed">
                Email{' '}
                <a
                  href="mailto:admin@makeherswoon.com"
                  className="text-[#1A1816] font-medium underline underline-offset-2"
                >
                  admin@makeherswoon.com
                </a>{' '}
                and we will get back to you.
              </p>
            </div>
          </div>

          <p className="text-xs text-[#8C8377] font-sans font-light text-center mt-10 leading-relaxed">
            Swoon Plans provides date planning recommendations only. We are not affiliated with,
            and do not take payment on behalf of, any venue listed in a plan. Reservations and
            any spending at a venue are arranged directly by you.
          </p>
        </div>

      </div>
    </section>
  );
};
