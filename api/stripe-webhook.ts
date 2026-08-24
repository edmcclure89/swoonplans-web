import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- inlined email helper (self-contained so Vercel bundles each function cleanly) ---
const EMAIL_FROM = 'Swoon Plans <admin@makeherswoon.com>';

async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'RESEND_API_KEY not set' };
  if (!opts.to || !opts.to.includes('@')) return { ok: false, error: 'bad recipient' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: EMAIL_FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!r.ok) { const body = await r.text().catch(() => ''); return { ok: false, error: `Resend ${r.status}: ${body.slice(0, 200)}` }; }
    return { ok: true };
  } catch (e: any) { return { ok: false, error: e?.message || 'send failed' }; }
}

function emailShell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FAF8F5;font-family:Georgia,'Times New Roman',serif;color:#1A1816">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 0">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #E8E2D9;border-radius:10px;overflow:hidden">
        <tr><td style="background:#1A1816;padding:28px 32px;text-align:center">
          <div style="font-size:22px;letter-spacing:4px;color:#FAF8F5;font-style:italic">SWOON PLANS</div>
          <div style="font-size:10px;letter-spacing:3px;color:#D5C29F;margin-top:6px;font-family:Arial,sans-serif">YOUR DATE PLANNING CONCIERGE</div>
        </td></tr>
        <tr><td style="padding:32px">${inner}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #E8E2D9;font-family:Arial,sans-serif;font-size:11px;color:#8C8377;text-align:center">
          Swoon Plans Concierge &middot; A division of For Love Coaching<br>
          Questions? <a href="mailto:admin@makeherswoon.com" style="color:#1A1816">admin@makeherswoon.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}
// --- end inlined email helper ---

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
  if (priceId === process.env.PRICE_ID_SELF_CARE) return 'self_care_monthly';
  if (priceId === process.env.PRICE_ID_SOLO_UNLOCK) return 'solo_unlock';
  if (priceId === process.env.PRICE_ID_KID_PLANS_MONTHLY) return 'kid_plans_monthly';
  if (priceId === process.env.PRICE_ID_KID_PLANS_ANNUAL) return 'kid_plans_annual';
  return null;
}

type AdminUser = { id: string; email?: string | null; user_metadata?: Record<string, any> };

// Email lookup used to be a single listUsers({ perPage: 1000 }) call, which
// silently stopped finding buyers once the user table passed 1000 rows: the
// customer would be charged and never unlocked. This pages all the way through.
async function findUserByEmail(admin: SupabaseClient, email: string): Promise<AdminUser | null> {
  const target = email.trim().toLowerCase();
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return null;
    const users = ((data as any)?.users || []) as AdminUser[];
    const hit = users.find((u) => (u.email || '').toLowerCase() === target);
    if (hit) return hit;
    if (users.length < perPage) return null; // last page
  }
  return null;
}

async function getUserById(admin: SupabaseClient, id: string): Promise<AdminUser | null> {
  try {
    const { data, error } = await admin.auth.admin.getUserById(id);
    if (error || !(data as any)?.user) return null;
    return (data as any).user as AdminUser;
  } catch {
    return null;
  }
}

// Resolves the Supabase user for a Stripe event. Prefers the ID we stamp onto
// the Stripe customer/subscription at checkout, because subscription lifecycle
// events (cancel, payment failure) carry a customer ID rather than an email.
async function resolveUser(
  admin: SupabaseClient,
  stripe: Stripe,
  opts: { userId?: string | null; customerId?: string | null; email?: string | null }
): Promise<AdminUser | null> {
  if (opts.userId) {
    const byId = await getUserById(admin, opts.userId);
    if (byId) return byId;
  }

  let email = opts.email || null;

  if (opts.customerId) {
    try {
      const customer = await stripe.customers.retrieve(opts.customerId);
      if (customer && !(customer as any).deleted) {
        const c = customer as Stripe.Customer;
        const linkedId = c.metadata?.supabase_user_id;
        if (linkedId) {
          const byMeta = await getUserById(admin, linkedId);
          if (byMeta) return byMeta;
        }
        if (!email && c.email) email = c.email;
      }
    } catch {
      /* fall through to email lookup */
    }
  }

  if (email) return findUserByEmail(admin, email);
  return null;
}

async function patchMetadata(admin: SupabaseClient, user: AdminUser, patch: Record<string, any>) {
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...(user.user_metadata || {}), ...patch },
  });
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

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    switch (event.type) {
      // Payment succeeded: unlock the account.
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email || session.customer_email || null;
        const customerId = typeof session.customer === 'string' ? session.customer : null;
        const userId = session.client_reference_id || session.metadata?.supabase_user_id || null;

        const user = await resolveUser(admin, stripe, { userId, customerId, email });
        if (!user) break;

        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
        const plan = planForPrice(lineItems.data[0]?.price?.id) || 'starter';

        await patchMetadata(admin, user, {
          plan,
          subscription_status: 'active',
          trial_used: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
        });

        // Stamp the Supabase user ID onto the Stripe customer so later
        // lifecycle events can find this account without an email scan.
        if (customerId) {
          try {
            await stripe.customers.update(customerId, { metadata: { supabase_user_id: user.id } });
          } catch {
            /* non-fatal */
          }
        }

        // Welcome email. Sent once per account; non-fatal if it fails so a mail
        // hiccup never blocks the unlock above.
        if (user.email && !user.user_metadata?.welcome_sent_at) {
          const first = (user.user_metadata?.name || '').split(' ')[0] || '';
          const hi = first ? `Welcome, ${first}.` : 'Welcome.';
          const inner = `
            <h1 style="font-size:24px;font-weight:normal;font-style:italic;color:#1A1816;margin:0 0 6px">${hi}</h1>
            <p style="font-family:Arial,sans-serif;font-size:13px;color:#6E675F;line-height:1.6;margin:0 0 20px">You're in. Your ${plan} plan is active. Curated venues, exact addresses, and one-tap reservations, ready whenever you are.</p>
            <a href="https://www.makeherswoon.com" style="display:inline-block;background:#D5C29F;color:#1A1816;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:4px;letter-spacing:1px">PLAN HER NEXT NIGHT</a>
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#8C8377;line-height:1.6;margin-top:24px">Cancel anytime. Questions? Just reply to this email.</p>`;
          const wr = await sendEmail({ to: user.email, subject: 'Welcome to Swoon Plans', html: emailShell(inner) });
          if (wr.ok) {
            await patchMetadata(admin, user, { welcome_sent_at: new Date().toISOString() });
          }
        }
        break;
      }

      // Plan changed, renewed, or moved into/out of a dunning state.
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;
        const user = await resolveUser(admin, stripe, {
          userId: sub.metadata?.supabase_user_id || null,
          customerId,
        });
        if (!user) break;

        const priceId = sub.items?.data?.[0]?.price?.id;
        const mappedPlan = planForPrice(priceId);

        await patchMetadata(admin, user, {
          subscription_status: sub.status,
          ...(mappedPlan ? { plan: mappedPlan } : {}),
        });
        break;
      }

      // Subscription actually ended: revoke access.
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : null;
        const user = await resolveUser(admin, stripe, {
          userId: sub.metadata?.supabase_user_id || null,
          customerId,
        });
        if (!user) break;

        await patchMetadata(admin, user, {
          plan: null,
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          access_revoked_at: new Date().toISOString(),
        });
        break;
      }

      // Card declined. Record it, but leave access alone: Stripe retries for
      // days, and kicking someone out over a temporarily expired card is worse
      // than a short grace period. Final cancellation is handled above.
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : null;
        const user = await resolveUser(admin, stripe, {
          customerId,
          email: (invoice as any).customer_email || null,
        });
        if (!user) break;

        await patchMetadata(admin, user, {
          subscription_status: 'past_due',
          last_payment_failed_at: new Date().toISOString(),
        });
        break;
      }

      default:
        break;
    }
  } catch (err: any) {
    // Return 500 so Stripe retries rather than silently dropping the event.
    res.status(500).json({ error: err?.message || 'Webhook handler failed' });
    return;
  }

  res.status(200).json({ received: true });
}
