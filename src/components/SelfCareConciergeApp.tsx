import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, MapPin, Phone, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { venueReservation, Itinerary, rerollStop } from '../lib/itinerary';
import { METRO_OPTIONS, BUDGET_OPTIONS, VIBE_OPTIONS, OCCASION_OPTIONS, buildSelfCarePlan } from '../data/selfCare';
import { startSelfCarePlanCheckout } from '../lib/checkout';

interface SelfCareConciergeAppProps {
  isOpen: boolean;
  onClose: () => void;
}

type Screen = 'register' | 'checkEmail' | 'quiz' | 'loading' | 'output' | 'paywall';

const FREE_PLAN_LIMIT = 3;
const CORAL = '#E08B6F';

const COUNT_KEY = 'swoon_selfcare_plans_used';
function getLocalCount(): number {
  try { return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0; } catch { return 0; }
}
function setLocalCount(n: number) {
  try { localStorage.setItem(COUNT_KEY, String(n)); } catch { /* ignore */ }
}

const PENDING_KEY = 'swoon_selfcare_pending_plan';
function savePendingAnswers(answers: Record<string, string>) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(answers)); } catch { /* ignore */ }
}
function loadPendingAnswers(): Record<string, string> | null {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); } catch { return null; }
}
function clearPendingAnswers() {
  try { localStorage.removeItem(PENDING_KEY); } catch { /* ignore */ }
}

export const SelfCareConciergeApp: React.FC<SelfCareConciergeAppProps> = ({ isOpen, onClose }) => {
  const [screen, setScreen] = useState<Screen>('register');
  const [checking, setChecking] = useState(true);
  const [plansUsed, setPlansUsed] = useState(0);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regError, setRegError] = useState('');
  const [regBusy, setRegBusy] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [locationSearch, setLocationSearch] = useState('');

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);

  const QUESTIONS = [
    { id: 'location', title: 'Where are you treating yourself?', options: METRO_OPTIONS, searchable: true },
    { id: 'budget', title: "What's the budget?", options: BUDGET_OPTIONS, searchable: false },
    { id: 'vibe', title: 'What kind of day are you after?', options: VIBE_OPTIONS, searchable: false },
    { id: 'occasion', title: "What's the occasion?", options: OCCASION_OPTIONS, searchable: false },
  ];

  useEffect(() => {
    if (!isOpen) return;
    setChecking(true);
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const pendingAnswers = loadPendingAnswers();

      if (session) {
        const { data: userData } = await supabase.auth.getUser();
        const meta = userData?.user?.user_metadata || {};
        const usedCount = typeof meta.self_care_plans_used === 'number' ? meta.self_care_plans_used : getLocalCount();
        setPlansUsed(usedCount);

        if (pendingAnswers) {
          setAnswers(pendingAnswers);
          clearPendingAnswers();
          if (usedCount >= FREE_PLAN_LIMIT) {
            setScreen('paywall');
          } else {
            runQuizFinish(pendingAnswers, usedCount);
          }
        } else if (usedCount >= FREE_PLAN_LIMIT) {
          setScreen('paywall');
        } else {
          setScreen('quiz');
        }
      } else {
        setScreen('register');
      }
      setChecking(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  async function submitRegistration() {
    if (!regEmail || !regEmail.includes('@')) { setRegError('Enter a valid email address.'); return; }
    setRegError('');
    setRegBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: regEmail,
      options: {
        data: { name: regName, self_care_plans_used: 0 },
        emailRedirectTo: window.location.origin + '/?selfcare=1',
      },
    });
    setRegBusy(false);
    if (error) { setRegError(error.message || 'Could not send the link. Try again.'); return; }
    setScreen('checkEmail');
  }

  function selectAnswer(questionId: string, key: string) {
    const next = { ...answers, [questionId]: key };
    setAnswers(next);
    setTimeout(() => {
      if (stepIndex < QUESTIONS.length - 1) {
        setStepIndex(stepIndex + 1);
      } else {
        runQuizFinish(next, plansUsed);
      }
    }, 220);
  }

  function runQuizFinish(finalAnswers: Record<string, string>, currentUsed: number) {
    setScreen('loading');
    const metroKey = finalAnswers.location || 'washington-dc';
    const budget = finalAnswers.budget || '$$';
    const vibe = finalAnswers.vibe || 'relaxing';
    setTimeout(async () => {
      const plan = buildSelfCarePlan(metroKey, budget, vibe);
      setItinerary(plan);
      const nextCount = currentUsed + 1;
      setPlansUsed(nextCount);
      setLocalCount(nextCount);
      try {
        await supabase.auth.updateUser({ data: { self_care_plans_used: nextCount } });
      } catch {
        // Non-fatal: local count still enforces the limit this session.
      }
      setScreen('output');
    }, 1400);
  }

  function handleReroll(stopIndex: number) {
    if (!itinerary) return;
    const metroKey = answers.location || 'washington-dc';
    const budget = answers.budget || '$$';
    setItinerary(rerollStop(itinerary, stopIndex, metroKey, budget));
  }

  function startAnotherPlan() {
    if (plansUsed >= FREE_PLAN_LIMIT) {
      setScreen('paywall');
      return;
    }
    setAnswers({});
    setStepIndex(0);
    setItinerary(null);
    setScreen('quiz');
  }

  async function handleUnlock() {
    setUnlockError(null);
    setUnlockLoading(true);
    const result = await startSelfCarePlanCheckout();
    if (!result.ok) {
      setUnlockError(result.error || "Couldn't start checkout. Try again in a moment.");
      setUnlockLoading(false);
    }
  }

  const question = QUESTIONS[stepIndex];
  const filteredOptions = question.searchable
    ? question.options.filter((o) => !locationSearch.trim() || o.label.toLowerCase().includes(locationSearch.toLowerCase()))
    : question.options;

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
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: CORAL }} />
              <p className="text-sm text-[#6E675F] font-sans">Checking your account...</p>
            </div>
          ) : screen === 'register' ? (
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold" style={{ color: CORAL }}>
                Self Care Dates &middot; First 3 Free
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif italic font-light text-[#1A1816] mt-2">Let's Get You Set Up</h2>
              <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">
                No password needed. We'll email you a link, then your first 3 self-care plans are on us.
              </p>
              <div className="mt-6 space-y-3">
                <input
                  type="text" placeholder="Full Name (optional)" value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none transition"
                />
                <input
                  type="email" placeholder="Email Address" value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && regEmail.includes('@')) submitRegistration(); }}
                  className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none transition"
                />
              </div>
              {regError && <p className="text-xs text-red-500 mt-2 font-sans">{regError}</p>}
              <button
                onClick={submitRegistration}
                disabled={regBusy}
                className="w-full mt-6 py-3.5 text-white font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all disabled:opacity-60"
                style={{ backgroundColor: CORAL }}
              >
                {regBusy ? 'Sending...' : 'Email Me a Link'}
              </button>
            </div>
          ) : screen === 'checkEmail' ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: CORAL }} />
              <h3 className="text-2xl font-serif italic text-[#1A1816]">Check Your Email</h3>
              <p className="text-sm text-[#6E675F] font-sans mt-2 max-w-sm mx-auto font-light">
                We sent a sign-in link to {regEmail}. Click it to continue, no password needed.
              </p>
              <button onClick={() => setScreen('register')} className="mt-6 text-xs text-[#6E675F] hover:text-[#1A1816] font-sans">
                Didn't get it? Try again
              </button>
            </div>
          ) : screen === 'quiz' ? (
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold" style={{ color: CORAL }}>
                Self Care Dates
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">{question.title}</h2>

              <div className="mt-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F] font-bold">
                    Question {stepIndex + 1} of {QUESTIONS.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#6E675F]">
                    {FREE_PLAN_LIMIT - plansUsed} free plan{FREE_PLAN_LIMIT - plansUsed === 1 ? '' : 's'} left
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E8E2D9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${((stepIndex + 1) / QUESTIONS.length) * 100}%`, backgroundColor: CORAL }}
                  />
                </div>
              </div>

              {question.searchable && (
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="w-full bg-white border border-[#E8E2D9] rounded px-4 py-3 mb-4 text-sm text-[#1A1816] placeholder:text-[#6E675F] focus:outline-none transition"
                />
              )}

              <div className="grid gap-3 max-h-[45vh] overflow-y-auto pr-1 grid-cols-1 sm:grid-cols-2">
                {filteredOptions.map((opt) => {
                  const isSelected = answers[question.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => selectAnswer(question.id, opt.key)}
                      className="text-left p-4 rounded border transition-all cursor-pointer bg-white"
                      style={isSelected ? { borderColor: CORAL, backgroundColor: `${CORAL}1A` } : { borderColor: '#E8E2D9' }}
                    >
                      {opt.emoji && <div className="text-2xl mb-1">{opt.emoji}</div>}
                      <div className="text-sm font-semibold text-[#1A1816] font-sans">{opt.label}</div>
                      {opt.desc && <div className="text-xs text-[#6E675F] mt-0.5 font-sans">{opt.desc}</div>}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#E8E2D9]">
                <button
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  className={`flex items-center gap-1.5 text-sm font-sans ${stepIndex > 0 ? 'text-[#6E675F] hover:text-[#1A1816]' : 'text-[#C9C2B8] cursor-default'}`}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          ) : screen === 'loading' ? (
            <div className="py-20 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6" style={{ color: CORAL }} />
              <h2 className="text-xl font-serif italic text-[#1A1816]">Scoring your preferences...</h2>
              <p className="text-sm text-[#6E675F] font-sans mt-2 font-light">Matching your vibe, your budget, and the occasion to a real plan.</p>
            </div>
          ) : screen === 'output' && itinerary ? (
            <div>
              <div className="flex items-start justify-between pb-6 border-b border-[#E8E2D9] gap-4">
                <div>
                  <span
                    className="text-xs font-semibold tracking-widest px-2.5 py-1 rounded-full font-sans"
                    style={{ color: CORAL, backgroundColor: `${CORAL}1A` }}
                  >
                    Plan Ready
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">{itinerary.typeName}</h2>
                  <p className="text-sm text-[#6E675F] font-sans mt-1 font-light">{itinerary.typeBlurb}</p>
                </div>
              </div>

              <div className="space-y-4 my-6">
                {itinerary.stops.map((stop, i) => {
                  const res = venueReservation(stop.venue);
                  return (
                    <div key={i} className="p-4 rounded border border-[#E8E2D9] bg-white">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold text-[#8C8377] uppercase tracking-wider font-sans">{stop.label}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded font-sans"
                            style={{ color: CORAL, backgroundColor: `${CORAL}1A` }}
                          >
                            {stop.venue.budget}
                          </span>
                          <button onClick={() => handleReroll(i)} title="Swap this stop" className="p-1.5 text-[#6E675F] transition">
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
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: CORAL }}>
                              {res.label} →
                            </a>
                          ) : (
                            <span className="text-[#6E675F]">{res.label}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-[#E8E2D9] space-y-3">
                <p className="text-xs text-[#8C8377] font-sans">{itinerary.coachTips.join(' ')}</p>
                <button
                  onClick={startAnotherPlan}
                  className="w-full py-3.5 text-white font-bold text-xs uppercase tracking-[0.2em] font-sans rounded-sm transition-all"
                  style={{ backgroundColor: CORAL }}
                >
                  Plan Another Day ({Math.max(0, FREE_PLAN_LIMIT - plansUsed)} free left)
                </button>
              </div>
            </div>
          ) : screen === 'paywall' ? (
            <div className="text-center py-4">
              <span className="text-[10px] uppercase tracking-[0.35em] font-sans font-bold" style={{ color: CORAL }}>
                You've Used Your 3 Free Plans
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif italic font-light text-[#1A1816] mt-2">
                Keep the Self Care Coming
              </h2>
              <p className="text-sm text-[#6E675F] font-sans mt-2 font-light max-w-sm mx-auto">
                Unlock unlimited solo planning and effortless 1-click reservations.
              </p>

              <div className="mt-8 p-6 rounded border border-[#E8E2D9] bg-white max-w-xs mx-auto text-left">
                <span className="text-sm font-bold text-[#1A1816] font-sans">Self Care Unlimited</span>
                <div className="mt-1">
                  <span className="text-3xl font-serif italic" style={{ color: CORAL }}>$24.73</span>
                  <span className="text-sm text-[#6E675F] font-sans"> /month</span>
                </div>
                <p className="text-xs text-[#8C8377] font-sans mt-2">Unlimited plans, unlimited reroll, no waiting.</p>
                <button
                  onClick={handleUnlock}
                  disabled={unlockLoading}
                  className="mt-5 w-full py-3 text-white font-bold text-[11px] uppercase tracking-[0.2em] font-sans rounded-sm transition-all disabled:opacity-60"
                  style={{ backgroundColor: CORAL }}
                >
                  {unlockLoading ? 'Loading checkout...' : 'Unlock Unlimited'}
                </button>
                {unlockError && <p className="text-xs text-red-500 mt-3 font-sans">{unlockError}</p>}
              </div>

              <button onClick={onClose} className="mt-6 text-xs text-[#6E675F] hover:text-[#1A1816] font-sans">
                Maybe later
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
