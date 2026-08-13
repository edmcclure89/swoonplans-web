import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Records that an invite was opened, for dedupe/analytics ONLY.
// The client sends a SHA-256 hash of the friend's contact — never the raw
// phone number or email. A friend who never opted in must not have their
// details stored or transmitted (TCPA exposure). We store the opaque hash.
const HEX64 = /^[a-f0-9]{64}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://dvabymxhcefstjpzvznw.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    // Non-fatal for the visitor: invite links still open on their device.
    res.status(200).json({ ok: false, reason: 'not-configured' });
    return;
  }

  const { contactHash, referrerCode } = req.body || {};

  // Reject anything that is not a bare SHA-256 hex digest. This is a hard
  // guard against a raw email/phone accidentally being posted here.
  if (typeof contactHash !== 'string' || !HEX64.test(contactHash)) {
    res.status(400).json({ error: 'A valid contact hash is required.' });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { error } = await admin.from('referral_invites').insert({
      contact_hash: contactHash.toLowerCase(),
      referrer_code: typeof referrerCode === 'string' ? referrerCode.trim().slice(0, 32) : null,
    });
    // A duplicate (already-invited) hash is the whole point of dedupe — treat
    // it as success. Any other error is logged but never blocks the visitor.
    if (error && error.code !== '23505') {
      console.error('[referral-invite] insert failed:', error.message);
    }
    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('[referral-invite] unexpected error:', err?.message || err);
    res.status(200).json({ ok: true });
  }
}
