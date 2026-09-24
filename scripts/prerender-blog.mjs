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
 * entry point) and writes a standalone dist/blog/<slug>/index.html with that
 * post's own <title>, meta description, og:*, twitter:*, canonical link, and
 * BlogPosting / BreadcrumbList / FAQPage JSON-LD. Titles and descriptions come
 * from src/lib/seo.ts (shared with the app). Vercel serves static files before
 * applying rewrites, so these win over the generic /blog/:slug -> / rewrite
 * automatically. The browser still boots the full SPA on top exactly as before.
 *
 * The homepage-only Service and FAQPage JSON-LD are stripped from every page
 * written here (they describe the homepage, not an article).
 *
 * Same philosophy as prerender.mjs: fail the build loudly rather than
 * silently ship a page missing its own metadata.
 */

import {
  makeFail, loadSiteData, loadRenderer, readShell, setHead, stripHomeSchema, addJsonLd,
  breadcrumbLd, injectRoot, escapeHtml, toIsoDate, readViteManifest, modulePreloadTags, writePage,
} from './seo-lib.mjs';

const fail = makeFail('prerender-blog');
const site = await loadSiteData();
const { SITE_URL, BLOG_POSTS, IMAGE_META } = site;
if (!Array.isArray(BLOG_POSTS) || BLOG_POSTS.length === 0) fail('could not load BLOG_POSTS from src/data/blogPosts.ts');

const render = await loadRenderer(fail);
const baseTemplate = readShell(fail);
const manifest = readViteManifest();
const MIN_HTML_BYTES = 4000;
const ORG_REF = { '@id': SITE_URL + '/#organization' };

function h1Count(html) {
  return (html.match(/<h1[\s>]/g) || []).length;
}

let count = 0;
const seen = new Set();
for (const post of BLOG_POSTS) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    fail(`slug "${post.slug}" is not a clean URL slug (lowercase letters, numbers and single hyphens only).`);
  }
  if (seen.has(post.slug)) fail(`duplicate slug "${post.slug}".`);
  seen.add(post.slug);

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`;
  const dims = IMAGE_META[post.image];
  const description = site.clampDescription(post.summary);
  const published = toIsoDate(post.date);

  let html = setHead(baseTemplate, {
    title: site.postSeoTitle(post),
    ogTitle: post.title,
    description,
    robots: site.INDEX_ROBOTS,
    url: postUrl,
    ogType: 'article',
    image: { url: imageUrl, alt: post.title, width: dims && dims.w, height: dims && dims.h },
  }, fail);
  html = stripHomeSchema(html);
  if (published) {
    html = html.replace('</head>', `<meta property="article:published_time" content="${published}" />\n</head>`);
  }

  const blocks = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image: [imageUrl],
      datePublished: published || undefined,
      dateModified: published || undefined,
      author: { '@type': 'Organization', name: post.author, url: SITE_URL + '/' },
      publisher: ORG_REF,
      articleSection: post.category,
      inLanguage: 'en-US',
      url: postUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    },
    // Home > Journal > Article, eligible for the breadcrumb trail Google
    // shows in place of a raw URL.
    breadcrumbLd(SITE_URL, [
      { name: 'Home', url: SITE_URL + '/' },
      { name: 'Journal', url: SITE_URL + '/blog' },
      { name: post.title, url: postUrl },
    ]),
  ];
  if (Array.isArray(post.faqs) && post.faqs.length > 0) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }
  html = addJsonLd(html, blocks);

  const preload = modulePreloadTags(manifest, ['src/components/BlogPostPage.tsx']);
  if (preload) html = html.replace('</head>', preload + '\n</head>');

  // Server-render the real article into the root div so non-JS crawlers
  // get actual content, not just a title tag.
  let appHtml;
  try {
    appHtml = render(`/blog/${post.slug}`);
  } catch (err) {
    fail(`SSR threw for "${post.slug}".\n  ${err && err.stack ? err.stack : err}`);
  }
  // React escapes text nodes (e.g. "&" -> "&amp;"), so compare against an
  // HTML-escaped version of the title rather than the raw string.
  const titleMatches = appHtml.includes(post.title) || appHtml.includes(escapeHtml(post.title)) ||
    appHtml.includes(post.title.replace(/'/g, '&#x27;'));
  if (typeof appHtml !== 'string' || appHtml.length < MIN_HTML_BYTES || !titleMatches) {
    fail(`SSR output for "${post.slug}" was too small or missing its title, so the page would have shipped homepage content instead of the article.`);
  }
  if (h1Count(appHtml) !== 1) console.warn(`[prerender-blog] warning: /blog/${post.slug} has ${h1Count(appHtml)} <h1> tags (expected 1).`);
  html = injectRoot(html, appHtml, fail, post.slug);

  writePage(`/blog/${post.slug}`, html);
  count += 1;
}

// --- /blog hub page ---
// The homepage prerender always renders the "stories" tab, so no crawler
// ever saw a link to a single article. This emits dist/blog/index.html with
// the Journal tab server-rendered, giving Google a real crawl path:
// homepage -> /blog -> every post.
{
  const hub = site.BLOG_INDEX_SEO;
  const hubUrl = SITE_URL + '/blog';
  let hubHtml = setHead(baseTemplate, {
    title: hub.title,
    description: hub.description,
    robots: site.INDEX_ROBOTS,
    url: hubUrl,
  }, fail);
  hubHtml = stripHomeSchema(hubHtml);
  hubHtml = addJsonLd(hubHtml, [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'The Plan Glee Journal',
      description: hub.description,
      url: hubUrl,
      inLanguage: 'en-US',
      publisher: ORG_REF,
      blogPost: BLOG_POSTS.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        description: site.clampDescription(p.summary),
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: toIsoDate(p.date) || undefined,
        author: { '@type': 'Organization', name: p.author },
      })),
    },
    breadcrumbLd(SITE_URL, [
      { name: 'Home', url: SITE_URL + '/' },
      { name: 'Journal', url: hubUrl },
    ]),
  ]);
  const preload = modulePreloadTags(manifest, ['src/components/BlogSection.tsx']);
  if (preload) hubHtml = hubHtml.replace('</head>', preload + '\n</head>');

  let hubApp;
  try {
    hubApp = render('/blog');
  } catch (err) {
    fail('failed to render the /blog hub.\n  ' + (err && err.stack ? err.stack : err));
  }
  if (typeof hubApp !== 'string' || hubApp.length < MIN_HTML_BYTES) {
    fail('/blog hub rendered only ' + (hubApp ? hubApp.length : 0) + ' bytes.');
  }
  // The whole point is the outbound links. If they are absent the hub is
  // useless, so fail loudly rather than ship another orphan page.
  const linkCount = (hubApp.match(/href="\/blog\//g) || []).length;
  if (linkCount < BLOG_POSTS.length) {
    fail('/blog hub rendered ' + linkCount + ' article links for ' + BLOG_POSTS.length + ' posts.');
  }
  if (h1Count(hubApp) !== 1) console.warn(`[prerender-blog] warning: /blog has ${h1Count(hubApp)} <h1> tags (expected 1).`);
  hubHtml = injectRoot(hubHtml, hubApp, fail, '/blog');
  writePage('/blog', hubHtml);
  console.log(`[prerender-blog] OK. Wrote /blog hub with ${linkCount} article links.`);
}

console.log(`\n[prerender-blog] OK. Wrote ${count} static blog pages with per-article meta/JSON-LD to dist/blog/<slug>/index.html\n`);
