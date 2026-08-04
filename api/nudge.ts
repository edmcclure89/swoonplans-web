import type { VercelRequest, VercelResponse } from '@vercel/node';
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

type AdminUser = {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, any>;
};

function isEntitled(meta: Record<string, any>): boolean {
  const s = meta.subscription_status;
  return meta.is_vip_family === true || s === 'active' || s === 'trialing' || s === 'past_due';
}

async function eligibleUsers(admin: SupabaseClient): Promise<AdminUser[]> {
  const now = Date.now();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const out: AdminUser[] = [];
  const perPage = 200;
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = ((data as any)?.users || []) as AdminUser[];
    for (const u of users) {
      const meta = u.user_metadata || {};
      if (!u.email) continue;
      if (isEntitled(meta)) continue;        // already a paying/active member
      if (meta.nudge_sent_at) continue;      // only nudge once
      const created = u.created_at ? new Date(u.created_at).getTime() : 0;
      const age = now - created;
      // Window: signed up 3-7 days ago. Avoids nudging brand-new users and
      // avoids spamming very old dormant accounts on the first run.
      if (age >= THREE_DAYS && age <= SEVEN_DAYS) out.push(u);
    }
    if (users.length < perPage) break;
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel Cron calls this. If CRON_SECRET is set in the project, require it so
  // the endpoint can't be triggered by strangers; if not set, allow (cron-only).
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
  if (!serviceRoleKey) { res.status(500).json({ error: 'Supabase not configured' }); return; }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  let sent = 0;
  let failed = 0;
  try {
    const users = await eligibleUsers(admin);
    for (const u of users) {
      const name = (u.user_metadata?.name || '').split(' ')[0] || '';
      const hi = name ? `${name}, her` : 'Her';
      const inner = `
        <h1 style="font-size:24px;font-weight:normal;font-style:italic;color:#1A1816;margin:0 0 6px">${hi} perfect night is still waiting.</h1>
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#6E675F;line-height:1.6;margin:0 0 20px">You started a plan a few days ago. Real venues, exact addresses, one-tap reservations. It takes about sixty seconds to finish, and the first plan is free.</p>
        <a href="https://www.makeherswoon.com" style="display:inline-block;background:#D5C29F;color:#1A1816;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;text-decoration:none;padding:12px 28px;border-radius:4px;letter-spacing:1px">FINISH HER PLAN</a>
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#8C8377;line-height:1.6;margin-top:24px">She thinks you planned it all week. Her group chat is green with envy.</p>`;
      const r = await sendEmail({ to: u.email!, subject: 'Her perfect night is still waiting', html: emailShell(inner) });
      if (r.ok) {
        sent++;
        await admin.auth.admin.updateUserById(u.id, {
          user_metadata: { ...(u.user_metadata || {}), nudge_sent_at: new Date().toISOString() },
        });
      } else {
        failed++;
      }
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'nudge run failed', sent, failed });
    return;
  }

  res.status(200).json({ sent, failed });
}
