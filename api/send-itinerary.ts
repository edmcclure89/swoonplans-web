import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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

interface Stop { label: string; venue: any; }

function stopRow(stop: Stop): string {
  const v = stop.venue || {};
  const name = v.name || 'Venue';
  const addr = v.address || '';
  const url = (v.linkUrl || '').trim();
  const linkText = (v.linkText || 'Reserve').trim();
  const reserve = url && !/example\.com/i.test(url)
    ? `<a href="${url}" style="display:inline-block;margin-top:6px;background:#D5C29F;color:#1A1816;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:8px 16px;border-radius:4px">${linkText}</a>`
    : `<span style="font-family:Arial,sans-serif;font-size:12px;color:#8C8377">Walk-in, no reservation needed</span>`;
  return `<tr><td style="padding:14px 0;border-bottom:1px solid #E8E2D9">
<div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#8C8377">${(stop.label || '').toUpperCase()}</div>
<div style="font-size:18px;color:#1A1816;margin-top:4px">${name}</div>
${addr ? `<div style="font-family:Arial,sans-serif;font-size:12px;color:#6E675F;margin-top:2px">${addr}</div>` : ''}
<div style="margin-top:6px">${reserve}</div>
</td></tr>`;
}

// Free-plan gate: create (or find) the Supabase account server-side so the
// free flow never needs its own magic-link email. email_confirm marks the
// address verified without Supabase sending anything. Non-fatal on failure:
// a mail hiccup or a duplicate account should never block the itinerary
// email from going out.
async function createAccountServerSide(email: string, name: string, isVipFamily: boolean): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://dvabymxhcefstjpzvznw.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return;
  try {
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        name: name || '',
        is_vip_family: !!isVipFamily,
        trial_used: !isVipFamily,
      },
    });
    // "already registered" just means this email has used its free plan
    // before, or is an existing customer. Not a failure of this request.
    if (error && !/already/i.test(error.message || '')) {
      console.error('createUser failed:', error.message);
    }
  } catch (e: any) {
    console.error('createUser threw:', e?.message);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { email, dateName, itinerary, createAccount, name, isVipFamily } = (req.body || {}) as any;
  if (!email || !itinerary || !Array.isArray(itinerary.stops)) {
    res.status(400).json({ error: 'email and itinerary required' });
    return;
  }

  if (createAccount) {
    await createAccountServerSide(email, name, !!isVipFamily);
  }

  const who = dateName ? ` for ${dateName}` : '';
  const rows = itinerary.stops.map(stopRow).join('');
  const logistics = itinerary.logistics
    ? `<p style="font-family:Arial,sans-serif;font-size:13px;color:#6E675F;line-height:1.6;margin-top:20px">${itinerary.logistics}</p>`
    : '';

  const inner = `
<h1 style="font-size:24px;font-weight:normal;font-style:italic;color:#1A1816;margin:0 0 6px">Her night is planned${who}.</h1>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#6E675F;line-height:1.6;margin:0 0 20px">Real venues, addresses, and booking links below. Lock in reservations a day ahead and you are the hero.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
${logistics}
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8C8377;line-height:1.6;margin-top:24px">Want another night planned? <a href="https://www.makeherswoon.com" style="color:#1A1816">Start a new plan</a>.</p>`;

  const sent = await sendEmail({
    to: email,
    subject: dateName ? `Her date plan for ${dateName} is ready` : 'Her date plan is ready',
    html: emailShell(inner),
  });

  if (!sent.ok) { res.status(502).json({ error: sent.error }); return; }
  res.status(200).json({ sent: true });
}
