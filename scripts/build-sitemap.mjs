/**
 * Generates dist/sitemap.xml at build time.
 *
 * The sitemap used to be hand-maintained in public/sitemap.xml and fell
 * behind: ten posts published in September 2026 were never added, so Google
 * had no sitemap entry for them. Now every indexable page in src/lib/seo.ts
 * and every post in src/data/blogPosts.ts is listed automatically.
 * Pages marked noindex are never listed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { DIST, makeFail, loadSiteData, toIsoDate } from './seo-lib.mjs';

const fail = makeFail('sitemap');
const site = await loadSiteData();
const { SITE_URL, BLOG_POSTS, PAGES_LASTMOD } = site;

const urls = [];
const add = (loc, lastmod, changefreq, priority) => urls.push({ loc, lastmod, changefreq, priority });

const pages = [site.HOME_SEO, site.BLOG_INDEX_SEO, ...site.PAGE_SEO];
for (const page of pages) {
  const noindex = (page.robots || '').includes('noindex');
  if (noindex || !page.sitemap) continue;
  let lastmod = PAGES_LASTMOD;
  if (page.path === '/blog') {
    // The hub changes whenever a post is published.
    const newest = BLOG_POSTS.map((p) => toIsoDate(p.date)).filter(Boolean).sort().pop();
    if (newest && newest > lastmod) lastmod = newest;
  }
  add(SITE_URL + (page.path === '/' ? '/' : page.path), lastmod, page.sitemap.changefreq, page.sitemap.priority);
}
for (const post of BLOG_POSTS) {
  const lastmod = toIsoDate(post.date);
  if (!lastmod) fail(`post "${post.slug}" has a date Google cannot read: "${post.date}".`);
  add(`${SITE_URL}/blog/${post.slug}`, lastmod, 'monthly', 0.8);
}

const locs = new Set(urls.map((u) => u.loc));
if (locs.size !== urls.length) fail('duplicate URLs in the sitemap.');
for (const u of urls) {
  const rel = u.loc.replace(SITE_URL, '') || '/';
  const file = rel === '/' ? path.join(DIST, 'index.html') : path.join(DIST, rel.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) fail(`${u.loc} is in the sitemap but ${path.relative(process.cwd(), file)} was not built.`);
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- Generated at build time by scripts/build-sitemap.mjs. Do not edit by hand. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`
  ).join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);

// Vite's manifest was only needed for the modulepreload hints; don't deploy it.
fs.rmSync(path.join(DIST, '.vite'), { recursive: true, force: true });

console.log(`[sitemap] OK. dist/sitemap.xml lists ${urls.length} URLs.\n`);
