import { IMAGE_META } from '../data/imageMeta';

export interface ResponsiveImgAttrs {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Responsive <img> attributes for a local image: a srcset built from the
 * pre-generated WebP widths (see src/data/imageMeta.ts), plus intrinsic
 * width/height so the browser reserves space before the file arrives
 * (no layout shift). The original file stays as `src` and as the largest
 * srcset candidate.
 *
 * `sizes` should describe how wide the image renders, e.g.
 * "(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw".
 */
export function responsiveImg(src: string, sizes?: string): ResponsiveImgAttrs {
  const meta = IMAGE_META[src];
  if (!meta) return { src };
  const attrs: ResponsiveImgAttrs = { src, width: meta.w, height: meta.h };
  if (meta.variants.length > 0) {
    const base = src.replace(/\.(jpe?g|png|webp)$/i, '');
    const candidates = meta.variants.map((w) => `${base}-${w}w.webp ${w}w`);
    // A variant at full width (a lighter re-encode) replaces the original.
    if (!meta.variants.includes(meta.w)) candidates.push(`${src} ${meta.w}w`);
    attrs.srcSet = candidates.join(', ');
    if (sizes) attrs.sizes = sizes;
  }
  return attrs;
}
