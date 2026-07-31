import { createClient } from '@supabase/supabase-js';

// Same project the live makeherswoon.com site uses. The anon/publishable key
// is safe to ship client-side (it's what Supabase's client SDK is designed for);
// row-level security on the Supabase project is what actually protects data.
const SUPABASE_URL = 'https://dvabymxhcefstjpzvznw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6AlA9-2bTC0EYRgZIbRmAg_TcI90JpE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface MeStatus {
  email: string | null;
  plan: string | null;
  subscription_status: string | null;
  trial_used: boolean;
}

// Account status is derived entirely from the client-side Supabase session,
// matching the live site (this is a static/SPA deployment with no backend
// /api/me route to call).
export async function refreshMe(): Promise<{ meStatus: MeStatus | null; isVipFamily: boolean }> {
  try {
    const { data, error } = await supabase.auth.getUser();
    const user = data && data.user;
    if (error || !user) return { meStatus: null, isVipFamily: false };
    const meta = user.user_metadata || {};
    const vip = !!meta.is_vip_family;
    return {
      meStatus: {
        email: user.email || meta.email || null,
        plan: meta.plan || (vip ? 'vip' : null),
        subscription_status: meta.subscription_status || (vip ? 'active' : null),
        trial_used: !!meta.trial_used,
      },
      isVipFamily: vip,
    };
  } catch {
    return { meStatus: null, isVipFamily: false };
  }
}

const FAM_PASS_RE = /(^|\s)\.fam\b/i;
export function hasFamPass(name: string): boolean {
  return FAM_PASS_RE.test(name || '');
}
export function stripFamPass(name: string): string {
  return (name || '').replace(/(^|\s)\.fam\b/gi, ' ').replace(/\s{2,}/g, ' ').trim();
}

export function maxProfilesForPlan(plan: string | null): number {
  if (plan === 'starter') return 1;
  if (plan === 'operator') return 3;
  return 999;
}

const PROFILE_KEY = 'swoon_profiles';
export interface SavedProfile {
  code: string;
  axes: Record<string, string>;
}
export function loadProfiles(): Record<string, SavedProfile> {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  } catch {
    return {};
  }
}
export function saveProfiles(profiles: Record<string, SavedProfile>): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
}
