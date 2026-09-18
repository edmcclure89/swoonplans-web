/**
 * Prerender every standalone route that is not the homepage or the blog:
 * /kid-plans, /swoon-type, /terms, /privacy, /welcome, /register.
 *
 * WHY THIS EXISTS
 * ---------------
 * vercel.json rewrites these paths to the homepage's index.html, so before
 * this script every one of them shipped the HOMEPAGE's title, description,
 * body and a canonical pointing at "/". Google treated them all as copies of
 * the homepage, and /welcome and /register (post-checkout and account screens)
 * were indexable.
 *
 * For each route in PAGE_SEO (src/lib/seo.ts) this writes
 * dist/<route>/index.html with that page's own <title>, description,
 * canonical, robots (noindex for account screens), og/twitter tags,
 * BreadcrumbList JSON-LD and server-rendered body. Vercel serves these static
 * files ahead of the rewrites, so no vercel.json change is needed.
 */

import {
  DIST, makeFail, loadSiteData, loadRenderer, readShell, setHead, stripHomeSchema,
  addJsonLd, breadcrumbLd, injectRoot, readViteManifest, modulePreloadTags, writePage,
} from './seo-lib.mjs';

const fail = makeFail('prerender-pages');
const site = await loadSiteData();
const render = await loadRenderer(fail);
const shell = readShell(fail);
const manifest = readViteManifest();

// Source module behind each route's code-split chunk (for modulepreload hints).
const ROUTE_CHUNKS = {
  '/kid-plans': 'src/components/KidPlansConciergeApp.tsx',
  '/swoon-type': 'src/components/SwoonTypeFlow.tsx',
  '/terms': 'src/components/TermsPage.tsx',
  '/privacy': 'src/components/PrivacyPage.tsx',
  '/welcome': 'src/components/WelcomePage.tsx',
  '/register': 'src/components/RegisterPage.tsx',
};

const MIN_BODY_BYTES = 400;
const defaultImage = {
  url: site.SITE_URL + site.DEFAULT_OG_IMAGE.path,
  width: site.DEFAULT_OG_IMAGE.width,
  height: site.DEFAULT_OG_IMAGE.height,
  alt: site.DEFAULT_OG_IMAGE.alt,
};

let written = 0;
for (const page of site.PAGE_SEO) {
  const url = site.SITE_URL + page.path;
  const robots = page.robots || site.INDEX_ROBOTS;
  let html = setHead(shell, { title: page.title, description: page.description, robots, url, image: defaultImage }, fail);
  html = stripHomeSchema(html);

  if (page.breadcrumb && robots.startsWith('index')) {
    html = addJsonLd(html, [
      breadcrumbLd(site.SITE_URL, [
        { name: 'Home', url: site.SITE_URL + '/' },
        { name: page.breadcrumb, url },
      ]),
    ]);
  }

  const preload = modulePreloadTags(manifest, [ROUTE_CHUNKS[page.path]].filter(Boolean));
  if (preload) html = html.replace('</head>', preload + '\n</head>');

  let body;
  try {
    body = render(page.path);
  } catch (err) {
    fail(`SSR threw for "${page.path}".\n  ${err && err.stack ? err.stack : err}`);
  }
  if (typeof body !== 'string' || body.length < MIN_BODY_BYTES) {
    fail(`"${page.path}" rendered only ${body ? body.length : 0} bytes; it would ship an empty page.`);
  }
  // Guard against the old failure mode: a route silently rendering the homepage.
  if (body.includes('Simple Pricing') && page.path !== '/') {
    fail(`"${page.path}" rendered the homepage instead of its own screen. Check the route in src/App.tsx.`);
  }
  html = injectRoot(html, body, fail, page.path);

  writePage(page.path, html);
  written += 1;
  console.log(`[prerender-pages] ${page.path.padEnd(12)} ${robots.startsWith('noindex') ? 'noindex ' : 'index   '} ${page.title}`);
}

console.log(`\n[prerender-pages] OK. Wrote ${written} pages to ${DIST}/<route>/index.html\n`);
