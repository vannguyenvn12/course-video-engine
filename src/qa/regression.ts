import {existsSync, readFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {PNG} from 'pngjs';
import {chromium} from 'playwright';
import {canvas} from '../design/tokens.js';
import {getPreset} from '../presets/registry.js';
import {startPublicServer} from './public-server.js';
import {ensurePresetMeasureBundle} from '../layout/measure-preset-dom.js';
import {openPresetMeasurePage, presetMeasureViewport} from './open-preset-measure-page.js';

const MAX_PIXEL_DIFF_RATIO = 0.02;

export type RegressionResult = {
  preset: string;
  ok: boolean;
  diffRatio?: number;
  goldenPath?: string;
  actualPath?: string;
  error?: string;
};

export const runPresetRegression = async (presetName: string): Promise<RegressionResult> => {
  const def = getPreset(presetName);
  const goldenPath = join(process.cwd(), 'src', 'presets', presetName, 'golden', 'default.png');
  const fixturePath = join(process.cwd(), 'src', 'presets', presetName, 'fixtures', 'default.json');

  if (!existsSync(fixturePath)) {
    return {preset: presetName, ok: true, error: 'no_fixture_skipped'};
  }

  const slots = JSON.parse(readFileSync(fixturePath, 'utf8')) as Record<string, unknown>;
  await ensurePresetMeasureBundle();
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const outDir = join(process.cwd(), 'out', 'preset-regression');
  mkdirSync(outDir, {recursive: true});
  const actualPath = join(outDir, `${presetName}.png`);

  try {
    const page = await browser.newPage({viewport: presetMeasureViewport()});
    await openPresetMeasurePage(page, baseUrl, presetName, slots);
    await page.screenshot({path: actualPath, type: 'png'});
    await page.close();
  } finally {
    await browser.close();
    await close();
  }

  if (!existsSync(goldenPath)) {
    return {
      preset: presetName,
      ok: true,
      error: 'no_golden_skipped',
      actualPath,
      goldenPath,
    };
  }

  const diffRatio = pngDiffRatio(goldenPath, actualPath);
  return {
    preset: presetName,
    ok: diffRatio <= MAX_PIXEL_DIFF_RATIO,
    diffRatio,
    goldenPath,
    actualPath,
  };
};

const pngDiffRatio = (aPath: string, bPath: string): number => {
  const a = PNG.sync.read(readFileSync(aPath));
  const b = PNG.sync.read(readFileSync(bPath));
  if (a.width !== b.width || a.height !== b.height) {
    return 1;
  }
  const n = a.width * a.height;
  let diff = 0;
  for (let i = 0; i < n; i++) {
    const p = i << 2;
    const dr = Math.abs(a.data[p]! - b.data[p]!);
    const dg = Math.abs(a.data[p + 1]! - b.data[p + 1]!);
    const db = Math.abs(a.data[p + 2]! - b.data[p + 2]!);
    if (dr + dg + db > 24) {
      diff++;
    }
  }
  return diff / n;
};
