import React, { useState } from 'react';
import { ArrowRight, Loader2, Check, MessageCircle, Mail, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Standalone pre-register page. Routed at /register (see App.tsx). Captures
// the applicant, then offers a 5-friend referral step that speeds up review.
//
// Invites are composed HERE and handed to the visitor's own sms:/mailto:
// client. We never send anything ourselves and never store a friend's raw
// contact info — only a SHA-256 hash, for dedupe. This mirrors the
// NudgeModal's sms: handoff and keeps the visitor as the sender, which is
// what keeps this compliant. Do not add a backend send here.

type Step = 'form' | 'confirmed';

interface InviteRow {
  value: string;
  status: 'idle' | 'sent' | 'copied';
}

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function isEmail(v: string): boolean {
  return /\S+@\S+\.\S+/.test(v);
}

function digitsOnly(v: string): string {
  return v.replace(/\D/g, '');
}

export const RegisterPage: React.FC = () => {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const referredBy = params?.get('ref') || undefined;

  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');

  const [referralCode, setReferralCode] = useState('');
  const [waitlistId, setWaitlistId] = useState('');

  const [invites, setInvites] = useState<InviteRow[]>(
    Array.from({ length: 5 }, () => ({ value: '', status: 'idle' }))
  );

  const goHome = () => {
    window.location.href = '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const { data, error: insertError } = await supabase
        .from('waitlist')
        .insert({
          first_name: firstName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          zip: zip.trim() || null,
          referred_by: referredBy || null,
        })
        .select('id, referral_code')
        .single();

      if (insertError) throw insertError;

      setReferralCode(data.referral_code);
      setWaitlistId(data.id);
      setStep('confirmed');
    } catch (err: any) {
      setError(err?.message || "Couldn't submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inviteMessage = () =>
    `I signed up for Swoon Plans and thought of you — it plans real date nights, curated venues and all. First plan is free: https://www.makeherswoon.com/register?ref=${referralCode}`;

  const recordInviteHash = async (contact: string, channel: 'sms' | 'email') => {
    if (!waitlistId) return;
    try {
      const contact_hash = await sha256(contact);
      await supabase.from('referral_invites').insert({
        waitlist_id: waitlistId,
        contact_hash,
        channel,
      });
    } catch {
      // Non-fatal: the invite still opens on the visitor's device either way.
    }
  };

  const openInvite = async (idx: number) => {
    const raw = invites[idx].value.trim();
    if (!raw) return;
    const msg = inviteMessage();

    if (isEmail(raw)) {
      await recordInviteHash(raw, 'email');
      window.location.href = `mailto:${encodeURIComponent(raw)}?subject=${encodeURIComponent(
        'Check out Swoon Plans'
      )}&body=${encodeURIComponent(msg)}`;
    } else {
      const digits = digitsOnly(raw);
      if (digits.length < 10) return;
      await recordInviteHash(digits, 'sms');
      window.location.href = `sms:${digits}?&body=${encodeURIComponent(msg)}`;
    }

    setInvites((prev) => prev.map((row, i) => (i === idx ? { ...row, status: 'sent' } : row)));
  };

  const copyInviteLink = async () => {
    const msg = inviteMessage();
    try {
      await navigator.clipboard.writeText(msg);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = msg;
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const openAllInvites = () => {
    invites.forEach((row, idx) => {
      if (row.value.trim()) openInvite(idx);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816] flex items-center justify-center px-4 py-16">
      <main className="max-w-lg w-full space-y-8">
        {step === 'form' && (
          <>
            <div className="text-center space-y-3">
              <span className="inline-block text-[10px] uppercase tracking-[0.35em] font-sans text-[#8C8377] font-bold">
                Welcome
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif italic font-light">
                Who Are We Planning For?
              </h1>
              <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed">
                Answer a few quick questions and get a custom date plan in under a minute.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#E8E2D9] rounded-sm p-6 sm:p-8 space-y-4 shadow-sm"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g., James"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
                    Mobile (optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="22314"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E2D9] rounded font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-[#B4483A] font-sans tracking-wide">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-[#1A1816] hover:bg-[#2A2622] disabled:opacity-60 text-[#FAF8F5] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm transition-all cursor-pointer"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Submit Application
              </button>

              <p className="text-[10px] text-[#8C8377] font-sans text-center leading-relaxed">
                Takes about 60 seconds. No card required.
              </p>
            </form>
          </>
        )}

        {step === 'confirmed' && (
          <>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A1816] text-[#D5C29F] rounded-full text-[10px] uppercase tracking-[0.3em] font-sans font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Application received</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif italic font-light">
                You&rsquo;re in review.
              </h1>
              <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed max-w-md mx-auto">
                We approve members by ZIP code so venues never feel crowded. Want to move up?
                Invite five friends below &mdash; each one who registers moves you up the list.
              </p>
            </div>

            <div className="bg-white border border-[#E8E2D9] rounded-sm p-6 sm:p-8 space-y-5 shadow-sm">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-2">
                  Invite 5 friends
                </p>
                <div className="space-y-2.5">
                  {invites.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) =>
                          setInvites((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r))
                          )
                        }
                        placeholder="Email or mobile number"
                        className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#E8E2D9] rounded font-sans text-xs text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F]"
                      />
                      <button
                        type="button"
                        onClick={() => openInvite(idx)}
                        disabled={!row.value.trim()}
                        className="shrink-0 p-2 bg-[#1A1816] hover:bg-[#2A2622] disabled:opacity-40 text-[#D5C29F] rounded cursor-pointer transition-colors"
                        aria-label="Open invite"
                      >
                        {row.status === 'sent' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : isEmail(row.value) ? (
                          <Mail className="w-3.5 h-3.5" />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={openAllInvites}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#1A1816] hover:bg-[#2A2622] text-[#FAF8F5] font-bold text-[11px] uppercase tracking-[0.2em] font-sans rounded-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Open all invites
                </button>
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] font-bold text-[11px] uppercase tracking-[0.2em] font-sans rounded-sm transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy invite
                </button>
              </div>

              <p className="text-[10px] text-[#8C8377] font-sans font-light leading-relaxed text-center">
                Invites open in your own Messages or Mail app and send from you. We never
                contact your friends ourselves and we don&rsquo;t store their details.
              </p>
            </div>

            <button
              type="button"
              onClick={goHome}
              className="w-full text-center text-[10px] uppercase tracking-[0.25em] font-sans text-[#8C8377] hover:text-[#1A1816] transition-colors cursor-pointer"
            >
              Back to home
            </button>
          </>
        )}
      </main>
    </div>
  );
};
