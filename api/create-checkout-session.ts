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

  const { priceId, plan, email, userId } = req.body || {};

  // Resolve which price to charge and in what mode.
  // - plan === 'founders' -> the 3-month-upfront Founders Pass, billed ONCE
  //   ('payment' mode), mapped strictly to PRICE_ID_FOUNDERS.
  // - otherwise -> the existing recurring plans (starter/operator/command),
  //   whose price IDs the client passes through as `priceId`, in
  //   'subscription' mode. That existing mapping is deliberately untouched.
  let resolvedPriceId: string;
  let mode: 'payment' | 'subscription';

  if (plan === 'founders') {
    const foundersPrice = process.env.PRICE_ID_FOUNDERS;
    if (!foundersPrice) {
      // Fail loudly. Do NOT silently fall back to another price — charging the
      // wrong amount is worse than a clear, recoverable error.
      console.error(
        '[create-checkout-session] PRICE_ID_FOUNDERS is not set. Refusing to start Founders Pass checkout with a fallback price.',
      );
      res.status(500).json({
        error: 'The Founders Pass is not configured on this deployment yet (missing PRICE_ID_FOUNDERS).',
      });
      return;
    }
    resolvedPriceId = foundersPrice;
    mode = 'payment';
  } else {
    if (!priceId || typeof priceId !== 'string') {
      res.status(400).json({ error: 'A priceId or plan is required.' });
      return;
    }
    resolvedPriceId = priceId;
    mode = 'subscription';
  }

  const supabaseUserId = typeof userId === 'string' && userId ? userId : undefined;

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2026-07-29.dahlia' as Stripe.LatestApiVersion });
    const origin = (req.headers.origin as string) || `https://${req.headers.host}`;

    // The Supabase user ID is carried through checkout so the webhook can
    // identify the buyer directly. Email matching alone breaks when someone
    // pays with a different address than the one they signed up with, and it
    // is unavailable entirely on later subscription lifecycle events.
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      customer_email: typeof email === 'string' ? email : undefined,
      client_reference_id: supabaseUserId,
      metadata: {
        ...(supabaseUserId ? { supabase_user_id: supabaseUserId } : {}),
        plan: plan === 'founders' ? 'founders' : 'subscription',
      },
      // subscription_data is only valid in subscription mode; the one-time
      // Founders Pass must not carry it.
      subscription_data:
        mode === 'subscription' && supabaseUserId
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
