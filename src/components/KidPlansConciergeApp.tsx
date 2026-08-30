import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { AGE_BANDS, KID_QUESTIONS, buildKidPlan, KidPlanResult } from '../data/kidPlans';
import { startKidPlansCheckout } from '../lib/checkout';

interface KidPlansConciergeAppProps {
isOpen: boolean;
onClose: () => void;
}

type Screen = 'age' | 'quiz' | 'loading' | 'result' | 'paywall';

const SUN = '#FFC93C';
const SKY = '#4EC9F5';
const CORAL = '#FF6F91';
const GRASS = '#5FD068';
const INK = '#22223B';

const DEFAULT_FREE_PLAN_LIMIT = 3;
const UNLIMITED_PROMO_CODE = 'EDFAM2026';
const BONUS_PROMO_CODE = 'SP26';
const BONUS_PLAN_LIMIT = 8;
const MONTHLY_PRICE_DISPLAY = '$11.32';

const COUNT_KEY = 'swoon_kidplan_plans_used';
const UNLIMITED_KEY = 'swoon_kidplan_unlimited';
const FREE_LIMIT_KEY = 'swoon_kidplan_free_limit';

function getLocalCount(): number {
try { return parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) || 0; } catch { return 0; }
}
function setLocalCount(n: number) {
try { localStorage.setItem(COUNT_KEY, String(n)); } catch { /* ignore */ }
}
function getLocalUnlimited(): boolean {
try { return localStorage.getItem(UNLIMITED_KEY) === 'true'; } catch { return false; }
}
function setLocalUnlimited(v: boolean) {
try { localStorage.setItem(UNLIMITED_KEY, v ? 'true' : 'false'); } catch { /* ignore */ }
}
function getLocalFreeLimit(): number {
try { return parseInt(localStorage.getItem(FREE_LIMIT_KEY) || '', 10) || DEFAULT_FREE_PLAN_LIMIT; } catch { return DEFAULT_FREE_PLAN_LIMIT; }
}
function setLocalFreeLimit(n: number) {
try { localStorage.setItem(FREE_LIMIT_KEY, String(n)); } catch { /* ignore */ }
}

export const KidPlansConciergeApp: React.FC<KidPlansConciergeAppProps> = ({ isOpen, onClose }) => {
const [screen, setScreen] = useState<Screen>('age');
const [plansUsed, setPlansUsed] = useState(0);
const [freeLimit, setFreeLimit] = useState(DEFAULT_FREE_PLAN_LIMIT);
const [unlimitedAccess, setUnlimitedAccess] = useState(false);

const [ageKey, setAgeKey] = useState<string>('');
const [answers, setAnswers] = useState<Record<string, string>>({});
const [stepIndex, setStepIndex] = useState(0);
const [result, setResult] = useState<KidPlanResult | null>(null);

const [promoCode, setPromoCode] = useState('');
const [promoError, setPromoError] = useState('');
const [unlockError, setUnlockError] = useState<string | null>(null);
const [unlockLoading, setUnlockLoading] = useState(false);

useEffect(() => {
if (!isOpen) return;
const usedCount = getLocalCount();
const isUnlimited = getLocalUnlimited();
setPlansUsed(usedCount);
setUnlimitedAccess(isUnlimited);
setFreeLimit(getLocalFreeLimit());
if (!isUnlimited && usedCount >= freeLimit) {
setScreen('paywall');
} else {
setScreen('age');
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen]);

if (!isOpen) return null;

function reset() {
if (!unlimitedAccess && plansUsed >= freeLimit) {
setScreen('paywall');
return;
}
setScreen('age');
setAgeKey('');
setAnswers({});
setStepIndex(0);
setResult(null);
}

function handleClose() {
onClose();
}

function pickAge(key: string) {
setAgeKey(key);
setStepIndex(0);
setScreen('quiz');
}

function selectAnswer(questionId: string, key: string) {
const next = { ...answers, [questionId]: key };
setAnswers(next);
setTimeout(() => {
if (stepIndex < KID_QUESTIONS.length - 1) {
setStepIndex(stepIndex + 1);
} else {
finishQuiz(next);
}
}, 180);
}

function finishQuiz(finalAnswers: Record<string, string>) {
setScreen('loading');
setTimeout(() => {
const plan = buildKidPlan(ageKey, finalAnswers);
setResult(plan);
const nextCount = plansUsed + 1;
setPlansUsed(nextCount);
setLocalCount(nextCount);
setScreen('result');
}, 1200);
}

function goBack() {
if (screen === 'quiz' && stepIndex > 0) {
setStepIndex(stepIndex - 1);
} else if (screen === 'quiz' && stepIndex === 0) {
setScreen('age');
}
}

function applyPromoCode() {
const code = promoCode.trim().toUpperCase();
if (code === UNLIMITED_PROMO_CODE) {
setLocalUnlimited(true);
setUnlimitedAccess(true);
setPromoError('');
setScreen('age');
} else if (code === BONUS_PROMO_CODE) {
const nextLimit = Math.max(freeLimit, BONUS_PLAN_LIMIT);
setLocalFreeLimit(nextLimit);
setFreeLimit(nextLimit);
setPromoError('');
setScreen('age');
} else {
setPromoError('That code isn\'t valid.');
}
}

async function handleUnlock() {
setUnlockError(null);
setUnlockLoading(true);
const result = await startKidPlansCheckout('monthly');
if (!result.ok) {
setUnlockError(result.error || "Couldn't start checkout. Try again in a moment.");
setUnlockLoading(false);
}
}

const question = KID_QUESTIONS[stepIndex];
const quizProgress = question ? ((stepIndex + 1) / KID_QUESTIONS.length) * 100 : 0;

return (
<div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
<div
className="absolute inset-0"
style={{ background: 'linear-gradient(135deg, rgba(78,201,245,0.55), rgba(255,111,145,0.55))' }}
onClick={handleClose}
/>
<div
className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[28px] shadow-2xl"
style={{ background: '#FFFDF7', border: `4px solid ${SUN}` }}
>
<button
onClick={handleClose}
className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
style={{ background: INK, color: '#fff' }}
aria-label="Close"
>
<X size={18} />
</button>

<div className="px-6 pt-6 pb-2 flex items-center gap-2">
{screen === 'quiz' && (
<button
onClick={goBack}
className="w-8 h-8 rounded-full flex items-center justify-center mr-1"
style={{ background: '#F1EFE6' }}
aria-label="Back"
>
<ArrowLeft size={16} color={INK} />
</button>
)}
<span
className="text-[11px] uppercase tracking-[0.3em] font-sans font-black px-3 py-1 rounded-full"
style={{ background: SUN, color: INK }}
>
Kid Plan &middot; Ages 0–18
</span>
</div>

<div className="px-6 pb-8">
{screen === 'age' ? (
<div>
<h2 className="text-3xl font-sans font-black mt-2 mb-1" style={{ color: INK }}>
Let's crack the code. 🧠
</h2>
<p className="text-sm font-sans mb-2" style={{ color: '#5C5A73' }}>
12 quick questions about their personality — not just their age — so the plan actually
sounds like <em>you get them</em>.
</p>
<p className="text-xs font-sans font-black" style={{ color: unlimitedAccess ? GRASS : '#5C5A73' }}>
{unlimitedAccess ? 'Unlimited plans' : `${Math.max(0, freeLimit - plansUsed)} free plan${freeLimit - plansUsed === 1 ? '' : 's'} left`}
</p>
<p className="text-xs font-sans font-bold uppercase tracking-widest mb-3 mt-4" style={{ color: '#5C5A73' }}>
First, how old are they?
</p>
<div className="grid grid-cols-1 gap-3">
{AGE_BANDS.map((band) => (
<button
key={band.key}
onClick={() => pickAge(band.key)}
className="flex items-center gap-3 text-left rounded-2xl px-4 py-3 transition-transform hover:scale-[1.02]"
style={{ background: '#F1EFE6', border: `2px solid transparent` }}
onMouseEnter={(e) => (e.currentTarget.style.borderColor = SKY)}
onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
>
<span className="text-2xl">{band.emoji}</span>
<span>
<span className="block font-sans font-bold" style={{ color: INK }}>
{band.label}
</span>
<span className="block text-xs font-sans" style={{ color: '#5C5A73' }}>
{band.range} years old
</span>
</span>
</button>
))}
</div>
</div>
) : screen === 'quiz' && question ? (
<div>
<div className="w-full h-2 rounded-full mb-6" style={{ background: '#F1EFE6' }}>
<div
className="h-2 rounded-full transition-all"
style={{ width: `${quizProgress}%`, background: GRASS }}
/>
</div>
<p className="text-xs font-sans font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5A73' }}>
Question {stepIndex + 1} of {KID_QUESTIONS.length}
</p>
<h2 className="text-2xl font-sans font-black mb-1" style={{ color: INK }}>
{question.title}
</h2>
{question.subtitle && (
<p className="text-sm font-sans mb-4" style={{ color: '#5C5A73' }}>
{question.subtitle}
</p>
)}
<div className="grid grid-cols-1 gap-3 mt-4">
{question.options.map((opt) => {
const isSelected = answers[question.id] === opt.key;
return (
<button
key={opt.key}
onClick={() => selectAnswer(question.id, opt.key)}
className="flex items-center gap-3 text-left rounded-2xl px-4 py-3 transition-transform hover:scale-[1.02]"
style={{
background: isSelected ? SKY : '#F1EFE6',
border: '2px solid transparent',
}}
>
{opt.emoji && <span className="text-xl">{opt.emoji}</span>}
<span>
<span className="block font-sans font-bold text-sm" style={{ color: INK }}>
{opt.label}
</span>
{opt.desc && (
<span className="block text-xs font-sans" style={{ color: '#5C5A73' }}>
{opt.desc}
</span>
)}
</span>
</button>
);
})}
</div>
</div>
) : screen === 'loading' ? (
<div className="py-16 flex flex-col items-center justify-center text-center">
<Sparkles className="animate-pulse mb-4" size={36} color={CORAL} />
<p className="font-sans font-black text-lg" style={{ color: INK }}>
Matching their personality to a plan...
</p>
</div>
) : screen === 'result' && result ? (
<div>
<div className="text-center mb-6">
<div className="text-5xl mb-2">{result.typeEmoji}</div>
<p
className="text-[11px] uppercase tracking-[0.3em] font-sans font-black mb-1"
style={{ color: '#5C5A73' }}
>
{result.ageLabel}
</p>
<h2 className="text-3xl font-sans font-black" style={{ color: INK }}>
{result.typeName}
</h2>
<p className="text-sm font-sans mt-2" style={{ color: '#5C5A73' }}>
{result.typeBlurb}
</p>
</div>

<div
className="rounded-2xl px-4 py-3 mb-5 text-sm font-sans italic"
style={{ background: '#F1EFE6', color: INK }}
>
"{result.flexLine}"
</div>

<p className="text-xs font-sans font-bold uppercase tracking-widest mb-3" style={{ color: '#5C5A73' }}>
Three ways to look like a mind reader
</p>
<div className="grid grid-cols-1 gap-3 mb-6">
{result.recommendations.map((rec, i) => (
<div key={i} className="rounded-2xl px-4 py-3" style={{ background: '#F1EFE6' }}>
<p className="font-sans font-bold text-sm mb-1" style={{ color: INK }}>
{rec.title}
</p>
<p className="text-xs font-sans" style={{ color: '#5C5A73' }}>
{rec.blurb}
</p>
</div>
))}
</div>

<div
className="rounded-2xl px-4 py-3 mb-6 text-xs font-sans"
style={{ background: SUN, color: INK }}
>
💡 {result.funFact}
</div>

<p className="text-xs font-sans font-black text-center mb-4" style={{ color: unlimitedAccess ? GRASS : '#5C5A73' }}>
{unlimitedAccess ? 'Unlimited plans' : `${Math.max(0, freeLimit - plansUsed)} free plan${freeLimit - plansUsed === 1 ? '' : 's'} left`}
</p>

<div className="flex gap-3">
<button
onClick={reset}
className="flex-1 rounded-full py-3 font-sans font-black text-sm"
style={{ background: '#F1EFE6', color: INK }}
>
Start Over
</button>
<button
onClick={handleClose}
className="flex-1 rounded-full py-3 font-sans font-black text-sm"
style={{ background: GRASS, color: '#fff' }}
>
Done
</button>
</div>
</div>
) : screen === 'paywall' ? (
<div className="text-center py-4">
<h2 className="text-2xl font-sans font-black mt-2" style={{ color: INK }}>
You've used your 3 free plans
</h2>
<p className="text-sm font-sans mt-2 max-w-sm mx-auto" style={{ color: '#5C5A73' }}>
Unlock unlimited Kid Plans so you never run out of weekend ideas.
</p>

<div className="mt-8 p-6 rounded-2xl mx-auto max-w-xs text-left" style={{ background: '#F1EFE6' }}>
<span className="text-sm font-sans font-black" style={{ color: INK }}>Kid Plan Unlimited</span>
<div className="mt-1">
<span className="text-3xl font-sans font-black" style={{ color: CORAL }}>{MONTHLY_PRICE_DISPLAY}</span>
<span className="text-sm font-sans" style={{ color: '#5C5A73' }}> /month</span>
</div>
<p className="text-xs font-sans mt-2" style={{ color: '#5C5A73' }}>Unlimited plans for every kid, no waiting.</p>
<button
onClick={handleUnlock}
disabled={unlockLoading}
className="mt-5 w-full rounded-full py-3 font-sans font-black text-sm disabled:opacity-60"
style={{ background: GRASS, color: '#fff' }}
>
{unlockLoading ? 'Loading checkout...' : 'Unlock Unlimited'}
</button>
{unlockError && <p className="text-xs mt-3 font-sans" style={{ color: CORAL }}>{unlockError}</p>}
</div>

<div className="mt-6 max-w-xs mx-auto text-left">
<p className="text-xs font-sans font-bold uppercase tracking-widest mb-2" style={{ color: '#5C5A73' }}>
Have a promo code?
</p>
<div className="flex gap-2">
<input
type="text"
placeholder="Enter code"
value={promoCode}
onChange={(e) => setPromoCode(e.target.value)}
onKeyDown={(e) => { if (e.key === 'Enter') applyPromoCode(); }}
className="flex-1 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none"
style={{ background: '#F1EFE6', color: INK }}
/>
<button
onClick={applyPromoCode}
className="rounded-xl px-4 py-2 text-sm font-sans font-black"
style={{ background: SUN, color: INK }}
>
Apply
</button>
</div>
{promoError && <p className="text-xs mt-2 font-sans" style={{ color: CORAL }}>{promoError}</p>}
</div>

<button onClick={handleClose} className="mt-6 text-xs font-sans" style={{ color: '#5C5A73' }}>
Maybe later
</button>
</div>
) : null}
</div>
</div>
</div>
);
};
