import {chromium} from 'playwright';
import * as esbuild from 'esbuild';
import {join} from 'node:path';
import {mkdirSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {canvas} from '../design/tokens.js';
import {measureDataIds} from '../qa/lint-geometry.js';
import {startPublicServer} from '../qa/public-server.js';
import {boxesToRecord} from './measure.js';
import type {LayoutFile} from './run-layout-types.js';
import type {ScenesDsl} from '../dsl/schema.js';

const entry = join(process.cwd(), 'src', 'measure', 'preset-measure-entry.tsx');
const cacheDir = join(process.cwd(), 'out', '.cache', 'measure');
const bundleOut = join(cacheDir, 'preset-measure-bundle.js');
const bundleMeta = join(cacheDir, 'preset-measure-meta.json');

const hashSources = (): string => {
  const h = createHash('sha256');
  h.update(readFileSync(entry));
  h.update(readFileSync(join(process.cwd(), 'src', 'design', 'stage-backdrop.tsx')));
  h.update(readFileSync(join(process.cwd(), 'src', 'design', 'stage-ambient.tsx')));
  h.update(readFileSync(join(process.cwd(), 'src', 'design', 'sample-shell.tsx')));
  return h.digest('hex').slice(0, 16);
};

export const ensurePresetMeasureBundle = async (): Promise<void> => {
  mkdirSync(cacheDir, {recursive: true});
  const hash = hashSources();
  if (existsSync(bundleMeta)) {
    const prev = JSON.parse(readFileSync(bundleMeta, 'utf8')) as {hash: string};
    if (prev.hash === hash && existsSync(bundleOut)) {
      return;
    }
  }
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: bundleOut,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    logLevel: 'warning',
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    alias: {
      remotion: join(process.cwd(), 'src', 'measure', 'remotion-shim.tsx'),
    },
  });
  writeFileSync(bundleMeta, `${JSON.stringify({hash}, null, 2)}\n`, 'utf8');
  const publicCopy = join(process.cwd(), 'public', 'measure', 'preset-measure-bundle.js');
  mkdirSync(join(process.cwd(), 'public', 'measure'), {recursive: true});
  writeFileSync(publicCopy, readFileSync(bundleOut));
};

export const measureLayoutWithRemotion = async (dsl: ScenesDsl): Promise<LayoutFile> => {
  await ensurePresetMeasureBundle();
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const scenes: LayoutFile['scenes'] = [];

  try {
    for (const scene of dsl.scenes) {
      const page = await browser.newPage({
        viewport: {width: canvas.width, height: canvas.height},
      });
      await page.addInitScript((props) => {
        window.__PRESET_MEASURE__ = props;
      }, {preset: scene.preset, slots: scene.slots});

      await page.goto(`${baseUrl}/measure/preset-stage.html`, {
        waitUntil: 'networkidle',
        timeout: 120_000,
      });
      await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', undefined, {
        timeout: 120_000,
      });
      await page.waitForTimeout(300);

      const boxes = boxesToRecord(await measureDataIds(page));
      const beats = scene.beats.map((_, beatIndex) => ({beatIndex, boxes}));
      scenes.push({sceneId: scene.id, preset: scene.preset, beats});
      await page.close();
    }
  } finally {
    await browser.close();
    await close();
  }

  return {lecture: dsl.lecture, scenes};
};
