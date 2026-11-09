import type {Page} from 'playwright';

export const openFontStillMeasurePage = async (page: Page, baseUrl: string): Promise<void> => {
  await page.goto(`${baseUrl}/measure/font-still.html`, {
    waitUntil: 'networkidle',
    timeout: 30_000,
  });
  await page.waitForFunction(() => document.body.dataset.fontsReady === 'true');
  await page.waitForTimeout(200);
};
