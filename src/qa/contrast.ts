import {readFileSync} from 'node:fs';
import {PNG} from 'pngjs';

type Rgb = {r: number; g: number; b: number};

const relativeLuminance = (c: Rgb): number => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
};

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export type SampleRegion = {x: number; y: number; w: number; h: number};

export const sampleRegionAverage = (
  pngPath: string,
  region: SampleRegion,
): Rgb => {
  const buffer = readFileSync(pngPath);
  const png = PNG.sync.read(buffer);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const x0 = Math.max(0, Math.floor(region.x));
  const y0 = Math.max(0, Math.floor(region.y));
  const x1 = Math.min(png.width, Math.ceil(region.x + region.w));
  const y1 = Math.min(png.height, Math.ceil(region.y + region.h));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (png.width * y + x) << 2;
      r += png.data[idx] ?? 0;
      g += png.data[idx + 1] ?? 0;
      b += png.data[idx + 2] ?? 0;
      n++;
    }
  }
  if (n === 0) {
    return {r: 0, g: 0, b: 0};
  }
  return {r: r / n, g: g / n, b: b / n};
};

/** Prefer bright glyphs on dark UI instead of averaging with empty background in the region. */
export const sampleRegionBrightest = (
  pngPath: string,
  region: SampleRegion,
): Rgb => {
  const buffer = readFileSync(pngPath);
  const png = PNG.sync.read(buffer);
  let best = {r: 0, g: 0, b: 0, lum: -1};
  const x0 = Math.max(0, Math.floor(region.x));
  const y0 = Math.max(0, Math.floor(region.y));
  const x1 = Math.min(png.width, Math.ceil(region.x + region.w));
  const y1 = Math.min(png.height, Math.ceil(region.y + region.h));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (png.width * y + x) << 2;
      const r = png.data[idx] ?? 0;
      const g = png.data[idx + 1] ?? 0;
      const b = png.data[idx + 2] ?? 0;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (lum > best.lum) {
        best = {r, g, b, lum};
      }
    }
  }
  return {r: best.r, g: best.g, b: best.b};
};
