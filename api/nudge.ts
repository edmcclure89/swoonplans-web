import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail, emailShell } from './_email';

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
