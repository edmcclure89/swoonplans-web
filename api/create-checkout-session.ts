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

  const { priceId, email, userId } = req.body || {};
  if (!priceId || typeof priceId !== 'string') {
    res.status(400).json({ error: 'A priceId is required.' });
    return;
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
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: typeof email === 'string' ? email : undefined,
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
