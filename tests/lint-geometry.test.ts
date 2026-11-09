import {join} from 'node:path';
import {chromium} from 'playwright';
import {describe, expect, it} from 'vitest';
import {canvas, layout} from '../src/design/tokens.js';
import {lintGeometry, measureDataIds} from '../src/qa/lint-geometry.js';
import {openFontStillMeasurePage} from '../src/qa/open-measure-page.js';
import {startPublicServer} from '../src/qa/public-server.js';

describe('geometry lint (Phase 0)', () => {
  it('measures data-id boxes and passes G-FONT / G-SAFE', async () => {
    const {baseUrl, close} = await startPublicServer();
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: {width: canvas.width, height: canvas.height},
    });
    await openFontStillMeasurePage(page, baseUrl);

    const boxes = await measureDataIds(page);
    expect(boxes.some((b) => b.id === 'stage-safe')).toBe(true);
    expect(boxes.some((b) => b.id === 'hero-title')).toBe(true);

    const title = boxes.find((b) => b.id === 'hero-title')!;
    const sub = boxes.find((b) => b.id === 'hero-sub')!;

    const capturePath = join(process.cwd(), 'out', 'phase0', 'measure-capture-test.png');
    await page.screenshot({path: capturePath, type: 'png'});
    const contrast = {
      stillPath: capturePath,
      titleBox: title,
      bodyBox: sub,
      bgSample: {x: layout.safeArea + 24, y: sub.y + 12},
    };

    const report = await lintGeometry(page, contrast);
    const rules = report.issues.map((i) => i.rule);
    expect(rules).not.toContain('G-FONT');
    expect(rules).not.toContain('G-SAFE');
    expect(rules).not.toContain('G-CONTRAST');

    await browser.close();
    await close();
  });
});
