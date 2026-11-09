import type {Page} from 'playwright';
import {readFileSync} from 'node:fs';
import {PNG} from 'pngjs';
import {canvas, layout, typography} from '../design/tokens.js';
import {
  contrastRatio,
  sampleRegionAverage,
  sampleRegionBrightest,
  type SampleRegion,
} from './contrast.js';
import type {LintIssue, LintReport} from './types.js';

export type MeasuredBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const measureDataIds = async (page: Page): Promise<MeasuredBox[]> => {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-id]'));
    return nodes.map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.getAttribute('data-id') ?? '',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });
  });
};

const ruleFont = async (page: Page): Promise<LintIssue[]> => {
  const missing = await page.evaluate(() => {
    const specs = [
      '200 1em IBMPlexSans',
      '400 1em IBMPlexSans',
      '700 1em IBMPlexSans',
      '400 1em IBMPlexMono',
    ];
    return specs.filter((s) => !document.fonts.check(s));
  });
  if (missing.length === 0) {
    return [];
  }
  return [
    {
      rule: 'G-FONT',
      severity: 'error',
      message: `Fonts not ready: ${missing.join(', ')}`,
      hint: 'Ensure @font-face files exist in public/fonts and loadCourseFonts runs before lint.',
    },
  ];
};

const ruleSafe = (boxes: MeasuredBox[]): LintIssue[] => {
  const pad = layout.safeArea;
  const issues: LintIssue[] = [];
  for (const box of boxes) {
    if (box.id === 'decorative') {
      continue;
    }
    if (
      box.x < pad - 1 ||
      box.y < pad - 1 ||
      box.x + box.width > canvas.width - pad + 1 ||
      box.y + box.height > canvas.height - pad + 1
    ) {
      issues.push({
        rule: 'G-SAFE',
        severity: 'error',
        dataId: box.id,
        message: `Element "${box.id}" outside safe area (${pad}px)`,
        hint: 'Adjust preset grid so content stays inside stage-safe.',
      });
    }
  }
  return issues;
};

export type ContrastCheckInput = {
  stillPath: string;
  titleBox: MeasuredBox;
  bodyBox: MeasuredBox;
  bgSample: {x: number; y: number};
  pixelScale?: number;
};

const scaleRegion = (input: ContrastCheckInput, region: SampleRegion): SampleRegion => {
  const s = input.pixelScale ?? 1;
  return {
    x: region.x * s,
    y: region.y * s,
    w: region.w * s,
    h: region.h * s,
  };
};

const ruleContrast = (input: ContrastCheckInput): LintIssue[] => {
  const titleFg = sampleRegionBrightest(
    input.stillPath,
    scaleRegion(input, {
      x: input.titleBox.x + 16,
      y: input.titleBox.y + 20,
      w: 96,
      h: 64,
    }),
  );
  const bodyFg = sampleRegionBrightest(
    input.stillPath,
    scaleRegion(input, {
      x: input.bodyBox.x + 8,
      y: input.bodyBox.y + 6,
      w: Math.min(280, input.bodyBox.width - 12),
      h: 28,
    }),
  );
  const bg = sampleRegionAverage(
    input.stillPath,
    scaleRegion(input, {
      x: input.bgSample.x,
      y: input.bgSample.y,
      w: 48,
      h: 48,
    }),
  );
  const titleRatio = contrastRatio(titleFg, bg);
  const bodyRatio = contrastRatio(bodyFg, bg);
  const issues: LintIssue[] = [];
  const titleMin = typography.sizes.display >= 48 ? 3 : 4.5;
  if (titleRatio < titleMin) {
    issues.push({
      rule: 'G-CONTRAST',
      severity: 'error',
      dataId: 'hero-title',
      message: `Title contrast ${titleRatio.toFixed(2)} < ${titleMin}`,
      hint: 'Use colors.text on colors.bg per DESIGN.md.',
    });
  }
  if (bodyRatio < 4.5) {
    issues.push({
      rule: 'G-CONTRAST',
      severity: 'error',
      dataId: 'hero-sub',
      message: `Body contrast ${bodyRatio.toFixed(2)} < 4.5`,
      hint: 'Use colors.textMuted on dark surface with sufficient luminance delta.',
    });
  }
  return issues;
};

export const inferPixelScale = (stillPath: string): number => {
  const png = PNG.sync.read(readFileSync(stillPath));
  return png.width / canvas.width;
};

export const lintGeometry = async (
  page: Page,
  contrast?: ContrastCheckInput,
): Promise<LintReport> => {
  const contrastInput = contrast
    ? {...contrast, pixelScale: contrast.pixelScale ?? inferPixelScale(contrast.stillPath)}
    : undefined;
  const boxes = await measureDataIds(page);
  const issues: LintIssue[] = [
    ...(await ruleFont(page)),
    ...ruleSafe(boxes),
    ...(contrastInput ? ruleContrast(contrastInput) : []),
  ];
  return {ok: issues.every((i) => i.severity !== 'error'), issues};
};
