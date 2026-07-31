import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, ArrowRight, MapPin, Phone, Loader2, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase, refreshMe, MeStatus, hasFamPass, stripFamPass, maxProfilesForPlan, loadProfiles, saveProfiles, SavedProfile } from '../lib/supabase';
import { introSteps, personalityQuestions, holidayStep, dateMoodStep, QuizStep, TYPE_PROFILES } from '../data/personality';
import { generateItinerary, rerollStop, venueReservation, Itinerary } from '../lib/itinerary';

interface DateConciergeAppProps {
  isOpen: boolean;
  onClose: () => void;
}

type Screen = 'register' | 'signin' | 'checkEmail' | 'welcome' | 'quiz' | 'loading' | 'output' | 'pricing';

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
      if (session) {
        setHasSession(true);
        const { meStatus: ms, isVipFamily: vip } = await refreshMe();
        setMeStatus(ms);
        setIsVipFamily(vip);
        route(ms, vip, true);
      } else {
        setScreen('register');
      }
      setChecking(false);
    })();
  }, [isOpen]);

  function route(ms: MeStatus | null, vip: boolean, signedIn: boolean) {
    if (!signedIn) { setScreen('register'); return; }
    if (vip) { setScreen('welcome'); return; }
    if (!ms) { setScreen('welcome'); return; }
    if (ms.subscription_status === 'active' || !ms.trial_used) { setScreen('welcome'); }
    else { setScreen('pricing'); }
  }

  if (!isOpen) return null;

  async function submitRegistration() {
    if (!regEmail || !regEmail.includes('@')) { setRegError('Enter a valid email address.'); return; }
    setRegError(''); setRegBusy(true);
    const vip = hasFamPass(regName);
    const cleanName = vip ? stripFamPass(regName) : regName;
    const { error } = await supabase.auth.signInWithOtp({
      email: regEmail,
      options: { data: { name: cleanName, is_vip_family: vip }, emailRedirectTo: window.location.origin + '/' },
    });
    setRegBusy(false);
    if (error) { setRegError(error.message || 'Could not send the link. Try again.'); return; }
    setCheckEmailText(`We sent a sign-in link to ${regEmail}. Click it to continue, no password needed.`);
    setScreen('checkEmail');
  }

  async function submitSignIn() {
    if (!signinEmail || !signinEmail.includes('@')) { setSigninError('Enter a valid email address.'); return; }
    setSigninError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: signinEmail,
      options: { shouldCreateUser: false, emailRedirectTo: window.location.origin + '/' },
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
      setScreen('output');
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
    <div className="fixed inset-0 z-50 bg-[#1A1816]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#1A1816] border border-[#38332E] rounded shadow-2xl text-[#FAF8F5] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#A89B88] hover:text-[#FAF8F5] transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-10">
          {checking ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-[#D5C29F] animate-spin" />
              <p className="text-sm text-[#A89B88] font-sans">Checking your account...</p>
            </div>
          ) : screen === 'register' ? (
            <RegisterScreen
              name={regName} setName={setRegName}
              email={regEmail} setEmail={setRegEmail}
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
          ) : screen === 'output' && itinerary ? (
            <OutputScreen
              itinerary={itinerary}
              onReroll={handleReroll}
              onSwitchDate={() => { setDateName(''); setScreen('welcome'); }}
            />
          ) : screen === 'pricing' ? (
            <PricingScreen onClose={onClose} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* ---------- Sub-screens ---------- */

function RegisterScreen({ name, setName, email, setEmail, error, busy, onSubmit, onSwitchToSignIn }: any) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">SWOON PLANS · FIRST PLAN FREE</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-white mt-2">Let's Get You Set Up</h2>
      <p className="text-sm text-[#A89B88] font-sans mt-2 font-light">No password needed. We'll email you a link, then your first plan is free.</p>
      <div className="mt-6 space-y-3">
        <input
          type="text" placeholder="Full Name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#262320] border border-[#38332E] rounded px-4 py-3 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
        <input
          type="email" placeholder="Email Address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#262320] border border-[#38332E] rounded px-4 py-3 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
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
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-white mt-2">Sign In</h2>
      <p className="text-sm text-[#A89B88] font-sans mt-2 font-light">Enter your email and we'll send you a secure sign-in link.</p>
      <div className="mt-6">
        <input
          type="email" placeholder="Email Address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#262320] border border-[#38332E] rounded px-4 py-3 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
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
      <h3 className="text-2xl font-serif italic text-white">Check Your Email</h3>
      <p className="text-sm text-[#A89B88] font-sans mt-2 max-w-sm mx-auto font-light">{text}</p>
      <button onClick={onBack} className="mt-6 text-xs text-[#6E675F] hover:text-white font-sans">Didn't get it? Try again</button>
    </div>
  );
}

function WelcomeScreen({ dateName, setDateName, onStart, maxProfiles }: any) {
  const profiles = loadProfiles();
  const names = Object.keys(profiles);
  return (
    <div>
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">WELCOME</span>
      <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-white mt-2">Who Are We Planning For?</h2>
      <p className="text-sm text-[#A89B88] font-sans mt-2 font-light">Answer 15 quick questions about her and get a custom date plan in under a minute.</p>

      {names.length > 0 && (
        <div className="mt-6 space-y-2">
          {names.map((n) => (
            <div key={n} className="flex items-center justify-between p-4 rounded border border-[#38332E] bg-[#262320]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{n}</span>
                <span className="text-[10px] font-bold text-[#1A1816] bg-[#D5C29F] px-1.5 py-0.5 rounded tracking-widest">{profiles[n].code}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-[#38332E]">
        <label className="text-sm font-semibold text-white font-sans">Add a New Date</label>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <input
            type="text" placeholder="Her name" value={dateName}
            onChange={(e) => setDateName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onStart(); }}
            className="flex-1 bg-[#262320] border border-[#38332E] rounded px-4 py-3 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
          />
          <button
            onClick={onStart}
            className="px-6 py-3 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all shrink-0"
          >
            Start
          </button>
        </div>
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
      <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-white mt-2">{step.title}</h2>
      {step.subtitle && <p className="text-sm text-[#A89B88] font-sans mt-1.5 font-light">{step.subtitle}</p>}

      <div className="flex items-center gap-1.5 mt-6 mb-6 flex-wrap">
        {Array.from({ length: intakeTotal + personalityTotal }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i < stepIndex ? 'bg-[#D5C29F]' : i === stepIndex ? 'bg-white ring-2 ring-[#D5C29F]' : 'bg-[#38332E]'}`} />
        ))}
      </div>

      {step.searchable && (
        <input
          type="text"
          placeholder={step.searchPlaceholder || 'Search…'}
          value={citySearch}
          onChange={(e) => setCitySearch(e.target.value)}
          className="w-full bg-[#262320] border border-[#38332E] rounded px-4 py-3 mb-4 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
        />
      )}

      {step.type === 'text' ? (
        <input
          type="text"
          placeholder={step.placeholder || ''}
          value={answers[step.id] || ''}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full bg-[#262320] border border-[#38332E] rounded px-4 py-3.5 text-sm text-white placeholder:text-[#6E675F] focus:outline-none focus:border-[#D5C29F] transition"
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
                  isSelected ? 'border-[#D5C29F] bg-[#D5C29F]/10' : 'border-[#38332E] bg-[#262320] hover:border-[#D5C29F]/50'
                }`}
              >
                {opt.emoji && <div className="text-2xl mb-1">{opt.emoji}</div>}
                <div className="text-sm font-semibold text-white font-sans">{opt.label}</div>
                {opt.desc && <div className="text-xs text-[#A89B88] mt-0.5 font-sans">{opt.desc}</div>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#38332E]">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`flex items-center gap-1.5 text-sm font-sans ${canGoPrev ? 'text-[#A89B88] hover:text-white' : 'text-[#38332E] cursor-default'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center gap-1.5 px-6 py-3 bg-[#D5C29F] hover:bg-[#E5D2AF] disabled:opacity-40 disabled:cursor-default text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="py-20 text-center">
      <Loader2 className="w-12 h-12 text-[#D5C29F] animate-spin mx-auto mb-6" />
      <h2 className="text-xl font-serif italic text-white">Scoring her personality...</h2>
      <p className="text-sm text-[#A89B88] font-sans mt-2 font-light">Matching your budget, the occasion, and her profile to a real plan.</p>
    </div>
  );
}

function OutputScreen({ itinerary, onReroll, onSwitchDate }: { itinerary: Itinerary; onReroll: (i: number) => void; onSwitchDate: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between pb-6 border-b border-[#38332E] gap-4">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#8FB89E] bg-[#8FB89E]/10 px-2.5 py-1 rounded-full font-sans">Plan Ready</span>
          <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-white mt-2">Her Date Blueprint</h2>
        </div>
        <button onClick={onSwitchDate} className="text-xs font-semibold text-[#A89B88] hover:text-white bg-[#262320] hover:bg-[#38332E] px-3.5 py-2.5 rounded-full transition font-sans shrink-0">
          Switch Date
        </button>
      </div>

      <div className="my-6 p-5 rounded border border-[#38332E] bg-[#262320]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#1A1816] bg-[#D5C29F] px-2 py-0.5 rounded tracking-widest font-sans">{itinerary.typeCode}</span>
          <span className="text-sm font-semibold text-white font-sans">{itinerary.typeName}</span>
        </div>
        <p className="text-sm text-[#A89B88] mt-1.5 leading-relaxed font-sans font-light">{itinerary.typeBlurb}</p>
      </div>

      <div className="space-y-4 my-6">
        {itinerary.stops.map((stop, i) => {
          const res = venueReservation(stop.venue);
          return (
            <div key={i} className="p-4 rounded border border-[#38332E] bg-[#262320]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#8C8377] uppercase tracking-wider font-sans">{stop.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#D5C29F] bg-[#D5C29F]/10 px-2 py-0.5 rounded font-sans">{stop.venue.budget}</span>
                  <button onClick={() => onReroll(i)} title="Swap this stop" className="p-1.5 text-[#A89B88] hover:text-[#D5C29F] transition">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-1.5 font-serif italic">{stop.venue.name}</h3>
              <p className="text-sm text-[#A89B88] mt-0.5 font-sans font-light">{stop.venue.vibe}</p>
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

      <div className="p-5 rounded bg-[#D5C29F]/5 border border-[#D5C29F]/20 mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#D5C29F] mb-3 font-sans">The Coach's Briefing</h4>
        <ul className="space-y-2 text-sm text-[#E2D5C3] leading-relaxed font-sans font-light">
          {itinerary.coachTips.map((tip, i) => <li key={i}>• {tip}</li>)}
        </ul>
        <p className="text-xs text-[#8C8377] mt-4 pt-3 border-t border-[#D5C29F]/10 font-sans">{itinerary.logistics}</p>
      </div>
    </div>
  );
}

function PricingScreen({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-6">
      <span className="text-[10px] uppercase tracking-[0.35em] font-sans text-[#D5C29F] font-bold">Choose Your Plan</span>
      <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-white mt-2">You've Used Your Free Plan</h2>
      <p className="text-sm text-[#A89B88] font-sans mt-2 font-light max-w-sm mx-auto">Upgrade to keep planning unforgettable dates. Every plan includes our full profiling engine and real venue data.</p>
      <button onClick={onClose} className="mt-6 px-8 py-3 bg-[#D5C29F] hover:bg-[#E5D2AF] text-[#1A1816] font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all">
        View Plans
      </button>
    </div>
  );
}
