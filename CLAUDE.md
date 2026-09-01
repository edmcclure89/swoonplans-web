# SwoonPlans (makeherswoon.com)

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
Runs, in order: `vite build` (client) → SSR build of `src/entry-server.tsx` →
`scripts/prerender.mjs` (prerenders the homepage shell into `dist/index.html` for
crawlers) → `scripts/prerender-blog.mjs` (generates `dist/blog/<slug>/index.html` per
post with correct per-article `<title>`, OG/twitter meta, canonical link, and
Article/FAQPage JSON-LD — Vercel serves these static files ahead of the
`/blog/:slug -> /` rewrite in `vercel.json`, no rewrite change needed).

`App.tsx` accepts an optional `ssrPath` prop so the per-post prerender script can
render the correct route at build time without a real `window.location`.

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
- **Blog SSR is partial, not full**: `scripts/prerender.mjs` renders only the
  homepage shell into `dist/index.html`. Per-article correctness comes entirely from
  `scripts/prerender-blog.mjs`. If you add a new blog post, rerun the full build and
  spot-check `dist/blog/<new-slug>/index.html` has real title/OG tags, not the
  homepage's.
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
