// Venue link health checking.
//
// Why this exists: a customer-facing itinerary is only as good as its links.
// Two failure modes burned us in production, and NEITHER is an HTTP 404:
//
//   1. Parked / misconfigured domain. columbiaroomdc.com resolves to a
//      registrar parking IP serving a self-signed cert. curl and every browser
//      throw a TLS warning. A naive `fetch().ok` check never even gets a status.
//   2. Soft placeholder. ujnsq.com returns a clean HTTP 200 with a Squarespace
//      "Coming Soon" page. Status-code-only validation calls this healthy.
//
// So: check transport (DNS/TLS/status) AND check that the body actually looks
// like a real venue site.
//
// NOTE: a trimmed copy of this logic is inlined in `api/send-itinerary.ts`.
// The `api/` functions in this repo are deliberately self-contained (no
// imports outside npm deps) so Vercel bundles each one cleanly. If you change
// the detection rules here, mirror them there.

// 'inconclusive' is load-bearing. Plenty of real venue sites cannot be judged
// from a plain fetch: hotel groups return 403 to non-browser user agents,
// Squarespace/Next sites ship an empty shell and render in JS, and a slow host
// times out. Calling those "broken" and pulling the venue would do more damage
// than the broken link did. Only a CONFIDENT failure quarantines a venue;
// anything uncertain is surfaced for review and left in rotation.
export type LinkVerdict = 'healthy' | 'dead' | 'placeholder' | 'inconclusive' | 'unchecked';

export interface LinkHealth {
  url: string;
  verdict: LinkVerdict;
  status?: number;
  finalUrl?: string;
  reason?: string;
  checkedAt?: string;
  /** Set when a headless-browser pass overrode the plain-fetch verdict. */
  confirmedBy?: 'fetch' | 'browser';
}

// Aggregators we link to on purpose. They are always up, they rate-limit and
// bot-block automated checkers, and a false "dead" on these would quarantine
// half the dataset. Trust them.
const TRUSTED_HOSTS = [
  'opentable.com',
  'resy.com',
  'exploretock.com',
  'tock.com',
  'sevenrooms.com',
  'yelp.com',
  'google.com',
  'nps.gov',
];

// Placeholder / parked-domain fingerprints. Matched against the visible text of
// the response body, lowercased.
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /coming\s+soon/,
  /under\s+construction/,
  /this\s+domain\s+(is|has been)\s+(for sale|parked|registered)/,
  /buy\s+this\s+domain/,
  /domain\s+(is\s+)?for\s+sale/,
  /is\s+parked\s+(free\s+)?(courtesy|by)/,
  /parked\s+domain/,
  /account\s+(has been\s+)?suspended/,
  /this\s+site\s+(is\s+)?(temporarily\s+)?unavailable/,
  /website\s+(is\s+)?(temporarily\s+)?(down|unavailable)/,
  /default\s+web\s?(site|page)/,
  /this\s+ip\s+address\s+is\s+managed\s+by/,
  /future\s+home\s+of/,
  /page\s+not\s+found/,
  /site\s+not\s+found/,
  /no\s+longer\s+in\s+(business|service)/,
  /permanently\s+closed/,
  /we\s+are\s+closed\s+permanently/,
  /renew\s+(this|your)\s+domain/,
  /godaddy|sedo|hugedomains|dan\.com|afternic/,
];

// Bot-protection challenge pages. These prove nothing about the venue — the
// site is up, it just won't talk to a script. Never condemn on these.
// (b.patisserie and Little Man Ice Cream both sit behind SiteGround's captcha;
// Four Seasons and Marriott return a bare "Access Denied" to non-browsers.)
const BOT_CHALLENGE_PATTERNS: RegExp[] = [
  /sgcaptcha/i,
  /\/\.well-known\/(sgcaptcha|captcha)/i,
  /cf-browser-verification|cf_chl_|challenge-platform|__cf_bm/i,
  /just a moment\.\.\./i,
  /checking your browser/i,
  /access denied/i,
  /incapsula|_incap_|distil_r_captcha|perimeterx|px-captcha|datadome/i,
  /enable javascript and cookies to continue/i,
  /are you a robot|verify you are human|recaptcha/i,
];

// Domain-parking landers redirect to a "/lander" style page with JS.
const PARKING_REDIRECT_PATTERNS: RegExp[] = [
  /location\.href\s*=\s*["']\/lander/i,
  /location\.replace\(["']\/lander/i,
  /parkingcrew|sedoparking|bodis|above\.com|parklogic/i,
];

function isBotChallenge(html: string, headers?: Headers): boolean {
  if (BOT_CHALLENGE_PATTERNS.some((p) => p.test(html))) return true;
  const server = headers?.get('server') || '';
  return /cloudflare/i.test(server) && /challenge/i.test(html);
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function isTrustedHost(url: string): boolean {
  const h = hostOf(url);
  return TRUSTED_HOSTS.some((t) => h === t || h.endsWith('.' + t));
}

// Strip tags/scripts and collapse whitespace so pattern matching sees text,
// not markup. Cheap on purpose: we only need the first chunk of the page.
export function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export interface CheckOptions {
  timeoutMs?: number;
  /** Venue name — if it appears on the page, that's strong evidence the site is real. */
  expectName?: string;
  /** Internal: set on the retry pass so transient failures aren't retried forever. */
  _isRetry?: boolean;
}

function verdict(
  url: string,
  v: LinkVerdict,
  reason: string,
  extra: Partial<LinkHealth> = {},
): LinkHealth {
  return { url, verdict: v, reason, checkedAt: new Date().toISOString(), confirmedBy: 'fetch', ...extra };
}

// Does the raw HTML look like a real site that simply renders in JavaScript?
// A Squarespace/Next/React shell is small on text but full of markup and
// script tags. A parked domain is small on both.
function looksLikeAppShell(html: string): boolean {
  const scripts = (html.match(/<script/gi) || []).length;
  const hasMount = /<div[^>]+id=["'](root|app|__next|__nuxt)["']/i.test(html);
  const hasBundle = /\.(js|mjs)\b|__NEXT_DATA__|window\.__|squarespace|wp-content|shopify/i.test(html);
  return html.length > 2000 && (hasMount || (scripts >= 2 && hasBundle));
}

/**
 * Fetch a URL and decide whether it is safe to put in front of a customer.
 * Never throws.
 *
 * Bias: false "healthy" is recoverable (the send-time guard and the browser
 * pass catch it). A false "dead" silently deletes a good venue from the
 * catalogue, which is worse. So we only return dead/placeholder on evidence
 * that cannot be explained by bot-blocking, JS rendering, or a slow host.
 */
export async function checkLink(url: string, opts: CheckOptions = {}): Promise<LinkHealth> {
  const timeoutMs = opts.timeoutMs ?? 12000;
  const clean = (url || '').trim();

  if (!clean) return verdict(clean, 'unchecked', 'no url');
  if (/example\.com/i.test(clean)) return verdict(clean, 'placeholder', 'example.com stub');
  if (isTrustedHost(clean)) return verdict(clean, 'healthy', 'trusted booking host');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const retry = async (why: string): Promise<LinkHealth> => {
    if (opts._isRetry) return verdict(clean, 'inconclusive', why);
    await new Promise((r) => setTimeout(r, 1500));
    return checkLink(clean, { ...opts, _isRetry: true });
  };

  try {
    const res = await fetch(clean, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const status = res.status;
    const finalUrl = res.url || clean;
    const base = { status, finalUrl };

    // Hard gone. Nothing explains these away.
    if (status === 404 || status === 410) {
      return verdict(clean, 'dead', `HTTP ${status}`, base);
    }
    // Bot-blocking, not a broken link. Marriott, Four Seasons, Cloudflare and
    // friends all return these to a non-browser client while serving humans fine.
    if (status === 401 || status === 403 || status === 405 || status === 429) {
      return verdict(clean, 'inconclusive', `HTTP ${status} (likely bot protection, needs browser check)`, base);
    }
    // Server-side trouble: retry once, then flag rather than condemn.
    if (status >= 500) {
      clearTimeout(timer);
      return retry(`HTTP ${status} on both attempts`);
    }
    if (status >= 400) {
      return verdict(clean, 'dead', `HTTP ${status}`, base);
    }

    // Redirected off the venue's domain onto a registrar / for-sale landing.
    let offDomainRedirect = '';
    const startHost = hostOf(clean);
    const endHost = hostOf(finalUrl);
    if (startHost && endHost && startHost !== endHost && !isTrustedHost(finalUrl)) {
      if (/godaddy|sedo|hugedomains|afternic|dan\.com|parking|squadhelp|bodis|above\.com/i.test(endHost)) {
        return verdict(clean, 'dead', `redirects to domain-parking host ${endHost}`, base);
      }
      // Expired domain picked up by someone else. Antico Pizza's domain now
      // 302s to desanopizza.com — a different restaurant entirely. Sending a
      // customer there is worse than sending them nowhere, so flag it loudly.
      offDomainRedirect = endHost;
    }

    const html = await res.text();
    const text = visibleText(html);

    // Bot challenge: the site is alive, we just aren't allowed in as a script.
    if (isBotChallenge(html, res.headers)) {
      return verdict(clean, 'inconclusive', 'bot-protection challenge, needs browser check', base);
    }
    // HTTP 202 + meta-refresh is the classic "hold on, verifying you" interstitial.
    if (status === 202 && /http-equiv=["']refresh/i.test(html)) {
      return verdict(clean, 'inconclusive', 'interstitial redirect (HTTP 202), needs browser check', base);
    }
    // Parked-domain lander.
    if (PARKING_REDIRECT_PATTERNS.some((p) => p.test(html))) {
      return verdict(clean, 'dead', 'redirects to a domain-parking lander', base);
    }

    // If the venue names itself on the page, it's real. Stop here.
    const name = (opts.expectName || '').trim().toLowerCase();
    const nameOnPage = name.length > 3 && text.includes(name);
    if (nameOnPage) {
      return verdict(clean, 'healthy', 'venue name present on page', base);
    }

    // Landed on someone else's domain and this venue is nowhere on the page.
    if (offDomainRedirect) {
      return verdict(
        clean, 'dead',
        `redirects to ${offDomainRedirect}, which does not mention "${opts.expectName}" — domain likely changed hands`,
        base,
      );
    }

    const hit = PLACEHOLDER_PATTERNS.find((p) => p.test(text));
    if (hit) {
      // "page not found"-style copy inside an otherwise full site is usually a
      // stray nav string, not a placeholder. Require a thin page to condemn.
      const thin = text.length < 1200;
      return thin
        ? verdict(clean, 'placeholder', `placeholder page: /${hit.source}/`, base)
        : verdict(clean, 'inconclusive', `matched /${hit.source}/ on a full page, needs browser check`, base);
    }

    if (text.length < 200) {
      // Empty text can mean parked, client-rendered, or challenged. Only a page
      // that is thin in BOTH markup and text is safe to call a placeholder —
      // a big HTML payload with no text is a JS app, not a parked domain.
      if (looksLikeAppShell(html) || html.length >= 1500) {
        return verdict(clean, 'inconclusive', `no server-rendered text (${html.length} bytes html), needs browser check`, base);
      }
      return verdict(clean, 'placeholder', `near-empty page (${text.length} chars of text, ${html.length} bytes html)`, base);
    }

    return verdict(clean, 'healthy', `HTTP ${status}`, base);
  } catch (e: any) {
    const msg = String(e?.cause?.code || e?.cause?.message || e?.message || 'request failed');

    // A certificate that a browser refuses is a broken link for a customer,
    // full stop. This is the columbiaroomdc.com failure mode.
    if (/cert|ssl|tls|self-signed|self signed/i.test(msg)) {
      return verdict(clean, 'dead', `TLS/certificate failure (${msg})`);
    }
    if (/enotfound|eai_again|dns/i.test(msg)) {
      return verdict(clean, 'dead', `DNS does not resolve (${msg})`);
    }
    if (/econnrefused/i.test(msg)) {
      return verdict(clean, 'dead', `connection refused (${msg})`);
    }
    // Egress proxy / tunnel failures say something about OUR network, not the
    // venue's site. Never quarantine on these.
    if (/tunnel|proxy|err_tunnel|epipe|econnreset/i.test(msg)) {
      return verdict(clean, 'inconclusive', `network/proxy error on our side (${msg})`);
    }
    clearTimeout(timer);
    if (/abort|timeout|timed out|und_err_connect_timeout|econnreset|socket/i.test(msg)) {
      return retry(`unreachable on two attempts (${msg})`);
    }
    return retry(`request failed twice (${msg})`);
  } finally {
    clearTimeout(timer);
  }
}

/** Only a confident failure pulls a venue. Uncertainty leaves it in rotation. */
export function isUsable(h: LinkHealth | undefined): boolean {
  if (!h) return true;
  return h.verdict !== 'dead' && h.verdict !== 'placeholder';
}

/** Verdicts that a human (or a browser pass) should look at. */
export function needsReview(h: LinkHealth): boolean {
  return h.verdict === 'inconclusive';
}

/** Bounded-concurrency map so an audit of 160 links doesn't open 160 sockets. */
export async function checkAll<T>(
  items: T[],
  toUrl: (item: T) => string,
  opts: CheckOptions & { concurrency?: number } = {},
): Promise<Map<T, LinkHealth>> {
  const concurrency = opts.concurrency ?? 8;
  const out = new Map<T, LinkHealth>();
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const item = items[i++];
      out.set(item, await checkLink(toUrl(item), opts));
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return out;
}
