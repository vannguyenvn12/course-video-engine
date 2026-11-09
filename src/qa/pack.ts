import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {loadDsl} from '../dsl/validate-gate.js';
import {canvas} from '../design/tokens.js';
import {startPublicServer} from './public-server.js';
import {ensurePresetMeasureBundle} from '../layout/measure-preset-dom.js';

export const buildReviewPack = async (lectureDir: string, outDir: string): Promise<string[]> => {
  const dsl = loadDsl(lectureDir);
  const reviewDir = join(outDir, 'review');
  mkdirSync(reviewDir, {recursive: true});

  await ensurePresetMeasureBundle();
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const paths: string[] = [];

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
      await page.waitForTimeout(200);

      const file = join(reviewDir, `scene-${scene.id}.png`);
      await page.screenshot({path: file, type: 'png'});
      paths.push(file);
      await page.close();
    }
  } finally {
    await browser.close();
    await close();
  }

  return paths;
};
