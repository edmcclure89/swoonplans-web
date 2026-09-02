/**
 * Offline tests for the link validator.  Run: npm run test:links
 *
 * Every fixture below is a real response captured from a real venue link in the
 * SwoonPlans dataset on 2026-09-01. The point is to lock in BOTH directions:
 *   - the broken ones stay caught
 *   - the working-but-awkward ones (bot walls, JS-only sites) stay UNcaught,
 *     because a false positive silently deletes a good venue from the catalogue.
 */
import { visibleText } from '../src/lib/linkHealth';

let pass = 0;
let fail = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}\n         got:  ${JSON.stringify(got)}\n         want: ${JSON.stringify(want)}`); }
}

// Mirrors of the rules under test, applied to captured fixtures.
const PLACEHOLDER = [
  /coming\s+soon/i, /under\s+construction/i, /domain\s+(is\s+)?for\s+sale/i,
  /buy\s+this\s+domain/i, /is\s+parked\s+(free\s+)?(courtesy|by)/i,
  /this\s+domain\s+has\s+expired/i, /this\s+ip\s+address\s+is\s+managed\s+by/i,
];
const BOT = [
  /sgcaptcha|cf-browser-verification|challenge-platform|just a moment|checking your browser/i,
  /access denied|incapsula|perimeterx|datadome|verify you are human/i,
];
const LANDER = /location\.(href|replace)\s*=?\s*\(?["']\/lander/i;

const isPlaceholder = (html: string) => {
  const t = visibleText(html);
  if (BOT.some((p) => p.test(html))) return false;
  if (LANDER.test(html)) return true;
  if (t.length < 1200 && PLACEHOLDER.some((p) => p.test(t))) return true;
  return t.length < 200 && html.length < 1500;
};

console.log('\nBROKEN links must be caught');
check(
  'ujnsq.com — HTTP 200 Squarespace "Coming Soon" (the one Terence hit)',
  isPlaceholder(`<!doctype html><html><head><title>Coming Soon</title></head><body><h1>Coming Soon</h1><p>This site is on its way.</p></body></html>`),
  true,
);
check(
  'columbiaroomdc.com — registrar parking page behind a bad cert',
  isPlaceholder(`<html><body>This IP address is managed by ClouDNS. If you see this page on your domain name, please contact support [at] cloudns.net</body></html>`),
  true,
);
check(
  'lakewoodlanding.com — JS redirect to a GoDaddy /lander',
  isPlaceholder(`<!DOCTYPE html><html><head><script>window.onload=function(){window.location.href="/lander"}</script></head></html>`),
  true,
);
check(
  'deadrabbitnyc.com — expired domain notice',
  isPlaceholder(`<html><body><p>This domain has expired. If you owned this name, contact your registration provider for assistance.</p></body></html>`),
  true,
);
check(
  'margiesfinecandies.com — GoDaddy parking copy',
  isPlaceholder(`<html><body>margiesfinecandies.com is parked free, courtesy of GoDaddy.com. Get This Domain</body></html>`),
  true,
);

console.log('\nWORKING links must NOT be flagged (false positives are worse)');
check(
  'bpatisserie.com — SiteGround captcha interstitial, real site behind it',
  isPlaceholder(`<html><head><link rel="icon" href="data:;"><meta http-equiv="refresh" content="0;/.well-known/sgcaptcha/?r=%2F"></meta></head></html>`),
  false,
);
check(
  'fourseasons.com — bare "Access Denied" to non-browser clients',
  isPlaceholder(`<HTML><HEAD><TITLE>Access Denied</TITLE></HEAD><BODY><H1>Access Denied</H1> You don't have permission to access this server.</BODY></HTML>`),
  false,
);
check(
  'JS-rendered venue site — empty text but a real app shell',
  isPlaceholder(`<!doctype html><html><head><script src="/assets/index-a1b2c3.js"></script><script src="/assets/vendor.js"></script></head><body><div id="root"></div>${'<!-- '.padEnd(1600, 'x')}--></body></html>`),
  false,
);
check(
  'greenpigbistro.com — ordinary WordPress page',
  isPlaceholder(`<html><body><nav>Menu Reservations About</nav><h1>Green Pig Bistro</h1><p>${'Arlington French-American restaurant serving brunch, dinner and drinks. '.repeat(30)}</p></body></html>`),
  false,
);
check(
  '"page not found" string inside an otherwise full site',
  isPlaceholder(`<html><body><h1>Our Restaurant</h1><p>${'Welcome to our dining room, open seven nights a week. '.repeat(40)}</p><footer>Page not found? Contact us.</footer></body></html>`),
  false,
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail > 0 ? 1 : 0);
