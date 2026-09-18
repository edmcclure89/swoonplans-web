/**
 * Intrinsic sizes + pre-built WebP widths for every image the UI renders.
 * Generated from public/images. Each variant lives next to its original as
 * <name>-<width>w.webp (e.g. /images/weekend-reset-480w.webp).
 *
 * Adding a new image? Drop it in public/images, add smaller WebP copies with
 * the same -<width>w.webp naming, and list it here. Images missing from this
 * map still render; they just ship without srcset/width/height.
 */
export interface ImageMeta {
  w: number;
  h: number;
  variants: number[];
}

export const IMAGE_META: Record<string, ImageMeta> = {
  '/images/weekend-reset.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/creative-catalyst-journal.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/sanctuary-bedroom.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/morning-routine.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/physical-flow-stretch.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/party-blueprint.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/party-themes-backyard.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/party-budget.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/managing-groups.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/allergy-safe-snacks.jpg': { w: 1264, h: 1264, variants: [480, 800] },
  '/images/date_african_american_couple_1785457444161.jpg': { w: 640, h: 477, variants: [480] },
  '/images/date_asian_couple_1785457457487.jpg': { w: 640, h: 477, variants: [480] },
  '/images/date_hispanic_couple_1785457480644.jpg': { w: 640, h: 477, variants: [480] },
  '/images/date_mixed_race_couple1_1785457469307.jpg': { w: 640, h: 477, variants: [480] },
  '/images/happy-solo-date.webp': { w: 1400, h: 764, variants: [480, 800] },
  '/images/kids-plan-fun-party.webp': { w: 1193, h: 896, variants: [480, 800] },
  '/images/kids-birthday-party-hug.webp': { w: 1456, h: 720, variants: [480, 800] },
  '/images/step-1_1.jpg': { w: 632, h: 444, variants: [320] },
  '/images/step-2_1.jpg': { w: 632, h: 444, variants: [320] },
  '/images/step-3.jpg': { w: 632, h: 444, variants: [320] },
  '/images/swoonplans-logo.webp': { w: 600, h: 101, variants: [300, 600] },
  '/images/og-default.jpg': { w: 1200, h: 630, variants: [] },
};
