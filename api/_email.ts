// Minimal Resend REST client. Uses fetch (global on Vercel's Node 18+ runtime)
// so we add no npm dependency. RESEND_API_KEY is set in the Vercel project.
// The sending domain (makeherswoon.com) is verified in Resend.

const FROM = 'Swoon Plans <admin@makeherswoon.com>';

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'RESEND_API_KEY not set' };
  if (!opts.to || !opts.to.includes('@')) return { ok: false, error: 'bad recipient' };

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      return { ok: false, error: `Resend ${r.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'send failed' };
  }
}

// Shared branded shell: dark ink + gold, matches the site and the magic-link template.
export function emailShell(inner: string): string {
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
