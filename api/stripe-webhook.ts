import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Maps a Stripe price ID back to our internal plan name.
function planForPrice(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  if (priceId === process.env.PRICE_ID_STARTER) return 'starter';
  if (priceId === process.env.PRICE_ID_OPERATOR) return 'operator';
  if (priceId === process.env.PRICE_ID_COMMAND) return 'command';
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://dvabymxhcefstjpzvznw.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecret || !webhookSecret || !serviceRoleKey) {
    res.status(500).json({ error: 'Stripe or Supabase is not fully configured yet.' });
    return;
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2026-07-29.dahlia' as Stripe.LatestApiVersion });
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err: any) {
    res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    return;
  }

  // This is the event that fires right after a successful Stripe Checkout —
  // it's what actually unlocks the account after payment.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;

    if (email) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      const priceId = lineItems.data[0]?.price?.id;
      const plan = planForPrice(priceId) || 'starter';

      const admin = createClient(supabaseUrl, serviceRoleKey);
      // Look up the Supabase user by email, then stamp their metadata with the
      // new plan so the app's paywall check (meStatus.subscription_status) unlocks.
      const { data: usersPage, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (!listErr) {
        const user = usersPage.users.find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
        if (user) {
          await admin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              plan,
              subscription_status: 'active',
              trial_used: true,
              stripe_customer_id: session.customer,
            },
          });
        }
      }
    }
  }

  res.status(200).json({ received: true });
}
