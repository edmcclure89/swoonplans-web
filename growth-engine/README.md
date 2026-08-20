# SwoonPlans Growth Engine

A daily content-drafting cycle, not an unsupervised publishing bot.

## What it does, every cycle
1. Checks `engine_state.json` for real Buffer post history and unused asset inventory.
2. Picks a mixed-style batch (rotating through carousel / photo-ad / text-graphic / Bernbach-minimalist styles, avoiding repeats) and, when inventory runs low, generates new creative.
3. Pushes the batch to Buffer as **drafts** — never scheduled, never published.
4. Updates `engine_state.json` with what was drafted and any real performance data available from Buffer.
5. Leaves a summary ready for the 7:00 AM ET daily review.

## What it deliberately does not do
- **Does not auto-publish or auto-schedule.** Every post that has gone live this campaign happened because a specific piece of content was reviewed and approved. This engine keeps that pattern — it prepares, it doesn't decide to ship.
- **Does not pitch journalists.** No real contact list exists; fabricating one or mass-sending to guessed addresses is spam, not PR.
- **Does not monitor or auto-reply to comments/DMs.** Buffer's API has no comment/inbox endpoints (verified via schema introspection — only `account`, `channel(s)`, `post(s)`, `postTemplate(s)`, `ideas`), and unsupervised replies to real people is a brand-safety risk regardless.

## Files
- `engine_state.json` — the single source of truth: asset inventory, live schedule, pending decisions, cycle history.
- `README.md` — this file.

## The daily rhythm
A recurring check-in fires each morning before 7 AM ET to run the cycle above. You review what's queued at 7 AM and say go on whatever you want live — same as every batch so far this campaign.
