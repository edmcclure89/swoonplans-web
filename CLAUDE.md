# Plan Glee (planglee.com)

Rebranded from SwoonPlans (makeherswoon.com) in Sept 2026. makeherswoon.com still points at
this project. Contact/sender email is still admin@makeherswoon.com until a planglee.com
sender domain is verified in Resend.

AI-powered date-planning concierge app for professional men. Users answer 20 targeted
questions about their partner and get a custom itinerary: real venues, addresses, and
direct reservation links. Brand tone: confident, direct, premium. Visually: bright,
clean, effortless (NOT dark/moody).

## Stack
- React + TypeScript + Tailwind, Vite SPA
- Supabase (auth + database)
- Stripe (payments)
- Vercel (hosting, auto-deploys from `main`)
- Resend (email)

## Deploy pipeline
- Push to `main` on GitHub → Vercel auto-deploys. That's it, no manual Vercel steps.
- Never push directly to Vercel or use a Vercel deploy tool/CLI for this project.
- Vercel project ID: `prj_GCRVYdOUBiVF69EJcEb9FOFFehyN`

## Build
```
npm run build
```
Runs, in order:
1. `vite build` (client; code-split, see "Code splitting" below)
2. SSR build of `src/entry-server.tsx`
3. `scripts/prerender.mjs`: homepage into `dist/index.html` (+ hero image preload)
4. `scripts/prerender-pages.mjs`: `/kid-plans`, `/swoon-type`, `/terms`, `/privacy`,
   `/welcome`, `/register` into `dist/<route>/index.html`, each with its own title,
   description, canonical, robots and body
5. `scripts/prerender-blog.mjs`: `/blog` hub + `dist/blog/<slug>/index.html` per post
   (BlogPosting, BreadcrumbList, FAQPage JSON-LD)
6. `scripts/build-sitemap.mjs`: generates `dist/sitemap.xml` from the pages above and
   every post. Never hand-edit a sitemap; there is no `public/sitemap.xml` any more.

Vercel serves these static files ahead of the rewrites in `vercel.json`. There is
deliberately no `/blog/:slug` rewrite any more: every real post has its own file, so
an unknown slug gets a true 404 (`public/404.html`) instead of a "soft 404" copy of
the homepage.
`App.tsx` accepts an optional `ssrPath` prop so build-time SSR renders the right
route without a real `window.location`.

## SEO rules (read before touching pages, copy or images)
- **Titles, descriptions, robots, canonicals live in `src/lib/seo.ts`**, shared by the
  app and the prerender scripts. New standalone route: add it to `PAGE_SEO` there and
  to the route list in `src/App.tsx`. Account/checkout screens get `NOINDEX_ROBOTS`.
- **`index.html` must start with `<!doctype html>`.** It once said `<doctype html>`
  (missing `!`): browsers ran in quirks mode and parsed the whole `<head>` into
  `<body>`, where Google ignores canonical, robots and description. The build now
  fails if this regresses. Keep the exact meta tag shapes in `index.html`; the
  prerender scripts match on them.
- **Exactly one `<h1>` per page.** The homepage H1 is visually hidden in `App.tsx`
  because the hero headline rotates (it is a styled `<p>`). Section titles are
  `h2`, sub-items `h3`. The prerender scripts warn when a page has 0 or 2+ H1s.
- **JSON-LD**: site-wide Organization + WebSite (`id="ld-site"`) on every page;
  blocks with `id="ld-home-*"` (Service, FAQPage) are homepage-only and are
  stripped from every other page at build time.
- **Images**: every UI image needs `alt` and should go through `responsiveImg()`
  (`src/lib/images.ts`), which adds srcset + width/height from
  `src/data/imageMeta.ts`. New image: add smaller WebP copies named
  `<name>-<width>w.webp` next to it and list it in `imageMeta.ts`.
- **Blog posts** need `pathway` (`swoonHer` | `selfCare` | `kidPlans`; drives the
  end-of-article CTA and related posts) and, if the headline is over ~60
  characters, a shorter `seoTitle`. Slugs must be lowercase-hyphenated (the build
  checks).
- **Code splitting**: quizzes, blog, legal and account screens load on demand via
  `src/lib/lazyModules.tsx`. Import them through `<Lazy k="...">`, never
  statically from `App.tsx`, or Supabase and the venue catalogue end up back in
  the homepage bundle. A screen with its own URL must also be mapped in
  `keysForLocation()` so its chunk loads before first render.
- Caching: `/assets/*` (content-hashed) is immutable for a year; `/images/*` is
  cached a day. Replacing an image in place can show the old one for up to a day.

## Known gotchas
- **Supabase RLS**: an RLS policy alone causes 401s. You need both the RLS policy AND
  a base Postgres `GRANT`, or a `SECURITY DEFINER` RPC function to bypass both.
- **Server-side Supabase writes** (e.g. account creation with `email_confirm: true`)
  require `SUPABASE_SERVICE_ROLE_KEY` in Vercel env. If it's missing, these fail
  silently (non-fatal) — always check the env var first if signups seem to vanish.
- **Copy/brand consistency**: the quiz is 20 questions. This number has drifted to
  "15" in copy multiple times across sessions (blog posts, pricing, terms modal,
  gallery, comments) — grep for "15" near "question" before shipping any copy change
  and fix on sight.
- **Every route is prerendered**, but only routes listed in `src/lib/seo.ts`
  (plus `/` and the blog). If you add a blog post, rerun the full build and
  spot-check `dist/blog/<new-slug>/index.html` has real title/OG tags.
- Two Stripe webhook endpoints existed pointed at `/api/stripe-webhook` (an old one
  with 4 events, a new one with 1) — worth confirming this is cleaned up to one
  before touching payment code, and confirm `STRIPE_WEBHOOK_SECRET` in Vercel env
  matches the current signing secret.

- **Venue links rot, and not as 404s**: venue domains expire and get bought by
  squatters. The failures we have actually seen are a parked IP serving a
  self-signed cert (`columbiaroomdc.com`), an HTTP 200 "Coming Soon" placeholder
  (`ujnsq.com`), GoDaddy for-sale landers, and one domain that now redirects to a
  *different* restaurant (`anticopizza.com` → `desanopizza.com`). A status-code
  check catches none of these. Three layers guard this now:
  1. `src/lib/linkHealth.ts` — the validator. Its `inconclusive` verdict is
     load-bearing: hotel sites return 403 to bots and many venue sites render in
     JS, so only a CONFIDENT failure quarantines a venue. A false positive
     silently deletes a real venue from the catalogue, which is worse.
  2. `src/data/venueLinkStatus.ts` — the quarantine list `pickVenue` reads.
     Regenerate with `npm run audit:links -- --browser --write`. Run it from a
     normal network; a proxied/datacentre IP produces false failures.
  3. `api/send-itinerary.ts` — a send-time re-check. Dead links become "Get
     directions" + the venue phone number rather than a broken button. It never
     blocks the email. Degradations are logged as `[link-guard]` in Vercel logs;
     if a venue shows up there repeatedly, fix the dataset.
  `npm run test:links` covers the detection rules offline and runs in CI.

- **Catalogue depth is a quality gate, not just a nice-to-have**: `pickVenue`
  filters to venues within one budget rank of the target, so a stop type with
  only 1-2 venues returns the same venue every time AND makes the "Swap this
  stop" button a no-op (it falls back to the same pick). Keep every metro at 3+
  venues per stop type with a spread of budgets. `scripts/` has no checker for
  this yet; the audit script prints a NOTE when a pool drops to 1.

## Target markets
DMV (primary: DC, Alexandria, Arlington), expanding to NYC, LA, Chicago, Dallas,
Philadelphia.

## Business model
First plan free, then paid tiers. Founders Pass is the premium entry point
(`handleSkipLine` — confirm Stripe checkout wiring is complete before relying on it).
