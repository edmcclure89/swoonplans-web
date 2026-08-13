import { supabase } from './supabase';

// Shared client entry point for the Founders Pass one-time checkout. Both the
// hero "INSTANT ACCESS" button and the AccessModal call this so the founders
// wiring lives in exactly one place. The server maps plan -> PRICE_ID_FOUNDERS
// and uses mode:'payment'; the client never sends a price ID for this plan.
export async function startFoundersCheckout(): Promise<{ ok: boolean; error?: string }> {
  try {
    // Carry the Supabase identity through checkout (mirrors the subscription
    // flow) so the webhook can unlock the right account even if they pay with
    // a different email than they signed up with.
    let userId: string | undefined;
    let email: string | undefined;
    try {
      const { data } = await supabase.auth.getUser();
      userId = data?.user?.id;
      email = data?.user?.email || undefined;
    } catch {
      userId = undefined;
      email = undefined;
    }

    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'founders', email, userId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || "Couldn't start checkout. Try again in a moment." };
    }
    window.location.href = data.url;
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't reach checkout. Check your connection and try again." };
  }
}
