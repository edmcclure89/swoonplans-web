import React, { useMemo, useState } from 'react';
import { Check, Copy, Mail, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';

// =============================================================================
// Pre-registration page (/register)
//
// Step 1  Capture      -> POST /api/register (inserts into Supabase `waitlist`)
// Step 2  Confirmation -> queue position + the registrant's own referral code
// Step 3  Invite five  -> CLIENT-SIDE ONLY contact handoff
//
// CRITICAL: we never send anything to a friend from the server. Each invite is
// opened on the user's OWN device via an sms:/mailto: deep link, so the user is
// the sender (a third party who never opted in receiving a text is TCPA
// exposure at $500-$1,500 per message). For dedupe we POST only a SHA-256 hash
// of the contact — never the raw phone number or email.
// =============================================================================

const REFERRAL_BASE = 'https://makeherswoon.com/register';
const INVITE_SUBJECT = 'Thought you would appreciate this';

function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const isMobileDevice = (): boolean =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

// A contact row is either an email or a phone. We detect which from the raw input.
type ContactKind = 'email' | 'phone' | 'empty' | 'invalid';
function classifyContact(raw: string): { kind: ContactKind; normalized: string } {
  const value = raw.trim();
  if (!value) return { kind: 'empty', normalized: '' };
  if (value.includes('@')) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return { kind: ok ? 'email' : 'invalid', normalized: value.toLowerCase() };
  }
  const digits = value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (digits.length === 10) return { kind: 'phone', normalized: digits };
  return { kind: 'invalid', normalized: value };
}

// SHA-256 hex of the normalized contact, computed in the browser. Only this
// opaque hash ever leaves the device for dedupe — the raw contact does not.
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface CaptureState {
  firstName: string;
  email: string;
  phone: string;
  zip: string;
}

export const RegisterPage: React.FC = () => {
  const referredBy = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('ref') || '';
    } catch {
      return '';
    }
  }, []);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<CaptureState>({ firstName: '', email: '', phone: '', zip: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [referralCode, setReferralCode] = useState<string>('');
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const canSubmit = form.firstName.trim().length > 0 && emailValid && form.zip.trim().length >= 3;

  const referralLink = referralCode ? `${REFERRAL_BASE}?ref=${referralCode}` : REFERRAL_BASE;
  const inviteBody =
    `I just registered for SwoonPlans — it plans a whole date night for you, real venues and reservations included. ` +
    `Register with my link and it bumps me up the list: ${referralLink}`;

  const submitCapture = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          email: form.email,
          phone: form.phone,
          zip: form.zip,
          referredBy: referredBy || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setReferralCode(data.referralCode || '');
      setQueuePosition(typeof data.queuePosition === 'number' ? data.queuePosition : null);
      setStep(2);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
    } catch {
      /* clipboard may be blocked; the link is visible on screen regardless */
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-serif selection:bg-[#E2D5C3] selection:text-[#1A1816] flex flex-col">
      {/* Slim header */}
      <header className="px-6 sm:px-12 py-6 border-b border-[#E8E2D9] flex items-center justify-between">
        <a href="/" className="text-xl sm:text-2xl font-serif tracking-[0.2em] italic font-light text-[#1A1816]">
          SWOON PLANS
        </a>
        <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#8C8377] font-bold hidden sm:block">
          Pre-Registration
        </span>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-6 py-12 sm:py-16">
        {/* Progress rail */}
        <div className="flex items-center justify-center gap-2 mb-10" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 rounded-full transition-all ${
                n <= step ? 'w-10 bg-[#D5C29F]' : 'w-6 bg-[#E8E2D9]'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <section aria-labelledby="capture-heading">
            <p className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold text-[#8C8377] mb-3 text-center">
              Founders List
            </p>
            <h1
              id="capture-heading"
              className="font-serif italic font-light text-3xl sm:text-4xl leading-tight text-center text-balance mb-3"
            >
              Request your invitation
            </h1>
            <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed text-center mb-8 text-pretty">
              We approve members by ZIP code so venues never feel crowded. Tell us where to reach you.
            </p>

            <div className="space-y-4">
              <Field label="First Name">
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="e.g., Sarah"
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Mobile (optional)">
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={14}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value.replace(/\D/g, '')) }))}
                  placeholder="(555) 000-0000"
                  className={inputClass}
                />
              </Field>
              <Field label="ZIP Code">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.zip}
                  onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                  placeholder="10001"
                  className={inputClass}
                />
              </Field>
            </div>

            {error && (
              <p className="mt-4 text-xs font-sans text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={submitCapture}
              disabled={!canSubmit || submitting}
              className="w-full mt-7 px-6 py-3.5 bg-[#1A1816] hover:bg-[#38332E] disabled:opacity-40 disabled:cursor-not-allowed text-[#D5C29F] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting…' : 'Request Access'}
              {!submitting && <ArrowRight className="w-4 h-4" />}
            </button>
            <p className="mt-3 text-center text-[11px] font-sans text-[#8C8377] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              We review every application. No charge to join the list.
            </p>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="confirm-heading" className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#F1E7D6] border border-[#D5C29F] flex items-center justify-center mx-auto mb-6">
              <Check className="w-6 h-6 text-[#1A1816]" />
            </div>
            <h1 id="confirm-heading" className="font-serif italic font-light text-3xl sm:text-4xl leading-tight text-balance mb-4">
              You&rsquo;re in review. We approve members by ZIP code so venues never feel crowded.
            </h1>

            {queuePosition !== null && (
              <div className="my-8">
                <p className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold text-[#8C8377] mb-2">
                  Your Position
                </p>
                <p className="font-serif italic font-light text-5xl text-[#1A1816]">
                  #{queuePosition.toLocaleString()}
                </p>
              </div>
            )}

            <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed text-pretty mb-8">
              Want to move up? Invite five friends. Each one who registers moves you up the list.
            </p>

            <div className="bg-white border border-[#E8E2D9] rounded-sm p-4 text-left">
              <p className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-2">
                Your Referral Link
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-sans text-[#524B43] break-all">{referralLink}</code>
                <button
                  onClick={copyReferralLink}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-[#E8E2D9] hover:bg-[#F1E7D6] text-[#1A1816] font-bold text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm cursor-pointer transition-colors"
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {linkCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full mt-7 px-6 py-3.5 bg-[#1A1816] hover:bg-[#38332E] text-[#D5C29F] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm cursor-pointer transition-colors inline-flex items-center justify-center gap-2"
            >
              Invite Five Friends
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        )}

        {step === 3 && <InviteStep inviteBody={inviteBody} referrerCode={referralCode} />}
      </main>

      <footer className="px-6 py-8 border-t border-[#E8E2D9] text-center">
        <p className="text-[9px] uppercase tracking-[0.25em] font-sans text-[#8C8377]">
          New York &middot; Los Angeles &middot; Miami &middot; Nationwide
        </p>
      </footer>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Step 3 — invite five friends. Entirely client-side handoff.
// -----------------------------------------------------------------------------
interface InviteRowState {
  value: string;
  handedOff: boolean;
  copied: boolean;
}

const InviteStep: React.FC<{ inviteBody: string; referrerCode: string }> = ({ inviteBody, referrerCode }) => {
  const [rows, setRows] = useState<InviteRowState[]>(
    Array.from({ length: 5 }, () => ({ value: '', handedOff: false, copied: false })),
  );

  const buildLink = (kind: 'email' | 'phone', normalized: string): string => {
    if (kind === 'phone') {
      return `sms:${normalized}?&body=${encodeURIComponent(inviteBody)}`;
    }
    return `mailto:${normalized}?subject=${encodeURIComponent(INVITE_SUBJECT)}&body=${encodeURIComponent(inviteBody)}`;
  };

  // Fire-and-forget: record ONLY the SHA-256 hash of the contact for dedupe.
  const recordHash = async (normalized: string) => {
    try {
      const contactHash = await sha256Hex(normalized);
      await fetch('/api/referral-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactHash, referrerCode }),
      });
    } catch {
      /* dedupe is best-effort; never blocks the invite */
    }
  };

  const openRow = async (index: number) => {
    const { kind, normalized } = classifyContact(rows[index].value);
    if (kind !== 'email' && kind !== 'phone') return;
    // Record the hash first (does not transmit the raw contact), then open the
    // user's own Messages/Mail app so the invite is sent BY them.
    void recordHash(normalized);
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, handedOff: true } : r)));
    window.location.href = buildLink(kind, normalized);
  };

  const copyRow = async (index: number) => {
    const { kind, normalized } = classifyContact(rows[index].value);
    if (kind !== 'email' && kind !== 'phone') return;
    try {
      await navigator.clipboard.writeText(inviteBody);
    } catch {
      /* clipboard blocked; the invite text is still assembled below */
    }
    void recordHash(normalized);
    setRows((rs) => rs.map((r, i) => (i === index ? { ...r, copied: true, handedOff: true } : r)));
    setTimeout(() => setRows((rs) => rs.map((r, i) => (i === index ? { ...r, copied: false } : r))), 1600);
  };

  const openAll = () => {
    const firstValid = rows.findIndex((r) => {
      const { kind } = classifyContact(r.value);
      return kind === 'email' || kind === 'phone';
    });
    if (firstValid !== -1) void openRow(firstValid);
  };

  const anyValid = rows.some((r) => {
    const { kind } = classifyContact(r.value);
    return kind === 'email' || kind === 'phone';
  });

  return (
    <section aria-labelledby="invite-heading">
      <p className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold text-[#8C8377] mb-3 text-center">
        Move Up The List
      </p>
      <h1 id="invite-heading" className="font-serif italic font-light text-3xl sm:text-4xl leading-tight text-center text-balance mb-3">
        Invite five friends
      </h1>
      <p className="text-sm text-[#6E675F] font-sans font-light leading-relaxed text-center mb-8 text-pretty">
        Enter an email or a mobile number for each. Each friend who registers moves you up.
      </p>

      <div className="space-y-3">
        {rows.map((row, i) => {
          const { kind } = classifyContact(row.value);
          const rowValid = kind === 'email' || kind === 'phone';
          return (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={row.value}
                onChange={(e) =>
                  setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))
                }
                placeholder="email or mobile number"
                aria-label={`Friend ${i + 1} email or mobile number`}
                className={inputClass}
              />
              <button
                onClick={() => openRow(i)}
                disabled={!rowValid}
                aria-label={`Send invite to friend ${i + 1}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#1A1816] hover:bg-[#38332E] disabled:opacity-30 disabled:cursor-not-allowed text-[#D5C29F] font-bold text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm cursor-pointer transition-colors"
              >
                {row.handedOff && !row.copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : kind === 'email' ? (
                  <Mail className="w-3.5 h-3.5" />
                ) : (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                Send
              </button>
              <button
                onClick={() => copyRow(i)}
                disabled={!rowValid}
                aria-label={`Copy invite for friend ${i + 1}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 border border-[#E8E2D9] hover:bg-[#F1E7D6] disabled:opacity-30 disabled:cursor-not-allowed text-[#1A1816] font-bold text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm cursor-pointer transition-colors"
              >
                {row.copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={openAll}
        disabled={!anyValid}
        className="w-full mt-6 px-6 py-3.5 border border-[#D5C29F] hover:bg-[#F1E7D6] disabled:opacity-40 disabled:cursor-not-allowed text-[#1A1816] font-bold text-xs uppercase tracking-[0.25em] font-sans rounded-sm cursor-pointer transition-colors"
      >
        Open All Invites
      </button>

      <p className="mt-4 text-center text-[11px] leading-relaxed font-sans text-[#8C8377] text-pretty">
        Invites open in your own Messages or Mail app and send from you. We never contact your friends
        ourselves and we don&rsquo;t store their details.
      </p>

      <div className="mt-8 text-center">
        <a href="/" className="text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-[#1A1816] hover:underline">
          Done for now
        </a>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Shared bits
// -----------------------------------------------------------------------------
const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-[#E8E2D9] rounded-sm font-sans text-sm text-[#1A1816] placeholder:text-[#B5ADA2] focus:outline-none focus:border-[#D5C29F] focus:ring-2 focus:ring-[#D5C29F]/30';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8377] mb-1.5">
      {label}
    </span>
    {children}
  </label>
);
