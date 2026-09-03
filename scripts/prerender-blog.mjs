/**
 * Per-article blog prerenderer.
 *
 * WHY THIS EXISTS
 * ----------------
 * vercel.json rewrites every /blog/:slug request to the SAME dist/index.html.
 * That file carries one set of og:title / og:description / og:image tags
 * (the homepage's). Any scraper that reads raw HTML without executing JS
 * (Slack unfurls, iMessage previews, some Facebook/LinkedIn crawlers, AI
 * search bots) sees the homepage's preview card for every article link,
 * never the article's own title, summary, or image.
 *
 * This script runs after scripts/prerender.mjs. For every post in
 * src/data/blogPosts.ts it renders that post's real page (via the SSR
 * entry point, now route-aware — see src/entry-server.tsx) and writes a
 * standalone dist/blog/<slug>/index.html with that post's own <title>,
 * meta description, og:*, twitter:*, canonical link, and Article/FAQPage
 * JSON-LD. Vercel serves static files before applying rewrites, so these
 * win over the generic /blog/:slug -> / rewrite automatically — no
 * vercel.json change required. The browser still hydrates the full SPA on
 * top exactly as before.
 *
 * Same philosophy as prerender.mjs: fail the build loudly rather than
 * silently ship a page missing its own metadata.
 */

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SSR_ENTRY = path.join(ROOT, 'dist-ssr/entry-server.js');
const TEMPLATE_PATH = path.join(DIST, 'index.html');
const ROOT_DIV = '<div id="root"></div>';
const SITE_URL = 'https://www.makeherswoon.com';
const MIN_HTML_BYTES = 4000;

function fail(msg) {
  console.error('\n[prerender-blog] BUILD FAILED: ' + msg + '\n');
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE_PATH)) fail('missing ' + TEMPLATE_PATH + '. Run "vite build" first.');
if (!fs.existsSync(SSR_ENTRY)) fail('missing ' + SSR_ENTRY + '. Run the SSR build first.');

// --- Load BLOG_POSTS out of the TS source without a full app build ---
const blogPostsSrc = path.join(ROOT, 'src/data/blogPosts.ts');
const bundled = esbuild.buildSync({
  entryPoints: [blogPostsSrc],
  bundle: false,
  write: false,
  format: 'esm',
  loader: { '.ts': 'ts' },
});
const tmpDataFile = path.join(ROOT, 'scripts/.blogPosts.tmp.mjs');
fs.writeFileSync(tmpDataFile, bundled.outputFiles[0].text);
let BLOG_POSTS;
try {
  const mod = await import(pathToFileURL(tmpDataFile).href + '?t=' + Date.now());
  BLOG_POSTS = mod.BLOG_POSTS;
} finally {
  fs.rmSync(tmpDataFile, { force: true });
}
if (!Array.isArray(BLOG_POSTS) || BLOG_POSTS.length === 0) {
  fail('could not load BLOG_POSTS from src/data/blogPosts.ts');
}

const { render } = await import(pathToFileURL(SSR_ENTRY).href);
const baseTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// post.date is display copy like "AUGUST 2026". Schema.org datePublished
// requires ISO 8601, and Google discards the field otherwise.
const MONTHS = {
  JANUARY: '01', FEBRUARY: '02', MARCH: '03', APRIL: '04',
  MAY: '05', JUNE: '06', JULY: '07', AUGUST: '08',
  SEPTEMBER: '09', OCTOBER: '10', NOVEMBER: '11', DECEMBER: '12',
};

function toIsoDate(raw) {
  const str = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const m = str.toUpperCase().match(/^([A-Z]+)\s+(\d{4})$/);
  if (m && MONTHS[m[1]]) return `${m[2]}-${MONTHS[m[1]]}-01`;
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function replaceMeta(html, selectorRegex, newContentAttr) {
  if (!selectorRegex.test(html)) {
    fail('template is missing an expected tag matching ' + selectorRegex);
  }
  return html.replace(selectorRegex, newContentAttr);
}

let count = 0;
for (const post of BLOG_POSTS) {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`;
  const pageTitle = `${post.title} | Swoon Plans Journal`;
  const description = post.summary;

  let html = baseTemplate;

  html = replaceMeta(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  html = replaceMeta(
    html,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = replaceMeta(
    html,
    /<meta property="og:type" content="[^"]*" \/>/,
    `<meta property="og:type" content="article" />`
  );
  html = replaceMeta(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(post.title)}" />`
  );
  html = replaceMeta(
    html,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = replaceMeta(
    html,
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(post.title)}" />`
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = replaceMeta(
    html,
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
  );

  // Canonical link, added once, right before </head>.
  const canonicalTag = `<link rel="canonical" href="${postUrl}" />\n`;

  // Article JSON-LD, plus FAQPage JSON-LD when the post has FAQs, so AI
  // search / AEO crawlers get structured per-article data too.
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    image: imageUrl,
    datePublished: toIsoDate(post.date) || undefined,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'Swoon Plans Concierge' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  };
  let jsonLdBlocks = `<script type="application/ld+json">${JSON.stringify(articleLd)}</script>\n`;

  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    const faqLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
    jsonLdBlocks += `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>\n`;
  }

  // The base index.html already carries a homepage canonical. Replace it
// rather than appending, or every post ships two conflicting canonicals
// and Google may treat each article as a duplicate of the homepage.
const CANONICAL_RE = /<link rel="canonical"[^>]*\/?>/i;
if (!CANONICAL_RE.test(html)) {
  fail('template is missing a <link rel="canonical"> tag to replace.');
}
html = html.replace(CANONICAL_RE, canonicalTag.trim());

html = html.replace('</head>', jsonLdBlocks + '</head>');

  // Server-render the real article into the root div so non-JS crawlers
  // get actual content, not just a title tag. Falls back to the homepage
  // shell (already present in baseTemplate) if SSR of this route throws,
  // rather than failing the whole build over one post.
  try {
    const appHtml = render(`/blog/${post.slug}`);
    // React escapes text nodes (e.g. "&" -> "&amp;"), so compare against an
    // HTML-escaped version of the title rather than the raw string.
    const titleMatches = appHtml.includes(post.title) || appHtml.includes(escapeHtml(post.title));
    if (typeof appHtml === 'string' && appHtml.length >= MIN_HTML_BYTES && titleMatches) {
      html = html.replace(ROOT_DIV, '<div id="root">' + appHtml + '</div>');
    } else {
      console.warn(`[prerender-blog] warning: SSR output for "${post.slug}" looked too small, keeping shell.`);
    }
  } catch (err) {
    console.warn(`[prerender-blog] warning: SSR threw for "${post.slug}", keeping shell.\n  ${err}`);
  }

  const outDir = path.join(DIST, 'blog', post.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  count += 1;
}

// --- /blog hub page ---
// The homepage prerender always renders the "stories" tab, so no crawler
// ever saw a link to a single article. This emits dist/blog/index.html with
// the Journal tab server-rendered, giving Google a real crawl path:
// homepage -> /blog -> every post.
try {
  let hubHtml = baseTemplate;
  const hubTitle = 'The Swoon Plans Journal: Date Night Ideas, Guides and Playbooks';
  const hubDesc =
    'Guides on planning better dates, self-care days and kid activities, ' +
    'with real venues across DC, Alexandria, Arlington and beyond.';
  const hubUrl = SITE_URL + '/blog';

  hubHtml = replaceMeta(hubHtml, /<title>[^<]*<\/title>/, `<title>${escapeHtml(hubTitle)}</title>`);
  hubHtml = replaceMeta(
    hubHtml,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(hubDesc)}" />`
  );
  hubHtml = replaceMeta(
    hubHtml,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(hubTitle)}" />`
  );
  hubHtml = replaceMeta(
    hubHtml,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(hubDesc)}" />`
  );

  const HUB_CANONICAL_RE = /<link rel="canonical"[^>]*\/?>/i;
  if (!HUB_CANONICAL_RE.test(hubHtml)) {
    fail('template is missing a canonical tag for the /blog hub.');
  }
  hubHtml = hubHtml.replace(HUB_CANONICAL_RE, `<link rel="canonical" href="${hubUrl}" />`);

  const hubApp = render('/blog');
  if (typeof hubApp !== 'string' || hubApp.length < MIN_HTML_BYTES) {
    fail('/blog hub rendered only ' + (hubApp ? hubApp.length : 0) + ' bytes.');
  }
  // The whole point is the outbound links. If they are absent the hub is
  // useless, so fail loudly rather than ship another orphan page.
  const linkCount = (hubApp.match(/href="\/blog\//g) || []).length;
  if (linkCount < 2) {
    fail('/blog hub rendered without article links (found ' + linkCount + ').');
  }
  hubHtml = hubHtml.replace(ROOT_DIV, '<div id="root">' + hubApp + '</div>');

  const hubDir = path.join(DIST, 'blog');
  fs.mkdirSync(hubDir, { recursive: true });
  fs.writeFileSync(path.join(hubDir, 'index.html'), hubHtml);
  console.log(`[prerender-blog] OK. Wrote /blog hub with ${linkCount} article links.`);
} catch (err) {
  fail('failed to build the /blog hub page.\n  ' + (err && err.stack ? err.stack : err));
}

console.log(`\n[prerender-blog] OK. Wrote ${count} static blog pages with per-article OG/meta/JSON-LD to dist/blog/<slug>/index.html\n`);
