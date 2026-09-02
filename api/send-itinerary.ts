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

// --- inlined link guard (see src/lib/linkHealth.ts for the canonical version) ---
//
// Last line of defence before an itinerary reaches a customer. Terence received
// a plan where 2 of 3 venue links were dead — one a parked domain with a
// self-signed certificate, one an HTTP 200 "Coming Soon" placeholder. Neither
// was a 404, so a status-code check would have passed both.
//
// This runs at send time, in parallel, with a hard time budget. If a link fails
// we do NOT block the email — we swap the dead button for map directions, which
// always work. A plan that arrives with directions beats a plan that never
// arrives, and both beat a plan with a broken button.
//
// The `api/` functions here are deliberately self-contained (no imports outside
// npm deps) so Vercel bundles each one cleanly. If you change the rules in
// src/lib/linkHealth.ts, mirror them here.

const LINK_CHECK_BUDGET_MS = 4000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const TRUSTED_LINK_HOSTS = ['opentable.com', 'resy.com', 'exploretock.com', 'tock.com', 'sevenrooms.com', 'yelp.com', 'google.com', 'nps.gov'];

const DEAD_PAGE_PATTERNS = [
  /coming\s+soon/i,
  /under\s+construction/i,
  /domain\s+(is\s+)?for\s+sale/i,
  /buy\s+this\s+domain/i,
  /is\s+parked\s+(free\s+)?(courtesy|by)/i,
  /this\s+domain\s+has\s+expired/i,
  /account\s+(has been\s+)?suspended/i,
  /this\s+ip\s+address\s+is\s+managed\s+by/i,
  /godaddy|sedo|hugedomains|afternic/i,
];

// Bot protection proves nothing is wrong with the venue's site — never degrade on these.
const BOT_CHALLENGE_PATTERNS = [
  /sgcaptcha|cf-browser-verification|challenge-platform|just a moment|checking your browser/i,
  /access denied|incapsula|perimeterx|datadome|verify you are human/i,
];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function linkHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

function trustedLink(url: string): boolean {
  const h = linkHost(url);
  return TRUSTED_LINK_HOSTS.some((t) => h === t || h.endsWith('.' + t));
}

/**
 * Returns true only when we are CONFIDENT the link is bad. Anything ambiguous
 * (timeout, bot block, JS-rendered shell) returns false and the link ships —
 * degrading a working venue on a false positive is its own brand problem.
 */
async function isLinkBroken(url: string, venueName: string): Promise<boolean> {
  const clean = (url || '').trim();
  if (!clean || /example\.com/i.test(clean)) return false;
  if (trustedLink(clean)) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LINK_CHECK_BUDGET_MS);
  try {
    const res = await fetch(clean, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,*/*' },
    });

    if (res.status === 404 || res.status === 410) return true;
    // 401/403/405/429 = bot protection. 5xx = their server hiccup. Not our call to make.
    if (res.status >= 400) return false;

    const endHost = linkHost(res.url || clean);
    if (/godaddy|sedo|hugedomains|afternic|dan\.com|parking|bodis|squadhelp/i.test(endHost)) return true;

    const html = await res.text();
    if (BOT_CHALLENGE_PATTERNS.some((p) => p.test(html))) return false;
    if (/location\.(href|replace)\s*=?\s*\(?["']\/lander/i.test(html)) return true;

    const text = stripHtml(html);
    // Venue names itself on the page: definitely real.
    if (venueName && venueName.length > 3 && text.toLowerCase().includes(venueName.toLowerCase())) return false;
    // Placeholder copy on a thin page.
    if (text.length < 1200 && DEAD_PAGE_PATTERNS.some((p) => p.test(text))) return true;
    // Thin in both markup and text = parked, not a JS app.
    if (text.length < 200 && html.length < 1500) return true;
    return false;
  } catch (e: any) {
    const msg = String(e?.cause?.code || e?.cause?.message || e?.message || '');
    // A certificate a browser refuses, or a name that does not resolve, is a
    // broken link for the customer. This is the columbiaroomdc.com case.
    if (/cert|ssl|tls|self-signed|self signed/i.test(msg)) return true;
    if (/enotfound|eai_again/i.test(msg)) return true;
    if (/econnrefused/i.test(msg)) return true;
    return false; // timeout / proxy / unknown: give the link the benefit of the doubt
  } finally {
    clearTimeout(timer);
  }
}

function directionsLink(venue: any): string {
  const q = [venue?.name, venue?.address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * Validate every stop's link in parallel and mark the dead ones. Bounded by an
 * overall budget so a slow venue site can never hold up the send.
 */
async function vetStops(stops: Stop[]): Promise<{ stops: Stop[]; degraded: string[] }> {
  const degraded: string[] = [];
  const overall = new Promise<void>((r) => setTimeout(r, LINK_CHECK_BUDGET_MS + 1500));

  const checks = stops.map(async (stop) => {
    const v: any = stop?.venue || {};
    const url = (v.linkUrl || '').trim();
    if (!url) return stop;
    const broken = await Promise.race([
      isLinkBroken(url, v.name || ''),
      overall.then(() => false), // budget blown: ship the link as-is
    ]);
    if (!broken) return stop;
    degraded.push(v.name || url);
    return { ...stop, venue: { ...v, linkBroken: true, directionsUrl: directionsLink(v) } };
  });

  return { stops: await Promise.all(checks), degraded };
}
// --- end inlined link guard ---


function stopRow(stop: Stop): string {
  const v = stop.venue || {};
  const name = v.name || 'Venue';
  const addr = v.address || '';
  const url = (v.linkUrl || '').trim();
  const linkText = (v.linkText || 'Reserve').trim();
  const btn = (href: string, text: string) =>
    `<a href="${href}" style="display:inline-block;margin-top:6px;background:#D5C29F;color:#1A1816;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;text-decoration:none;padding:8px 16px;border-radius:4px">${text}</a>`;

  // Link failed validation at send time: send them to directions and their
  // phone instead of a button that goes nowhere.
  const reserve = v.linkBroken
    ? btn(v.directionsUrl || directionsLink(v), 'Get directions') +
      (v.phone
        ? `<div style="font-family:Arial,sans-serif;font-size:12px;color:#6E675F;margin-top:6px">Call ahead: ${v.phone}</div>`
        : '')
    : url && !/example\.com/i.test(url)
      ? btn(url, linkText)
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
async function createAccountServerSide(email: string, name: string, isVipFamily: boolean, bonusPlans: number): Promise<void> {
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
        bonus_plans_remaining: Number(bonusPlans) || 0,
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

  const { email, dateName, itinerary, createAccount, name, isVipFamily, bonusPlans } = (req.body || {}) as any;
  if (!email || !itinerary || !Array.isArray(itinerary.stops)) {
    res.status(400).json({ error: 'email and itinerary required' });
    return;
  }

  if (createAccount) {
    await createAccountServerSide(email, name, !!isVipFamily, Number(bonusPlans) || 0);
  }

  const who = dateName ? ` for ${dateName}` : '';

  // Validate every venue link before it goes in front of a paying customer.
  // Never fatal: if the guard itself fails, send the original itinerary.
  let stops: Stop[] = itinerary.stops;
  let degraded: string[] = [];
  try {
    const vetted = await vetStops(itinerary.stops);
    stops = vetted.stops;
    degraded = vetted.degraded;
    if (degraded.length) {
      // Shows up in Vercel logs so a dead venue gets fixed in the dataset
      // instead of quietly degrading on every future send.
      console.warn(`[link-guard] degraded ${degraded.length} link(s) for ${email}: ${degraded.join(', ')}`);
    }
  } catch (e: any) {
    console.error('[link-guard] check failed, sending unmodified:', e?.message);
  }

  const rows = stops.map(stopRow).join('');
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
  res.status(200).json({ sent: true, degradedLinks: degraded });
}
