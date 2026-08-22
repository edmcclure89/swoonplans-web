import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
if (req.method !== 'POST') {
res.status(405).json({ error: 'Method not allowed' });
return;
}

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
res.status(500).json({ error: 'Stripe is not configured on this deployment yet.' });
return;
}

const { plan, priceId, email, userId, returnPath } = req.body || {};
const supabaseUserId = typeof userId === 'string' && userId ? userId : undefined;
const customerEmail = typeof email === 'string' ? email : undefined;

const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' as Stripe.LatestApiVersion });
const origin = (req.headers.origin as string) || `https://${req.headers.host}`;

// ---------------------------------------------------------------------------
// Founders Pass: a one-time payment that grants 3 months of access upfront.
// This plan is mapped server-side to its own price so the client can never
// choose or spoof the price. It is intentionally mode:'payment' (NOT a
// subscription) and must never silently fall back to another price.
// ---------------------------------------------------------------------------
if (plan === 'founders') {
const foundersPriceId = process.env.PRICE_ID_FOUNDERS;
if (!foundersPriceId) {
console.error(
'[create-checkout-session] PRICE_ID_FOUNDERS is not set. Refusing to start Founders checkout; ' +
'will not fall back to another price.'
);
res.status(500).json({ error: 'The Founders Pass is not available right now. Please try again later.' });
return;
}

try {
// Prefer the grant details stamped on the Stripe product metadata so the
// pass can be re-tuned in the dashboard without a redeploy. Fall back to
// the literal Founders terms (3 months, operator-tier access) otherwise.
let productMeta: Record<string, string> = {};
try {
const price = await stripe.prices.retrieve(foundersPriceId, { expand: ['product'] });
const product = price.product;
if (product && typeof product !== 'string' && !(product as Stripe.DeletedProduct).deleted) {
productMeta = ((product as Stripe.Product).metadata || {}) as Record<string, string>;
}
} catch {
// Non-fatal: the literals below are the source of truth for the pass.
}

const metadata: Record<string, string> = {
plan: productMeta.plan || 'founders',
grants_months: productMeta.grants_months || '3',
access_tier: productMeta.access_tier || 'operator',
};
if (supabaseUserId) metadata.supabase_user_id = supabaseUserId;

const session = await stripe.checkout.sessions.create({
mode: 'payment',
line_items: [{ price: foundersPriceId, quantity: 1 }],
customer_email: customerEmail,
client_reference_id: supabaseUserId,
metadata,
// Mirror onto the PaymentIntent so one-time-payment webhooks can read
// the grant details without re-fetching the Checkout Session.
payment_intent_data: { metadata },
success_url: `${origin}/welcome`,
cancel_url: `${origin}/`,
});

res.status(200).json({ url: session.url });
} catch (err: any) {
res.status(500).json({ error: err?.message || 'Could not create checkout session.' });
}
return;
}

// ---------------------------------------------------------------------------
// Solo Swoon Type unlock: a recurring subscription, mapped server-side to
// PRICE_ID_SOLO_UNLOCK so the client can never spoof the price. success/cancel
// both return to the buyer's own results page (returnPath, e.g.
// /swoon-type?v=...&p=...&e=...) so they land back where they were;
// ?unlocked=1 is appended on success only.
// ---------------------------------------------------------------------------
if (plan === 'solo_unlock') {
const soloPriceId = process.env.PRICE_ID_SOLO_UNLOCK;
if (!soloPriceId) {
console.error(
'[create-checkout-session] PRICE_ID_SOLO_UNLOCK is not set. Refusing to start Solo unlock checkout; ' +
'will not fall back to another price.'
);
res.status(500).json({ error: 'Solo unlock is not available right now. Please try again later.' });
return;
}

const safeReturnPath =
typeof returnPath === 'string' && returnPath.startsWith('/') ? returnPath : '/swoon-type';
const returnUrl = new URL(safeReturnPath, origin);

const successUrl = new URL(returnUrl.toString());
successUrl.searchParams.set('unlocked', '1');

try {
const metadata: Record<string, string> = { plan: 'solo_unlock' };
if (supabaseUserId) metadata.supabase_user_id = supabaseUserId;

const session = await stripe.checkout.sessions.create({
mode: 'subscription',
line_items: [{ price: soloPriceId, quantity: 1 }],
customer_email: customerEmail,
client_reference_id: supabaseUserId,
metadata,
subscription_data: { metadata },
success_url: successUrl.toString(),
cancel_url: returnUrl.toString(),
});

res.status(200).json({ url: session.url });
} catch (err: any) {
res.status(500).json({ error: err?.message || 'Could not create checkout session.' });
}
return;
}

// ---------------------------------------------------------------------------
// Existing subscription plans (starter / operator / command). Unchanged: the
// client sends the price ID directly and we open a subscription checkout.
// ---------------------------------------------------------------------------
if (!priceId || typeof priceId !== 'string') {
res.status(400).json({ error: 'A priceId is required.' });
return;
}

try {
// The Supabase user ID is carried through checkout so the webhook can
// identify the buyer directly. Email matching alone breaks when someone
// pays with a different address than the one they signed up with, and it
// is unavailable entirely on later subscription lifecycle events.
const session = await stripe.checkout.sessions.create({
mode: 'subscription',
line_items: [{ price: priceId, quantity: 1 }],
customer_email: customerEmail,
client_reference_id: supabaseUserId,
metadata: supabaseUserId ? { supabase_user_id: supabaseUserId } : undefined,
subscription_data: supabaseUserId
? { metadata: { supabase_user_id: supabaseUserId } }
: undefined,
success_url: `${origin}/?checkout=success`,
cancel_url: `${origin}/?checkout=cancelled`,
});

res.status(200).json({ url: session.url });
} catch (err: any) {
res.status(500).json({ error: err?.message || 'Could not create checkout session.' });
}
}
