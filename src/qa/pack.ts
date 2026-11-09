import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {loadDsl} from '../dsl/validate-gate.js';
import {startPublicServer} from './public-server.js';
import {ensurePresetMeasureBundle} from '../layout/measure-preset-dom.js';
import {openPresetMeasurePage, presetMeasureViewport} from './open-preset-measure-page.js';
import {stitchContactSheet} from './contact-sheet.js';

export type ReviewPackResult = {
  sceneStills: string[];
  contactSheet: string;
  filmstrips: string[];
  contextPath: string;
};

export const buildReviewPack = async (
  lectureDir: string,
  outDir: string,
  extra?: {segmentsPath?: string; lintSummary?: string},
): Promise<ReviewPackResult> => {
  const dsl = loadDsl(lectureDir);
  const reviewDir = join(outDir, 'review');
  mkdirSync(reviewDir, {recursive: true});

  await ensurePresetMeasureBundle();
  const {baseUrl, close} = await startPublicServer();
  const browser = await chromium.launch();
  const sceneStills: string[] = [];
  const sheetItems: {id: string; path: string}[] = [];

  try {
    for (const scene of dsl.scenes) {
      const page = await browser.newPage({viewport: presetMeasureViewport()});
      await openPresetMeasurePage(page, baseUrl, scene.preset, scene.slots);
      const file = join(reviewDir, `scene-${scene.id}.png`);
      await page.screenshot({path: file, type: 'png'});
      sceneStills.push(file);
      sheetItems.push({id: scene.id, path: file});
      await page.close();
    }
  } finally {
    await browser.close();
    await close();
  }

  const contactSheet = join(reviewDir, 'contact-sheet.png');
  stitchContactSheet(sheetItems, contactSheet);

  const filmstrips: string[] = [];
  const mp4 = join(outDir, 'lecture.mp4');
  for (const scene of dsl.scenes) {
    const stripPath = join(reviewDir, `filmstrip-${scene.id}.png`);
    if (existsSync(mp4)) {
      await extractFilmstripFromMp4(mp4, stripPath);
    } else {
      stitchContactSheet([{id: scene.id, path: join(reviewDir, `scene-${scene.id}.png`)}], stripPath);
    }
    filmstrips.push(stripPath);
  }

  const contextPath = join(reviewDir, 'context.md');
  const segText = extra?.segmentsPath && existsSync(extra.segmentsPath)
    ? readFileSync(extra.segmentsPath, 'utf8')
    : '';
  writeFileSync(
    contextPath,
    `# Review context — ${dsl.lecture}

${extra?.lintSummary ?? ''}

## DSL (abbreviated)

\`\`\`json
${JSON.stringify(dsl, null, 2)}
\`\`\`

## Segments

\`\`\`json
${segText.slice(0, 4000)}
\`\`\`
`,
    'utf8',
  );

  return {sceneStills, contactSheet, filmstrips, contextPath};
};

const extractFilmstripFromMp4 = async (mp4: string, outputPng: string): Promise<void> => {
  const framesDir = join(outputPng, '..', '.filmstrip-tmp');
  mkdirSync(framesDir, {recursive: true});
  const pattern = join(framesDir, 'frame-%02d.png');
  const extract = spawnSync(
    'ffmpeg',
    ['-y', '-i', mp4, '-vf', 'fps=1/3', '-frames:v', '8', pattern],
    {stdio: 'pipe'},
  );
  if (extract.status !== 0) {
    return;
  }
  const items: {id: string; path: string}[] = [];
  for (let i = 1; i <= 8; i++) {
    const p = join(framesDir, `frame-${String(i).padStart(2, '0')}.png`);
    if (existsSync(p)) {
      items.push({id: `f${i}`, path: p});
    }
  }
  if (items.length > 0) {
    stitchContactSheet(items, outputPng);
  }
};
