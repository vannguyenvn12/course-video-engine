import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {canvas, layout} from '../src/design/tokens.js';
import {lintGeometry, measureDataIds} from '../src/qa/lint-geometry.js';
import {openFontStillMeasurePage} from '../src/qa/open-measure-page.js';
import {startPublicServer} from '../src/qa/public-server.js';

const stillPath = join(process.cwd(), 'out', 'phase0', 'font-still.png');

const main = async () => {
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: {width: canvas.width, height: canvas.height},
  });
  await openFontStillMeasurePage(page, baseUrl);

  const boxes = await measureDataIds(page);
  const title = boxes.find((b) => b.id === 'hero-title');
  const sub = boxes.find((b) => b.id === 'hero-sub');
  if (!title || !sub) {
    throw new Error('Missing measured boxes for contrast lint');
  }

  const capturePath = join(process.cwd(), 'out', 'phase0', 'measure-capture.png');
  await page.screenshot({path: capturePath, type: 'png'});
  const contrastInput = {
    stillPath: capturePath,
    titleBox: title,
    bodyBox: sub,
    bgSample: {x: layout.safeArea + 24, y: sub.y + 12},
  };
  try {
    readFileSync(stillPath);
  } catch {
    // Remotion still optional here; measure uses live Playwright screenshot for contrast.
  }

  const report = await lintGeometry(page, contrastInput);
  await browser.close();
  await close();
  console.log(JSON.stringify(report, null, 0));
  if (!report.ok) {
    process.exit(1);
  }
};

main().catch((err) => {
  console.error(JSON.stringify({ok: false, error: String(err)}));
  process.exit(1);
});
