/**
 * Venue link audit.
 *
 *   npm run audit:links                  # fast fetch-based pass, report only
 *   npm run audit:links -- --browser     # also render "inconclusive" links in Chromium
 *   npm run audit:links -- --write       # regenerate src/data/venueLinkStatus.ts
 *
 * Three buckets, and the distinction matters:
 *   BROKEN        confident failure (dead DNS, bad cert, 404, parked page).
 *                 These get quarantined and stop being recommended.
 *   NEEDS REVIEW  could not be judged from a plain fetch — bot protection,
 *                 JS-only rendering, a slow host. Left in rotation on purpose.
 *                 --browser resolves most of these.
 *   HEALTHY       responded and looks like a real venue site.
 *
 * Exits non-zero if anything is BROKEN, so it can gate CI or a deploy.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { METROS, type Venue } from '../src/data/metros';
import { checkLink, visibleText, type LinkHealth } from '../src/lib/linkHealth';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WRITE = process.argv.includes('--write');
const USE_BROWSER = process.argv.includes('--browser');
const CONCURRENCY = 8;

interface Row {
  metroKey: string;
  metroName: string;
  venue: Venue;
  health: LinkHealth;
}

const isBroken = (h: LinkHealth) => h.verdict === 'dead' || h.verdict === 'placeholder';

/**
 * Second pass: render the page in a real browser. This is the only reliable
 * way to tell "blocks bots / renders in JS" apart from "actually gone".
 * Optional by design — skipped cleanly if playwright isn't installed.
 */
async function browserPass(rows: Row[]): Promise<void> {
  const targets = rows.filter((r) => r.health.verdict === 'inconclusive');
  if (targets.length === 0) return;

  let chromium: any;
  try {
    // @ts-ignore optional dependency, resolved at runtime only (see package.json note)
    ({ chromium } = await import('playwright'));
  } catch {
    console.log(`\n(skipping browser pass: playwright not installed — \`npm i -D playwright\` to enable)`);
    return;
  }

  console.log(`\nRe-checking ${targets.length} inconclusive links in a real browser...`);
  // Honour a pinned Chromium if one is provided (CI images often ship their
  // own build that doesn't match playwright's expected revision).
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: false,
  });

  // Dedupe: the same URL can appear in several metros.
  const byUrl = new Map<string, Row[]>();
  for (const r of targets) {
    const u = r.health.url;
    if (!byUrl.has(u)) byUrl.set(u, []);
    byUrl.get(u)!.push(r);
  }

  for (const [url, group] of byUrl) {
    const page = await ctx.newPage();
    let health: LinkHealth;
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(1200); // let client-side rendering land
      const status = resp?.status() ?? 0;
      const html = await page.content();
      const text = visibleText(html);
      const name = group[0].venue.name.toLowerCase();

      if (status === 404 || status === 410) {
        health = { url, verdict: 'dead', status, reason: `HTTP ${status} in browser`, confirmedBy: 'browser' };
      } else if (text.includes(name) || text.length > 600) {
        health = { url, verdict: 'healthy', status, reason: 'renders real content in browser', confirmedBy: 'browser' };
      } else if (/coming soon|under construction|domain is for sale|buy this domain|account has been suspended|this ip address is managed by/.test(text)) {
        health = { url, verdict: 'placeholder', status, reason: 'placeholder confirmed in browser', confirmedBy: 'browser' };
      } else if (/access denied|verify you are human|checking your browser|just a moment|captcha/.test(text)) {
        health = { url, verdict: 'inconclusive', status, reason: 'bot challenge even in browser, needs a human look', confirmedBy: 'browser' };
      } else {
        health = { url, verdict: 'placeholder', status, reason: `renders almost nothing (${text.length} chars)`, confirmedBy: 'browser' };
      }
    } catch (e: any) {
      const msg = String(e?.message || e).split('\n')[0];
      if (/err_cert|cert_authority|cert_common|ssl_protocol/i.test(msg)) {
        // A certificate the browser itself refuses IS a broken link for a customer.
        health = { url, verdict: 'dead', reason: `browser rejected certificate (${msg})`, confirmedBy: 'browser' };
      } else if (/err_name_not_resolved|err_connection_refused/i.test(msg)) {
        health = { url, verdict: 'dead', reason: `host unreachable (${msg})`, confirmedBy: 'browser' };
      } else if (/err_tunnel_connection_failed|err_proxy|err_connection_reset|err_empty_response|timeout/i.test(msg)) {
        // Almost always OUR egress (corporate proxy / CI network), not their site.
        // Four Seasons and Marriott fail exactly this way from a datacentre IP.
        health = { url, verdict: 'inconclusive', reason: `blocked by our network, not verifiable here (${msg})`, confirmedBy: 'browser' };
      } else {
        health = { url, verdict: 'inconclusive', reason: `browser could not load (${msg})`, confirmedBy: 'browser' };
      }
    }
    await page.close();
    for (const r of group) r.health = { ...health, checkedAt: new Date().toISOString() };
  }

  await browser.close();
}

async function main() {
  const jobs: { metroKey: string; metroName: string; venue: Venue }[] = [];
  for (const [metroKey, metro] of Object.entries(METROS)) {
    for (const venue of metro.venues || []) jobs.push({ metroKey, metroName: metro.name, venue });
  }

  console.log(`Checking ${jobs.length} venue links across ${Object.keys(METROS).length} metros...`);

  const cache = new Map<string, Promise<LinkHealth>>();
  const rows: Row[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const url = (job.venue.linkUrl || '').trim();
      if (!cache.has(url)) cache.set(url, checkLink(url, { expectName: job.venue.name, timeoutMs: 12000 }));
      rows.push({ ...job, health: await cache.get(url)! });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (USE_BROWSER) await browserPass(rows);

  const broken = rows.filter((r) => isBroken(r.health));
  const review = rows.filter((r) => r.health.verdict === 'inconclusive');
  const healthy = rows.length - broken.length - review.length;

  const print = (title: string, list: Row[]) => {
    if (!list.length) return;
    console.log(`\n${title}\n${'='.repeat(70)}`);
    const byMetro = new Map<string, Row[]>();
    for (const r of list) {
      if (!byMetro.has(r.metroName)) byMetro.set(r.metroName, []);
      byMetro.get(r.metroName)!.push(r);
    }
    for (const [metroName, items] of byMetro) {
      console.log(`\n${metroName}`);
      for (const r of items) {
        console.log(`  [${r.health.verdict.toUpperCase()}] ${r.venue.name} (${r.venue.type})`);
        console.log(`      ${r.health.url}`);
        console.log(`      ${r.health.reason || ''}`);
      }
    }
  };

  print('BROKEN — quarantined, will not be recommended', broken);
  print('NEEDS REVIEW — left in rotation, could not verify automatically', review);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`healthy: ${healthy}   broken: ${broken.length}   needs review: ${review.length}   total: ${rows.length}`);

  // Quarantining only helps if something is left to pick from.
  for (const [metroKey, metro] of Object.entries(METROS)) {
    for (const type of ['drinks', 'dinner', 'dessert'] as Venue['type'][]) {
      const pool = (metro.venues || []).filter((v) => v.type === type);
      if (!pool.length) continue;
      const ok = pool.filter((v) => !broken.some((b) => b.metroKey === metroKey && b.venue.name === v.name));
      if (ok.length === 0) console.log(`WARNING: ${metro.name} has no healthy "${type}" venue left — add stock before quarantine takes effect.`);
      else if (ok.length === 1) console.log(`NOTE: ${metro.name} is down to 1 healthy "${type}" venue.`);
    }
  }

  if (WRITE) {
    const seen = new Set<string>();
    const unique = broken
      .map((r) => ({
        key: `${r.metroKey}::${r.venue.name}`,
        verdict: r.health.verdict as 'dead' | 'placeholder',
        reason: r.health.reason || '',
        url: r.health.url,
      }))
      .filter((e) => (seen.has(e.key) ? false : (seen.add(e.key), true)))
      .sort((a, b) => a.key.localeCompare(b.key));

    const file = `// GENERATED FILE — do not edit by hand.
// Regenerate with: npm run audit:links -- --browser --write
//
// Venues whose link failed validation with confidence. \`pickVenue\` in
// src/lib/itinerary.ts skips these so they are never recommended, and
// \`venueReservation\` degrades their link to phone + map directions.
//
// Last audit: ${new Date().toISOString()}
// ${rows.length} links checked · ${broken.length} broken · ${review.length} needed manual review.

export interface QuarantinedVenue {
  verdict: 'dead' | 'placeholder';
  reason: string;
  url: string;
}

/** Keyed by \`\${metroKey}::\${venueName}\`. */
export const QUARANTINED_VENUES: Record<string, QuarantinedVenue> = {
${unique.map((e) => `  ${JSON.stringify(e.key)}: { verdict: ${JSON.stringify(e.verdict)}, reason: ${JSON.stringify(e.reason)}, url: ${JSON.stringify(e.url)} },`).join('\n')}
};

export function quarantineKey(metroKey: string, venueName: string): string {
  return \`\${metroKey}::\${venueName}\`;
}

export function isQuarantined(metroKey: string, venueName: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUARANTINED_VENUES, quarantineKey(metroKey, venueName));
}
`;
    const out = resolve(__dirname, '../src/data/venueLinkStatus.ts');
    writeFileSync(out, file, 'utf8');
    console.log(`\nWrote src/data/venueLinkStatus.ts (${unique.length} quarantined).`);
  }

  process.exit(broken.length > 0 ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
