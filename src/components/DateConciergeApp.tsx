import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, ArrowRight, MapPin, Phone, Loader2, RefreshCw, CheckCircle2, Sparkles, Lock, MessageSquare } from 'lucide-react';
import { supabase, refreshMe, MeStatus, maxProfilesForPlan, loadProfiles, saveProfiles, SavedProfile } from '../lib/supabase';
import { introSteps, personalityQuestions, holidayStep, dateMoodStep, QuizStep, TYPE_PROFILES, PRICE_IDS } from '../data/personality';
import { generateItinerary, rerollStop, venueReservation, Itinerary } from '../lib/itinerary';

interface DateConciergeAppProps {
  isOpen: boolean;
  onClose: () => void;
}

type Screen = 'register' | 'signin' | 'checkEmail' | 'welcome' | 'quiz' | 'loading' | 'output' | 'pricing' | 'gate';

// --- In-progress work persistence -------------------------------------------
// The magic-link sign-in bounces the user out to their inbox and back, which
// used to wipe 20 answers. We stash the finished plan so returning users land
// straight on their result instead of starting over.
const PENDING_KEY = 'swoon_pending_plan';

function savePendingPlan(payload: { answers: any; itinerary: any; dateName: string }) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(payload)); } catch { /* ignore */ }
}
function loadPendingPlan(): { answers: any; itinerary: any; dateName: string } | null {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch { return null; }
}
function clearPendingPlan() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
}

// Anonymous free-trial marker. The free-plan gate creates the account
// server-side (see submitRegistration) rather than through a magic-link
// sign-in, so there is no client-side Supabase session to hang trial_used
// off of until the person actually returns and signs in. This local flag
// enforces "first plan free" in the meantime.
const TRIAL_KEY = 'swoon_trial_used';
const UNLIMITED_PROMO_CODE = 'EDFAM2026';
const BONUS_PROMO_CODE = 'SP26';
const BONUS_PLAN_LIMIT = 8;
function markLocalTrialUsed() {
  try { localStorage.setItem(TRIAL_KEY, '1'); } catch { /* ignore */ }
}
function hasLocalTrialUsed(): boolean {
  try { return localStorage.getItem(TRIAL_KEY) === '1'; } catch { return false; }
}

const GOLD = '#D5C29F';
const INK = '#1A1816';
const CARD = '#262320';
const BORDER = '#38332E';
const PAPER = '#FAF8F5';

export const DateConciergeApp: React.FC<DateConciergeAppProps> = ({ isOpen, onClose }) => {
  const [hasSession, setHasSession] = useState(false);
  const [meStatus, setMeStatus] = useState<MeStatus | null>(null);
  const [isVipFamily, setIsVipFamily] = useState(false);
  const [screen, setScreen] = useState<Screen>('register');
  const [checking, setChecking] = useState(true);

  // Registration / sign-in form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPromo, setRegPromo] = useState('');
  const [regError, setRegError] = useState('');
  const [regBusy, setRegBusy] = useState(false);
  const [signinEmail, setSigninEmail] = useState('');
  const [signinError, setSigninError] = useState('');
  const [checkEmailText, setCheckEmailText] = useState('');

  // Quiz state
  const [steps, setSteps] = useState<QuizStep[]>([...introSteps, ...personalityQuestions]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [citySearch, setCitySearch] = useState('');
  const [dateName, setDateName] = useState('');

  // Output state
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setChecking(true);
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const pending = loadPendingPlan();

      if (session) {
        setHasSession(true);
        const { meStatus: ms, isVipFamily: vip } = await refreshMe();
        setMeStatus(ms);
        setIsVipFamily(vip);

        // Came back from the email link with a finished plan waiting? Show it.
        // Making them redo 20 questions after signing in was the single worst
        // drop-off point in the funnel.
        if (pending && pending.itinerary) {
          setAnswers(pending.answers || {});
          setDateName(pending.dateName || '');
          setItinerary(pending.itinerary);
          setScreen('output');
          clearPendingPlan();
          markTrialUsed(ms, vip);
          setChecking(false);
          return;
        }
        route(ms, vip, true);
      } else {
        // No account yet: let them straight into the quiz. We ask for an email
        // at the end, once they've actually seen what they're getting. If
        // they've already spent their free plan anonymously, send them to
        // pricing instead of letting them re-run the quiz for another one.
        setScreen(hasLocalTrialUsed() ? 'pricing' : 'welcome');
      }
      setChecking(false);
    })();
  }, [isOpen]);

  function route(ms: MeStatus | null, vip: boolean, signedIn: boolean) {
    if (!signedIn) { setScreen('welcome'); return; }
    if (vip) { setScreen('welcome'); return; }
    if (!ms) { setScreen('welcome'); return; }
    // 'past_due' keeps access while Stripe retries the card. A genuinely
    // cancelled subscription comes through as 'canceled' and is blocked here.
    const entitled = ms.subscription_status === 'active'
      || ms.subscription_status === 'trialing'
      || ms.subscription_status === 'past_due';
    if (entitled || !ms.trial_used || (ms.bonus_plans_remaining || 0) > 0) { setScreen('welcome'); }
    else { setScreen('pricing'); }
  }

  if (!isOpen) return null;

  // Fire-and-forget: email the finished plan to the address we have. Non-blocking
  // and non-fatal so a mail hiccup never interrupts the funnel. (Item 1)
  function emailItinerary(toEmail: string | null | undefined, plan: any, who: string) {
    if (!toEmail || !plan) return;
    fetch('/api/send-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail, dateName: who || '', itinerary: plan }),
    }).catch(() => {});
  }

  // Mark the free plan as spent so the next inquiry hits the paywall. Only for
  // signed-in, non-entitled, non-VIP users who haven't already used it. (Item 2)
  async function markTrialUsed(ms: MeStatus | null = meStatus, vip: boolean = isVipFamily) {
    try {
      const entitled = ms?.subscription_status === 'active'
        || ms?.subscription_status === 'trialing'
        || ms?.subscription_status === 'past_due';
      if (vip || entitled) return;
      if (!ms?.trial_used) {
        await supabase.auth.updateUser({ data: { trial_used: true } });
        setMeStatus((prev) => (prev ? { ...prev, trial_used: true } : prev));
        return;
      }
      const bonus = ms?.bonus_plans_remaining || 0;
      if (bonus > 0) {
        const nextBonus = bonus - 1;
        await supabase.auth.updateUser({ data: { bonus_plans_remaining: nextBonus } });
        setMeStatus((prev) => (prev ? { ...prev, bonus_plans_remaining: nextBonus } : prev));
      }
    } catch {
      /* non-fatal */
    }
  }

  async function submitRegistration() {
    if (!regEmail || !regEmail.includes('@')) { setRegError('Enter a valid email address.'); return; }
    setRegError(''); setRegBusy(true);
    const vip = regPromo.trim().toUpperCase() === UNLIMITED_PROMO_CODE;
    const bonusRequested = regPromo.trim().toUpperCase() === BONUS_PROMO_CODE;
    const cleanName = regName;

    if (itinerary) {
      // Free-plan gate: one email only, the itinerary itself. The account is
      // created server-side (see /api/send-itinerary), so there is no
      // magic-link round trip, no second email, and no dead-end redirect
      // back to the bare homepage.
      const who = answers['dateName'] || dateName || cleanName;
      try {
        const res = await fetch('/api/send-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: regEmail,
            dateName: who,
            itinerary,
            createAccount: true,
            name: cleanName,
            isVipFamily: vip,
bonusPlans: bonusRequested ? BONUS_PLAN_LIMIT : undefined,
          }),
        });
        if (!res.ok) {
          setRegBusy(false);
          setRegError('Could not send your plan. Try again.');
          return;
        }
      } catch {
        setRegBusy(false);
        setRegError('Could not reach the server. Try again.');
        return;
      }
      setRegBusy(false);
      if (!vip) markLocalTrialUsed();
      clearPendingPlan();
      setScreen('output');
      return;
    }

    // No plan yet, this is a plain account creation (reached via the sign-in
    // page's "Create an account" link before ever touching the quiz). There
    // is nothing else to send them, so this path still needs the magic-link
    // email, redirected back into the app instead of the bare homepage.
    const { error } = await supabase.auth.signInWithOtp({
      email: regEmail,
      options: { data: { name: cleanName, is_vip_family: vip, bonus_plans_remaining: bonusRequested ? BONUS_PLAN_LIMIT : 0 }, emailRedirectTo: window.location.origin + '/?app=1' },
    });
    setRegBusy(false);
    if (error) { setRegError(error.message || 'Could not send the link. Try again.'); return; }
    setCheckEmailText(`We sent a sign-in link to ${regEmail}. Click the link to continue, no password needed.`);
    setScreen('checkEmail');
  }

  async function submitSignIn() {
    if (!signinEmail || !signinEmail.includes('@')) { setSigninError('Enter a valid email address.'); return; }
    setSigninError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: signinEmail,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + '/?app=1' },
    });
    if (error) {
      const msg = (error.message || '').toLowerCase();
      setSigninError(msg.includes('signup') || msg.includes('not found') ? "We couldn't find an account with that email. Create one instead." : (error.message || 'Could not send the link.'));
      return;
    }
    setCheckEmailText(`We sent a sign-in link to ${signinEmail}. Click it to continue, no password needed.`);
    setScreen('checkEmail');
  }

  function startNewProfile() {
    if (!dateName.trim()) return;
    setAnswers({ dateName: dateName.trim() });
    setSteps([...introSteps, ...personalityQuestions]);
    setStepIndex(0);
    setScreen('quiz');
  }

  function isStepAnswered(step: QuizStep): boolean {
    const val = answers[step.id];
    if (step.type === 'text') return !!(val && val.trim().length > 0);
    if (step.multiSelect) return Array.isArray(val) && val.length > 0;
    return val !== undefined;
  }

  function selectOption(step: QuizStep, key: string) {
    if (step.multiSelect) {
      const current: string[] = Array.isArray(answers[step.id]) ? answers[step.id] : [];
      const max = step.maxSelect || 99;
      let next: string[];
      if (current.includes(key)) next = current.filter((k) => k !== key);
      else if (current.length < max) next = [...current, key];
      else next = current;
      setAnswers({ ...answers, [step.id]: next });
    } else {
      setAnswers({ ...answers, [step.id]: key });
      // Single-choice questions always advance on their own, including the
      // searchable city step. That step has the longest option list on the
      // page, so requiring a manual "Next" click meant scrolling back up
      // past dozens of results to find a button that was easy to miss.
      setTimeout(() => {
        setStepIndex((i) => (i < steps.length - 1 ? i + 1 : i));
      }, 260);
    }
  }

  function goNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      finishQuiz();
    }
  }
  function goPrev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function computeTypeCode(): string {
    const axisPairs: Record<string, [string, string]> = { AR: ['A', 'R'], SI: ['S', 'I'], CT: ['C', 'T'], PF: ['P', 'F'] };
    const tally: Record<string, number> = {};
    personalityQuestions.forEach((q) => {
      const val = answers[q.id];
      if (val) tally[val] = (tally[val] || 0) + 1;
    });
    let code = '';
    (['AR', 'SI', 'CT', 'PF'] as const).forEach((axis) => {
      const [a, b] = axisPairs[axis];
      code += (tally[a] || 0) >= (tally[b] || 0) ? a : b;
    });
    return code;
  }

  function finishQuiz() {
    setScreen('loading');
    const code = computeTypeCode();
    const metroKey = answers['city'] || 'washington-dc';
    const budget = answers['budget'] || '$$';
    setTimeout(() => {
      const plan = generateItinerary(metroKey, budget, code);
      setItinerary(plan);
      // Save profile locally so it shows up on the welcome screen next time.
      const name = answers['dateName'] || dateName || 'Her';
      const profiles = loadProfiles();
      profiles[name] = { code, axes: {} };
      saveProfiles(profiles);

      if (hasSession) {
        emailItinerary(meStatus?.email, plan, name);
        markTrialUsed();
        setScreen('output');
      } else if (hasLocalTrialUsed()) {
        setScreen('pricing');
      } else {
        // They've done the work and the plan exists. Now, and only now, ask
        // for an email. Stash everything so the inbox round trip is lossless.
        savePendingPlan({ answers, itinerary: plan, dateName: name });
        setScreen('gate');
      }
    }, 1400);
  }

  function handleReroll(stopIndex: number) {
    if (!itinerary) return;
    const metroKey = answers['city'] || 'washington-dc';
    const budget = answers['budget'] || '$$';
    setItinerary(rerollStop(itinerary, stopIndex, metroKey, budget));
  }

  const step = steps[stepIndex];
  const intakeTotal = steps.filter((s) => s.phase === 'intake').length;
  const personalityTotal = steps.filter((s) => s.phase === 'personality').length;

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1816]/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E8E2D9] rounded shadow-2xl text-[#1A1816] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6E675F] hover:text-[#1A1816] transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10">
          {checking ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#D5C29F] animate-spin" />
              <p className="text-sm text-[#6E675F] font-sans">Checking your account...</p>
            </div>
          ) : screen === 'register' ? (
            <RegisterScreen
              name={regName} setName={setRegName}
              email={regEmail} setEmail={setRegEmail}
              promo={regPromo} setPromo={setRegPromo}
              error={regError} busy={regBusy}
              onSubmit={submitRegistration}
              onSwitchToSignIn={() => setScreen('signin')}
            />
          ) : screen === 'signin' ? (
            <SignInScreen
              email={signinEmail} setEmail={setSigninEmail}
              error={signinError}
              onSubmit={submitSignIn}
              onSwitchToRegister={() => setScreen('register')}
            />
          ) : screen === 'checkEmail' ? (
            <CheckEmailScreen text={checkEmailText} onBack={() => setScreen('register')} />
          ) : screen === 'welcome' ? (
            <WelcomeScreen
              dateName={dateName} setDateName={setDateName}
              onStart={startNewProfile}
              maxProfiles={maxProfilesForPlan(meStatus?.plan || null)}
            />
          ) : screen === 'quiz' ? (
            <QuizScreen
              step={step}
              stepIndex={stepIndex}
              intakeTotal={intakeTotal}
              personalityTotal={personalityTotal}
              answers={answers}
              citySearch={citySearch} setCitySearch={setCitySearch}
              onSelect={(key) => selectOption(step, key)}
              onTextChange={(val) => setAnswers({ ...answers, [step.id]: val })}
              onNext={goNext}
              onPrev={goPrev}
              canGoNext={isStepAnswered(step)}
              canGoPrev={stepIndex > 0}
            />
          ) : screen === 'loading' ? (
            <LoadingScreen />
          ) : screen === 'gate' ? (
            <GateScreen
              itinerary={itinerary}
              dateName={answers['dateName'] || dateName}
              email={regEmail} setEmail={setRegEmail}
              promo={regPromo} setPromo={setRegPromo}
              name={regName} setName={setRegName}
              error={regError} busy={regBusy}
              onSubmit={submitRegistration}
              onSwitchToSignIn={() => setScreen('signin')}
            />
          ) : screen === 'output' && itinerary ? (
            <OutputScreen
              itinerary={itinerary}
              onReroll={handleReroll}
              onSwitchDate={() => { setDateName(''); setScreen('welcome'); }}
              plan={meStatus?.plan || null}
              isVip={isVipFamily}
            />
          ) : screen === 'pricing' ? (
            <PricingScreen onClose={onClose} email={meStatus?.email} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub-screens ---------- */

function RegisterScreen({ name, setName, email, setEmail, promo, setPromo, error, busy, onSubmit, onSwitchToSignIn }: any) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">SWOON PLANS · FIRST PLAN FREE</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-2">Let's Get You Set Up</h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">No password needed. We'll email you a link, then your first plan is free.</p>
      <div className="mt-6 space-y-3">
        <input
          type="text" placeholder="Full Name (optional)" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <input
          type="email" placeholder="Email Address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && email.includes('@')) onSubmit(); }}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <input
          type="text" placeholder="Promo Code (optional)" value={promo}
          onChange={(e) => setPromo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && email.includes('@')) onSubmit(); }}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-2 font-sans">{error}</p>}
      <button
        onClick={onSubmit}
        disabled={busy}
        className="w-full mt-6 py-3.5 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all disabled:opacity-60"
      >
        {busy ? 'Sending...' : 'Email Me a Link'}
      </button>
      <p className="text-center text-xs text-[#6E675F] font-sans mt-4">
        Already have an account?{' '}
        <button onClick={onSwitchToSignIn} className="text-[#D5C29F] font-medium hover:underline">Sign in instead</button>
      </p>
    </div>
  );
}

function SignInScreen({ email, setEmail, error, onSubmit, onSwitchToRegister }: any) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">WELCOME BACK</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-2">Sign In</h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">Enter your email and we'll send you a secure sign-in link.</p>
      <div className="mt-6">
        <input
          type="email" placeholder="Email Address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-2 font-sans">{error}</p>}
      <button
        onClick={onSubmit}
        className="w-full mt-6 py-3.5 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all"
      >
        Email Me a Link
      </button>
      <p className="text-center text-xs text-[#6E675F] font-sans mt-4">
        New here?{' '}
        <button onClick={onSwitchToRegister} className="text-[#D5C29F] font-medium hover:underline">Create an account</button>
      </p>
    </div>
  );
}

function CheckEmailScreen({ text, onBack }: any) {
  return (
    <div className="text-center py-8">
      <Sparkles className="w-10 h-10 text-[#D5C29F] mx-auto mb-4" />
      <h3 className="text-2xl font-serif italic text-[#1A1816]">Check Your Email</h3>
      <p className="text-sm text-[#6E675F] font-sans mt-2 max-w-sm mx-auto font-light">{text}</p>
      <button onClick={onBack} className="mt-6 text-xs text-[#6E675F] hover:text-[#1A1816] font-sans">Didn't get it? Try again</button>
    </div>
  );
}

function WelcomeScreen({ dateName, setDateName, onStart, maxProfiles }: any) {
  const [profiles, setProfiles] = useState<Record<string, SavedProfile>>(() => loadProfiles());
  const names = Object.keys(profiles);
  const hasName = !!dateName.trim();

  function deleteProfile(n: string) {
    const next = { ...profiles };
    delete next[n];
    saveProfiles(next);
    setProfiles(next);
  }

  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">WELCOME</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-2">Who Are We Planning For?</h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">Answer 20 quick questions about her and get a custom date plan in under a minute.</p>

      {names.length > 0 && (
        <div className="mt-6">
          <label className="text-[11px] uppercase tracking-[0.25em] font-sans font-bold text-[#6E675F]">Saved Profiles</label>
          <div className="mt-3 space-y-2">
            {names.map((n) => (
              <div key={n} className="flex items-center justify-between p-4 rounded border border-[#E8E2D9] bg-white hover:border-[#D5C29F]/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base font-semibold text-[#1A1816] truncate">{n}</span>
                  <span className="text-[10px] font-bold text-[#1A1816] bg-[#D5C29F] px-2 py-0.5 rounded tracking-widest shrink-0">{profiles[n].code}</span>
                </div>
                <button
                  onClick={() => deleteProfile(n)}
                  className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F] hover:text-[#D5C29F] transition-colors cursor-pointer shrink-0 ml-3"
                  aria-label={`Remove ${n}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 pt-8 border-t border-[#E8E2D9]">
        <div className="flex items-baseline justify-between mb-3">
          <label htmlFor="new-date-name" className="text-base font-semibold text-[#1A1816] font-sans">
            {names.length > 0 ? 'Plan for Someone New' : 'Get Started'}
          </label>
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F]">Step 1 of 20</span>
        </div>
        <input
          id="new-date-name"
          type="text" placeholder="Her name (or nickname)" value={dateName}
          onChange={(e) => setDateName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && hasName) onStart(); }}
          autoFocus
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-4 text-base text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <button
          onClick={onStart}
          disabled={!hasName}
          className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all ${
            hasName
              ? 'bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] cursor-pointer shadow-lg shadow-[#D5C29F]/10'
              : 'bg-[#38332E] text-[#6E675F] cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Start Her Date Plan
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-[#6E675F] font-sans mt-3 text-center">Takes about 60 seconds. No signup to start.</p>
      </div>
    </div>
  );
}

function GateScreen({ itinerary, dateName, email, setEmail, name, setName, promo, setPromo, error, busy, onSubmit, onSwitchToSignIn }: any) {
  const stops = (itinerary && itinerary.stops) || [];
  const her = (dateName || 'Her').trim();
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">Plan Ready</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-2">
        {her}'s Night Is Mapped
      </h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">
        {stops.length} stops picked around her answers, with addresses and reservation links. Tell us where to send it.
      </p>

      {stops.length > 0 && (
        <div className="mt-6 space-y-2">
          {stops.map((s: any, i: number) => {
            const v = s.venue || {};
            return (
              <div key={i} className="flex items-center gap-3 p-4 rounded border border-[#E8E2D9] bg-white">
                <span className="text-[10px] font-bold text-[#1A1816] bg-[#D5C29F] w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-[#1A1816] truncate">
                    {i === 0 ? (v.name || 'First stop') : (
                      <span className="inline-flex items-center gap-1.5 text-[#6E675F] max-w-full">
                        <Lock className="w-3 h-3 shrink-0" />
                        {/* Never render the real name here. A CSS blur still leaves
                            the text readable in the DOM and in view-source, so the
                            locked rows get a length-matched placeholder instead. */}
                        <span className="blur-[3px] select-none truncate" aria-label="Locked venue">
                          {'•'.repeat(Math.min(18, Math.max(8, (v.name || '').length || 12)))}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#6E675F] font-sans mt-0.5 truncate">
                    {i === 0 ? (v.address || 'Address included') : 'Address and reservation link included'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-[#E8E2D9]">
        <label htmlFor="gate-email" className="text-sm font-semibold text-[#1A1816] font-sans">
          Where should we send it?
        </label>
        <input
          id="gate-email"
          type="email" placeholder="you@email.com" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && email.includes('@')) onSubmit(); }}
          autoFocus
          className="w-full mt-2 bg-white border border-[#E8E2D9] rounded px-4 py-4 text-base text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <input
          type="text" placeholder="Your first name (optional)" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2 bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <input
          type="text" placeholder="Promo Code (optional)" value={promo}
          onChange={(e) => setPromo(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && email.includes('@')) onSubmit(); }}
          className="w-full mt-2 bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        {error && <p className="text-xs text-red-400 mt-2 font-sans">{error}</p>}
        <button
          onClick={onSubmit}
          disabled={busy || !email.includes('@')}
          className={`mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all ${
            !busy && email.includes('@')
              ? 'bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] cursor-pointer shadow-lg shadow-[#D5C29F]/10'
              : 'bg-[#38332E] text-[#6E675F] cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {busy ? 'Sending...' : 'Unlock the Full Plan'}
        </button>
        <p className="text-[11px] text-[#6E675F] font-sans mt-3 text-center">
          No password. First plan is free. Your answers are already saved.
        </p>
        <p className="text-center text-xs text-[#6E675F] font-sans mt-3">
          Already have an account?{' '}
          <button onClick={onSwitchToSignIn} className="text-[#D5C29F] font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}

function QuizScreen({ step, stepIndex, intakeTotal, personalityTotal, answers, citySearch, setCitySearch, onSelect, onTextChange, onNext, onPrev, canGoNext, canGoPrev }: any) {
  const isIntake = step.phase === 'intake';
  const idxWithinPhase = isIntake
    ? (stepIndex + 1)
    : (stepIndex + 1);

  const options: any[] = step.options || [];
  const filteredOptions = step.searchable
    ? options.filter((o) => !citySearch.trim() || o.label.toLowerCase().includes(citySearch.toLowerCase()) || (o.desc || '').toLowerCase().includes(citySearch.toLowerCase()))
    : options;

  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">
        {isIntake ? 'Setting the Scene' : 'Getting to Know Her'}
      </span>
      <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">{step.title}</h2>
      {step.subtitle && <p className="text-sm text-[#6E675F] font-sans mt-1.5 font-light">{step.subtitle}</p>}

      <div className="mt-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F] font-bold">
            Question {stepIndex + 1} of {intakeTotal + personalityTotal}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F]">
            {Math.max(0, (intakeTotal + personalityTotal) - (stepIndex + 1))} left
          </span>
        </div>
        <div className="h-1.5 w-full bg-[#38332E] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D5C29F] rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / (intakeTotal + personalityTotal)) * 100}%` }}
          />
        </div>
      </div>

      {step.searchable && (
        <input
          type="text"
          placeholder={step.searchPlaceholder || 'Search…'}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 mb-4 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
      )}

      {step.type === 'text' ? (
        <input
          type="text"
          placeholder={step.placeholder || ''}
          value={answers[step.id] || ''}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3.5 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
      ) : (
        <div className={`grid gap-3 max-h-[45vh] overflow-y-auto pr-1 ${step.cols >= 3 ? 'grid-cols-2 sm:grid-cols-3' : step.cols >= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
          {filteredOptions.map((opt) => {
            const isSelected = step.multiSelect
              ? Array.isArray(answers[step.id]) && answers[step.id].includes(opt.key)
              : answers[step.id] === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onSelect(opt.key)}
                className={`text-left p-4 rounded border transition-all cursor-pointer ${
                  isSelected ? 'border-[#D5C29F] bg-[#D5C29F]/10' : 'border-[#E8E2D9] bg-white hover:border-[#D5C29F]/50'
                }`}
              >
                {opt.emoji && <div className="text-2xl mb-1">{opt.emoji}</div>}
                <div className="text-sm font-semibold text-[#1A1816] font-sans">{opt.label}</div>
                {opt.desc && <div className="text-xs text-[#6E675F] mt-0.5 font-sans">{opt.desc}</div>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#E8E2D9]">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-1.5 text-sm font-sans ${canGoPrev ? 'text-[#6E675F] hover:text-[#1A1816]' : 'text-[#38332E] cursor-default'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-1.5 px-6 py-3 bg-[#D5C29F] hover:bg-[#E5D2AF] disabled:opacity-40 disabled:cursor-default text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all"
        >
          {stepIndex === (intakeTotal + personalityTotal) - 1 ? 'See Her Plan' : 'Next'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="py-20 text-center">
      <Loader2 className="w-12 h-12 text-[#D5C29F] animate-spin mx-auto mb-6" />
      <h2 className="text-xl font-serif italic text-[#1A1816]">Scoring her personality...</h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">Matching your budget, the occasion, and her profile to a real plan.</p>
    </div>
  );
}

function OutputScreen({ itinerary, onReroll, onSwitchDate, plan, isVip }: { itinerary: Itinerary; onReroll: (i: number) => void; onSwitchDate: () => void; plan?: string | null; isVip?: boolean }) {
  // Texting the plan is an Operator/Command perk. Starter and free stay read-only.
  // Cancelled accounts have plan cleared by the webhook, so they lose this too.
  const canText = !!isVip || plan === 'operator' || plan === 'command';
  const [copied, setCopied] = useState(false);

  const planText = useMemo(() => {
    const lines = itinerary.stops.map((s, i) => {
      const r = venueReservation(s.venue);
      const link = r.type === 'link' ? `\n${r.url}` : '';
      return `${i + 1}. ${s.venue.name}\n${s.venue.address}${link}`;
    });
    return `Tonight's plan:\n\n${lines.join('\n\n')}`;
  }, [itinerary]);

  // sms: links only do something on a phone. On desktop the same button copies
  // the plan instead, so it is never a dead control.
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const smsHref = `sms:?&body=${encodeURIComponent(planText)}`;

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(planText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between pb-6 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#8FB89E] bg-[#8FB89E]/10 px-2.5 py-1 rounded-full font-sans">Plan Ready</span>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">Her Date Blueprint</h2>
        </div>
        <button onClick={onSwitchDate} className="text-xs font-semibold text-[#A89B88] hover:text-white bg-[#262320] hover:bg-[#38332E] px-3.5 py-2.5 rounded-full transition font-sans shrink-0">
          Switch Date
        </button>
      </div>

      <div className="space-y-4 my-6">
        {itinerary.stops.map((stop, i) => {
          const res = venueReservation(stop.venue);
          return (
            <div key={i} className="p-4 rounded border border-[#E8E2D9] bg-white">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#8C8377] uppercase tracking-wider font-sans">{stop.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#D5C29F] bg-[#D5C29F]/10 px-2 py-0.5 rounded font-sans">{stop.venue.budget}</span>
                  <button onClick={() => onReroll(i)} title="Swap this stop" className="p-1.5 text-[#6E675F] hover:text-[#D5C29F] transition">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-[#1A1816] mt-1.5 font-serif italic">{stop.venue.name}</h3>
              <p className="text-sm text-[#6E675F] mt-0.5 font-sans font-light">{stop.venue.vibe}</p>
              <div className="mt-3 space-y-1.5 text-xs text-[#8C8377] font-sans">
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {stop.venue.address}</div>
                {stop.venue.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {stop.venue.phone}</div>}
                <div>
                  {res.type === 'link' ? (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-[#D5C29F] font-medium hover:underline">{res.label} →</a>
                  ) : (
                    <span className="text-[#6E675F]">{res.label}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {canText && (
        <div className="mt-6 pt-6 border-t border-[#E8E2D9]">
          {isMobile ? (
            <a
              href={smsHref}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all shadow-lg shadow-[#D5C29F]/10"
            >
              <MessageSquare className="w-4 h-4" />
              Text Her This Plan
            </a>
          ) : (
            <button
              onClick={copyPlan}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-sm uppercase tracking-[0.25em] font-sans rounded-sm transition-all shadow-lg shadow-[#D5C29F]/10"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Plan to Text Her'}
            </button>
          )}
          <p className="text-[11px] text-[#6E675F] font-sans mt-3 text-center">
            {isMobile
              ? 'Opens your messages app with the itinerary ready to send.'
              : 'Copies the itinerary so you can paste it into a text.'}
          </p>
        </div>
      )}
    </div>
  );
}

function PricingScreen({ onClose, email }: { onClose: () => void; email?: string | null }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');

  const plans = [
    { key: 'starter', name: 'Starter', price: '$11.87/mo', priceId: PRICE_IDS.starter, blurb: '1 saved profile' },
    { key: 'operator', name: 'Operator', price: '$32.50/mo', priceId: PRICE_IDS.operator, blurb: 'Up to 3 profiles' },
    { key: 'command', name: 'Command', price: '$197/mo', priceId: PRICE_IDS.command, blurb: 'Unlimited profiles' },
  ];

  async function startCheckout(priceId: string, key: string) {
    setError('');
    setLoadingPlan(key);
    try {
      // Send the Supabase user ID so the webhook can unlock the right account
      // even if they pay with a different email than they signed up with.
      let userId: string | undefined;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id;
      } catch {
        userId = undefined;
      }
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, email: email || undefined, userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error || "Couldn't start checkout. Try again in a moment.");
        setLoadingPlan(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Couldn't reach checkout. Check your connection and try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="text-center py-4">
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">Choose Your Plan</span>
      <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">You've Used Your Free Plan</h2>
      <p className="text-sm text-[#6E675F] font-sans mt-2 font-light max-w-sm mx-auto">Upgrade to keep planning unforgettable dates. Every plan includes our full profiling engine and real venue data.</p>

      {error && <p className="text-xs text-red-400 mt-4 font-sans">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {plans.map((plan) => (
          <div key={plan.key} className="p-5 rounded border border-[#E8E2D9] bg-white text-left flex flex-col">
            <span className="text-sm font-bold text-[#1A1816] font-sans">{plan.name}</span>
            <span className="text-xl font-serif italic text-[#D5C29F] mt-1">{plan.price}</span>
            <span className="text-xs text-[#8C8377] font-sans mt-1 flex-1">{plan.blurb}</span>
            <button
              onClick={() => startCheckout(plan.priceId, plan.key)}
              disabled={loadingPlan !== null}
              className="mt-4 py-2.5 bg-[#D5C29F] hover:bg-[#E5D2AF] disabled:opacity-50 text-[#1A1816] font-bold text-[10px] uppercase tracking-[0.15em] font-sans rounded-sm transition-all"
            >
              {loadingPlan === plan.key ? 'Loading...' : 'Select'}
            </button>
          </div>
        ))}
      </div>

      <button onClick={onClose} className="mt-6 text-xs text-[#6E675F] hover:text-[#1A1816] font-sans">
        Maybe later
      </button>
    </div>
  );
}
