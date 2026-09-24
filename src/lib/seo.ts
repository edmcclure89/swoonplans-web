/**
 * Single source of truth for page titles, descriptions, canonical URLs and
 * indexing rules. Used in the browser (BlogPostPage) and at build time by
 * scripts/prerender-pages.mjs, scripts/prerender-blog.mjs and
 * scripts/build-sitemap.mjs, so what Google sees in the raw HTML and what the
 * app sets after load can never drift apart.
 *
 * Copy rules: no em dashes, titles aim for 60 characters or fewer (Google
 * truncates around there), descriptions 160 or fewer, and only claims the
 * product actually delivers.
 */

export const SITE_URL = 'https://www.planglee.com';
export const SITE_NAME = 'Plan Glee';

export const DEFAULT_OG_IMAGE = {
  path: '/images/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Plan Glee: custom date, self-care and family plans. First plan free.',
};

/** Bump when a page's content changes meaningfully; feeds <lastmod> in the sitemap. */
export const PAGES_LASTMOD = '2026-09-18';

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** Defaults to "index, follow, max-image-preview:large". */
  robots?: string;
  /** Breadcrumb label; omit for pages that should not get BreadcrumbList data. */
  breadcrumb?: string;
  /** Omit to keep the page out of the sitemap (always omit for noindex pages). */
  sitemap?: { changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'; priority: number };
}

export const INDEX_ROBOTS = 'index, follow, max-image-preview:large';
export const NOINDEX_ROBOTS = 'noindex, follow';

export const HOME_SEO: PageSeo = {
  path: '/',
  title: 'Plan Glee | Custom Date, Self-Care & Family Plans',
  description:
    'Custom date plans for him, self-care itineraries for her, and kid activity plans, all in 90 seconds, with real venues and zero guesswork. First plan free.',
  sitemap: { changefreq: 'weekly', priority: 1.0 },
};

export const BLOG_INDEX_SEO: PageSeo = {
  path: '/blog',
  title: 'The Plan Glee Journal: Date, Self-Care & Family Guides',
  description:
    'Guides on planning better dates, self-care days and kid activities, with real venues across DC, Alexandria, Arlington and beyond.',
  breadcrumb: 'Journal',
  sitemap: { changefreq: 'weekly', priority: 0.9 },
};

/** Standalone routes other than the homepage and the blog. */
export const PAGE_SEO: PageSeo[] = [
  {
    path: '/kid-plans',
    title: 'Kid Plans: Weekend Activities for Kids 0 to 18 | Plan Glee',
    description:
      "Answer 12 quick questions about your child's personality, not just their age, and get weekend activity ideas that fit how they like to spend time. Ages 0 to 18.",
    breadcrumb: 'Kid Plans',
    sitemap: { changefreq: 'monthly', priority: 0.8 },
  },
  {
    path: '/swoon-type',
    title: 'Swoon Type Quiz: Find Your Date Night Type | Plan Glee',
    description:
      'Take the 12-question Swoon Type quiz to find your date night type, a blend of your vibe, pace and energy, then share it with the person who plans your dates.',
    breadcrumb: 'Swoon Type Quiz',
    sitemap: { changefreq: 'monthly', priority: 0.7 },
  },
  {
    path: '/terms',
    title: 'Terms of Service | Plan Glee',
    description:
      'The terms that govern your use of Plan Glee, including accounts, plans, billing and cancellation, and third-party venues and reservations.',
    breadcrumb: 'Terms of Service',
    sitemap: { changefreq: 'yearly', priority: 0.3 },
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Plan Glee',
    description: 'How Plan Glee collects, uses and protects your information.',
    breadcrumb: 'Privacy Policy',
    sitemap: { changefreq: 'yearly', priority: 0.3 },
  },
  // Account and post-checkout screens: useful to customers, useless in search.
  {
    path: '/welcome',
    title: "You're In | Plan Glee",
    description: 'Your Plan Glee purchase is confirmed.',
    robots: NOINDEX_ROBOTS,
  },
  {
    path: '/register',
    title: 'Who Are We Planning For? | Plan Glee',
    description: 'Set up who Plan Glee is planning for.',
    robots: NOINDEX_ROBOTS,
  },
];

const TITLE_MAX = 62;
const BRAND_SUFFIX = ' | Plan Glee';

/**
 * Search-result title for an article. Uses the explicit seoTitle when set,
 * otherwise the headline, shortened only when it would be truncated: drop a
 * trailing "(...)" aside, then fall back to the part before the colon.
 */
export function postSeoTitle(post: { title: string; seoTitle?: string }): string {
  const withBrand = (t: string) => (t.length + BRAND_SUFFIX.length <= TITLE_MAX ? t + BRAND_SUFFIX : t);
  if (post.seoTitle) return withBrand(post.seoTitle);
  const title = post.title.trim();
  if (title.length <= TITLE_MAX) return withBrand(title);
  const noAside = title.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (noAside.length <= TITLE_MAX) return withBrand(noAside);
  const beforeColon = title.split(':')[0].trim();
  if (beforeColon !== title && beforeColon.length >= 20) return withBrand(beforeColon);
  return title;
}

/** Keep meta descriptions inside the ~160 characters Google shows, cutting on a word. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '…';
}
