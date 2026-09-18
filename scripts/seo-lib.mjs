/**
 * Shared helpers for the build-time prerender scripts.
 *
 * Page metadata itself lives in src/lib/seo.ts (also used by the app), so
 * titles and descriptions have one source of truth. This file only knows how
 * to load that data at build time and how to rewrite the HTML shell.
 *
 * Philosophy (same as the original prerender scripts): fail the build loudly
 * rather than silently ship a page with the wrong metadata.
 */

import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { pathToFileURL } from 'node:url';

export const ROOT = process.cwd();
export const DIST = path.join(ROOT, 'dist');
export const SSR_ENTRY = path.join(ROOT, 'dist-ssr/entry-server.js');
export const SHELL_PATH = path.join(ROOT, 'dist-ssr/.shell.html');
export const ROOT_DIV = '<div id="root"></div>';

export function makeFail(tag) {
  return function fail(msg) {
    console.error('\n[' + tag + '] BUILD FAILED: ' + msg + '\n');
    process.exit(1);
  };
}

/** Load src/lib/seo.ts, the blog posts and the image map from TypeScript source. */
export async function loadSiteData() {
  const out = esbuild.buildSync({
    stdin: {
      contents:
        "export * from './src/lib/seo.ts';\n" +
        "export { BLOG_POSTS } from './src/data/blogPosts.ts';\n" +
        "export { IMAGE_META } from './src/data/imageMeta.ts';\n",
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'error',
  });
  const tmp = path.join(ROOT, 'dist-ssr', '.site-data.' + process.pid + '.mjs');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, out.outputFiles[0].text);
  try {
    return await import(pathToFileURL(tmp).href);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

/** Import the SSR bundle and load every code-split screen so render() is complete. */
export async function loadRenderer(fail) {
  if (!fs.existsSync(SSR_ENTRY)) fail('missing ' + SSR_ENTRY + '. Run the SSR build first.');
  const mod = await import(pathToFileURL(SSR_ENTRY).href);
  if (typeof mod.preloadAll !== 'function') fail('dist-ssr/entry-server.js does not export preloadAll().');
  await mod.preloadAll();
  return mod.render;
}

export function readShell(fail) {
  if (!fs.existsSync(SHELL_PATH)) {
    fail('missing ' + SHELL_PATH + '. scripts/prerender.mjs must run first and save the shell.');
  }
  const shell = fs.readFileSync(SHELL_PATH, 'utf-8');
  if (!shell.includes(ROOT_DIV)) fail('the saved shell has no empty root div.');
  if (!/^<!doctype html>/i.test(shell.trimStart())) {
    fail('the HTML shell does not start with <!doctype html>. Without it browsers run in quirks mode and parse every <head> tag into <body>, where Google ignores canonical/robots/description.');
  }
  return shell;
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// post.date is display copy like "AUGUST 2026". Schema.org dates must be ISO 8601.
const MONTHS = {
  JANUARY: '01', FEBRUARY: '02', MARCH: '03', APRIL: '04', MAY: '05', JUNE: '06',
  JULY: '07', AUGUST: '08', SEPTEMBER: '09', OCTOBER: '10', NOVEMBER: '11', DECEMBER: '12',
};
export function toIsoDate(raw) {
  const str = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const m = str.toUpperCase().match(/^([A-Z]+)\s+(\d{4})$/);
  if (m && MONTHS[m[1]]) return `${m[2]}-${MONTHS[m[1]]}-01`;
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function replaceRequired(html, re, replacement, fail, label) {
  if (!re.test(html)) fail('template is missing ' + label);
  return html.replace(re, replacement);
}

/**
 * Swap the homepage's head values for a page's own. Every tag must already
 * exist in the shell (index.html); a missing one fails the build.
 */
export function setHead(html, meta, fail) {
  const e = escapeHtml;
  const title = e(meta.title);
  const desc = e(meta.description);
  html = replaceRequired(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, fail, '<title>');
  html = replaceRequired(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${desc}" />`, fail, 'meta description');
  html = replaceRequired(html, /<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${e(meta.robots)}" />`, fail, 'meta robots');
  html = replaceRequired(html, /<link rel="canonical"[^>]*\/?>/i, `<link rel="canonical" href="${e(meta.url)}" />`, fail, 'canonical link');
  html = replaceRequired(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${e(meta.ogType || 'website')}" />`, fail, 'og:type');
  html = replaceRequired(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${e(meta.ogTitle || meta.title)}" />`, fail, 'og:title');
  html = replaceRequired(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`, fail, 'og:description');
  html = replaceRequired(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${e(meta.url)}" />`, fail, 'og:url');
  html = replaceRequired(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${e(meta.ogTitle || meta.title)}" />`, fail, 'twitter:title');
  html = replaceRequired(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${desc}" />`, fail, 'twitter:description');
  if (meta.image) {
    const img = meta.image;
    html = replaceRequired(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${e(img.url)}" />`, fail, 'og:image');
    html = replaceRequired(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${e(img.url)}" />`, fail, 'twitter:image');
    html = replaceRequired(html, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${e(img.alt)}" />`, fail, 'og:image:alt');
    html = replaceRequired(html, /<meta name="twitter:image:alt" content="[^"]*" \/>/, `<meta name="twitter:image:alt" content="${e(img.alt)}" />`, fail, 'twitter:image:alt');
    // Width/height are only emitted when known; stale default dimensions would be wrong.
    html = html.replace(/<meta property="og:image:width" content="[^"]*" \/>\n?/, img.width ? `<meta property="og:image:width" content="${img.width}" />\n` : '');
    html = html.replace(/<meta property="og:image:height" content="[^"]*" \/>\n?/, img.height ? `<meta property="og:image:height" content="${img.height}" />\n` : '');
  }
  return html;
}

/** Remove the homepage-only JSON-LD (Service + FAQPage) from any other page. */
export function stripHomeSchema(html) {
  return html.replace(/<!--[^>]*homepage only[\s\S]*?-->\s*/gi, '')
    .replace(/<script type="application\/ld\+json" id="ld-home-[^"]*">[\s\S]*?<\/script>\s*/g, '');
}

export function addJsonLd(html, blocks) {
  const tags = blocks
    .filter(Boolean)
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`)
    .join('\n');
  return html.replace('</head>', tags + '\n</head>');
}

export function breadcrumbLd(siteUrl, trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: t.url })),
  };
}

export function injectRoot(html, appHtml, fail, label) {
  if (!html.includes(ROOT_DIV)) fail(label + ': no empty root div to fill.');
  return html.replace(ROOT_DIV, '<div id="root">' + appHtml + '</div>');
}

/**
 * <link rel="modulepreload"> tags for the code-split chunk(s) behind a source
 * module, read from Vite's manifest. Lets the browser fetch a route's chunk in
 * parallel with the main bundle instead of after it.
 */
export function modulePreloadTags(manifest, srcKeys) {
  if (!manifest) return '';
  const files = new Set();
  const visit = (key) => {
    const entry = manifest[key];
    if (!entry || files.has(entry.file)) return;
    files.add(entry.file);
    (entry.imports || []).forEach((k) => {
      if (!manifest[k] || manifest[k].isEntry) return;
      visit(k);
    });
  };
  srcKeys.forEach(visit);
  return [...files].map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`).join('\n');
}

export function readViteManifest() {
  const p = path.join(DIST, '.vite', 'manifest.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : null;
}

export function writePage(routePath, html) {
  const dir = routePath === '/' ? DIST : path.join(DIST, routePath.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}
