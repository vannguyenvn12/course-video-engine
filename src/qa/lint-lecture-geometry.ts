import {chromium} from 'playwright';
import {join} from 'node:path';
import {loadDsl} from '../dsl/validate-gate.js';
import {startPublicServer} from './public-server.js';
import {ensurePresetMeasureBundle} from '../layout/measure-preset-dom.js';
import {lintGeometry} from './lint-geometry.js';
import type {LintIssue, LintReport} from './types.js';
import {openPresetMeasurePage, presetMeasureViewport} from './open-preset-measure-page.js';

export const lintLectureGeometry = async (
  lectureDir: string,
  outDir: string,
): Promise<LintReport> => {
  const dsl = loadDsl(lectureDir);
  await ensurePresetMeasureBundle();
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const issues: LintIssue[] = [];

  try {
    for (const scene of dsl.scenes) {
      const page = await browser.newPage({viewport: presetMeasureViewport()});
      await openPresetMeasurePage(page, baseUrl, scene.preset, scene.slots);
      const stillPath = join(outDir, 'review', `lint-${scene.id}.png`);
      await page.screenshot({path: stillPath, type: 'png'});

      const title = await page.$('[data-id="hero-title"], [data-id="scene-title"]');
      const sub = await page.$('[data-id="hero-sub"]');
      const contrast =
        title && sub
          ? {
              stillPath,
              titleBox: await boxFromEl(page, (await title.getAttribute('data-id')) ?? 'scene-title'),
              bodyBox: await boxFromEl(page, 'hero-sub'),
              bgSample: {x: 120, y: 200},
            }
          : undefined;

      const sceneReport = await lintGeometry(page, contrast);
      for (const issue of sceneReport.issues) {
        issues.push({
          ...issue,
          message: `[${scene.id}] ${issue.message}`,
          dataId: issue.dataId ? `${scene.id}/${issue.dataId}` : undefined,
        });
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await close();
  }

  return {ok: issues.every((i) => i.severity !== 'error'), issues};
};

const boxFromEl = async (
  page: import('playwright').Page,
  dataId: string,
): Promise<{id: string; x: number; y: number; width: number; height: number}> => {
  return page.evaluate((id) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (!el) {
      return {id, x: 0, y: 0, width: 0, height: 0};
    }
    const r = el.getBoundingClientRect();
    return {id, x: r.x, y: r.y, width: r.width, height: r.height};
  }, dataId);
};
