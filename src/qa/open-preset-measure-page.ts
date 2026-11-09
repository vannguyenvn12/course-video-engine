import type {Page} from 'playwright';
import {canvas} from '../design/tokens.js';

export const openPresetMeasurePage = async (
  page: Page,
  baseUrl: string,
  preset: string,
  slots: Record<string, unknown>,
): Promise<void> => {
  await page.addInitScript((props) => {
    window.__PRESET_MEASURE__ = props;
  }, {preset, slots});

  await page.goto(`${baseUrl}/measure/preset-stage.html`, {
    waitUntil: 'networkidle',
    timeout: 120_000,
  });
  await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', undefined, {
    timeout: 120_000,
  });
  await page.waitForTimeout(200);
};

export const presetMeasureViewport = () => ({
  width: canvas.width,
  height: canvas.height,
});
