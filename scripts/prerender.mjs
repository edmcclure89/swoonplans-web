/**
 * Build-time prerenderer.
 *
 * Runs after "vite build" (client) and "vite build --ssr" (server bundle).
 * Renders <App /> to HTML and injects it into dist/index.html so the content
 * is present in the raw server response for crawlers that do not execute
 * JavaScript.
 *
 * Deliberately strict: if the render produces suspiciously little HTML it
 * FAILS THE BUILD rather than silently shipping an empty shell again. A silent
 * regression here is invisible in the browser and catastrophic for AI search.
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadRenderer } from './seo-lib.mjs';

const DIST = path.resolve('dist');
const SSR_ENTRY = path.resolve('dist-ssr/entry-server.js');
const TEMPLATE = path.join(DIST, 'index.html');
const ROOT_DIV = '<div id="root"></div>';
// Pristine copy of the built shell, saved BEFORE the homepage is injected.
// scripts/prerender-blog.mjs needs a template whose root div is still empty;
// if it reads dist/index.html after this script runs, its own root-div
// replace silently no-ops and every article ships homepage body content.
// Lives in dist-ssr so it is never deployed.
const SHELL_OUT = path.resolve('dist-ssr/.shell.html');

// Content that MUST be present. If any is missing the prerender did not work.
const REQUIRED = ['11.87', '32.50', '197'];
const MIN_HTML_BYTES = 20000;

function fail(msg) {
  console.error('\n[prerender] BUILD FAILED: ' + msg + '\n');
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE)) fail('missing ' + TEMPLATE + '. Run "vite build" first.');
if (!fs.existsSync(SSR_ENTRY)) fail('missing ' + SSR_ENTRY + '. Run the SSR build first.');

const template = fs.readFileSync(TEMPLATE, 'utf-8');
// A missing "!" here once put the whole site in quirks mode: browsers parsed
// every <head> tag into <body>, where Google ignores canonical, robots and
// description. Never again.
if (!/^<!doctype html>/i.test(template.trimStart())) {
  fail('dist/index.html does not start with <!doctype html>. Fix index.html.');
}
if (!template.includes(ROOT_DIV)) {
  fail('could not find the root div in dist/index.html. If the markup changed, update ROOT_DIV.');
}

fs.mkdirSync(path.dirname(SHELL_OUT), { recursive: true });
fs.writeFileSync(SHELL_OUT, template);

let appHtml;
try {
  // loadRenderer() also loads every code-split screen (see src/lib/lazyModules.tsx).
  const render = await loadRenderer(fail);
  appHtml = render('/');
} catch (err) {
  fail('renderToString threw.\n  ' + (err && err.stack ? err.stack : err) +
       '\n\n  Most likely cause: a component touches window, document or' +
       '\n  localStorage during render instead of inside useEffect.');
}

if (typeof appHtml !== 'string' || appHtml.length < MIN_HTML_BYTES) {
  fail('rendered HTML is only ' + (appHtml ? appHtml.length : 0) + ' bytes, expected at least ' +
       MIN_HTML_BYTES + '. The app rendered but produced almost nothing.');
}

let output = template.replace(ROOT_DIV, '<div id="root">' + appHtml + '</div>');

// The hero's first photo is the homepage's LCP element. Preload it (homepage
// only, so other pages don't pay for it) so it starts downloading alongside
// the CSS instead of after the parser reaches it.
const heroSrc = (appHtml.match(/<img[^>]*fetchpriority="high"[^>]*>/gi) || [])
  .map((tag) => (tag.match(/src="([^"]+)"/) || [])[1])
  .find((src) => src && !src.includes('planglee-logo'));
if (heroSrc) {
  output = output.replace('</head>', `<link rel="preload" as="image" href="${heroSrc}" fetchpriority="high">\n</head>`);
} else {
  console.warn('[prerender] note: no hero image found to preload.');
}

const missing = REQUIRED.filter(function (m) { return output.indexOf(m) === -1; });
if (missing.length) {
  fail('these required strings are missing from the prerendered HTML: ' + missing.join(', '));
}

fs.writeFileSync(TEMPLATE, output);

console.log('\n[prerender] OK. dist/index.html is now ' +
            (Buffer.byteLength(output) / 1024).toFixed(1) + ' kB of crawler-readable HTML.');
console.log('[prerender] markers found: ' + REQUIRED.join(', ') + '\n');
