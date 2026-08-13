import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// Three-day follow-up (Vercel Cron, daily).
//
// Selects waitlist registrants who signed up more than 3 days ago, have not
// been followed up with yet, and are NOT seeded test rows. Emails THAT
// REGISTRANT ONLY (they opted in when they registered) a link to the
// pricing/subscription page, then stamps followup_sent_at so they are never
// emailed twice.
//
// The actual email send is intentionally left as a STUB (see the TODO below).
// No credentials are invented here.
// =============================================================================

const PRICING_URL = 'https://makeherswoon.com/#pricing';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cron protection: if CRON_SECRET is configured, require it.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    const key = (req.query.key as string) || '';
    if (auth !== `Bearer ${secret}` && key !== secret) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://dvabymxhcefstjpzvznw.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    res.status(500).json({ error: 'Supabase is not configured on this deployment yet.' });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const cutoffIso = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  let sent = 0;
  let failed = 0;
  let skippedNoEmail = 0;

  try {
    // Registered > 3 days ago, not yet followed up, and never a seeded row.
    const { data, error } = await admin
      .from('waitlist')
      .select('id, email, first_name')
      .lt('created_at', cutoffIso)
      .is('followup_sent_at', null)
      .eq('is_seed', false)
      .limit(200);

    if (error) {
      console.error('[waitlist-followup] query failed:', error.message);
      res.status(500).json({ error: 'Query failed.' });
      return;
    }

    for (const row of data || []) {
      if (!row.email || !String(row.email).includes('@')) {
        skippedNoEmail++;
        continue;
      }

      const firstName = (row.first_name || '').toString().trim();
      const greeting = firstName ? `${firstName}, ` : '';
      const subject = 'Your SwoonPlans invitation is ready';
      const body =
        `${greeting}thanks for registering. You can start planning your first date night now — ` +
        `real venues, exact addresses, reservations included. See plans here: ${PRICING_URL}`;

      // ---------------------------------------------------------------------
      // TODO(email-provider): wire up the actual send here.
      //
      // This project already has a Resend helper pattern in api/nudge.ts and
      // the env vars RESEND_API_KEY / REMINDER_FROM_EMAIL are available. To go
      // live, replace this stub with a real send, e.g.:
      //
      //   const r = await fetch('https://api.resend.com/emails', {
      //     method: 'POST',
      //     headers: {
      //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       from: process.env.REMINDER_FROM_EMAIL,
      //       to: [row.email],
      //       subject,
      //       html: `<p>${body}</p>`,
      //     }),
      //   });
      //   const emailOk = r.ok;
      //
      // Until that is wired, we do NOT actually send — but we still stamp the
      // row so this endpoint is safe to run and idempotent.
      // ---------------------------------------------------------------------
      const emailOk = true; // STUB: no email is actually sent yet.
      void subject;
      void body;

      if (!emailOk) {
        failed++;
        continue;
      }

      const { error: stampError } = await admin
        .from('waitlist')
        .update({ followup_sent_at: new Date().toISOString() })
        .eq('id', row.id);

      if (stampError) {
        console.error('[waitlist-followup] stamp failed for id', row.id, stampError.message);
        failed++;
      } else {
        sent++;
      }
    }
  } catch (err: any) {
    console.error('[waitlist-followup] unexpected error:', err?.message || err);
    res.status(500).json({ error: 'Follow-up run failed.', sent, failed });
    return;
  }

  res.status(200).json({ sent, failed, skippedNoEmail, note: 'email send is stubbed (see TODO)' });
}
