import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// Deterministic public referral code derived from the registrant's email.
// The waitlist schema has no referral_code column, so we derive it the same
// way everywhere (client display + friend attribution) instead of storing it.
// It's a hash prefix, so the raw email is never exposed in the code itself.
function deriveRefCode(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 8).toUpperCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || 'https://dvabymxhcefstjpzvznw.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    res.status(500).json({ error: 'Supabase is not configured on this deployment yet.' });
    return;
  }

  const { firstName, email, phone, zip, referredBy } = req.body || {};

  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail || !cleanEmail.includes('@')) {
    res.status(400).json({ error: 'A valid email is required.' });
    return;
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const referralCode = deriveRefCode(cleanEmail);

  const row = {
    email: cleanEmail,
    first_name: typeof firstName === 'string' ? firstName.trim().slice(0, 120) : null,
    phone: typeof phone === 'string' && phone.trim() ? phone.replace(/\D/g, '').slice(0, 20) : null,
    zip: typeof zip === 'string' && zip.trim() ? zip.trim().slice(0, 10) : null,
    metro: null as string | null,
    referred_by: typeof referredBy === 'string' && referredBy.trim() ? referredBy.trim().slice(0, 32) : null,
    is_seed: false,
  };

  try {
    // Insert the signup. A duplicate email is not a failure for the visitor —
    // they still get their (deterministic) code and a queue position — so we
    // treat a unique-violation as a soft success.
    const { error: insertError } = await admin.from('waitlist').insert(row);
    if (insertError && insertError.code !== '23505') {
      console.error('[register] insert failed:', insertError.message);
      res.status(500).json({ error: 'Could not save your registration. Please try again.' });
      return;
    }

    // Queue position counts ONLY real signups (is_seed = false). Seeded test
    // rows must never inflate a number shown to the public.
    const { count } = await admin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .eq('is_seed', false);

    const queuePosition = typeof count === 'number' && count > 0 ? count : null;

    res.status(200).json({ referralCode, queuePosition });
  } catch (err: any) {
    console.error('[register] unexpected error:', err?.message || err);
    res.status(500).json({ error: 'Could not save your registration. Please try again.' });
  }
}
