import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendEmail, emailShell } from './_email';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { email, dateName, itinerary } = (req.body || {}) as any;
  if (!email || !itinerary || !Array.isArray(itinerary.stops)) {
    res.status(400).json({ error: 'email and itinerary required' });
    return;
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
