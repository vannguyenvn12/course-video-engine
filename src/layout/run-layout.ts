import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {join, basename} from 'node:path';
import {loadDsl} from '../dsl/validate-gate.js';
import {measureLayoutWithRemotion} from './measure-preset-dom.js';
import type {LayoutFile} from './run-layout-types.js';

export type {LayoutFile} from './run-layout-types.js';

const fallbackLayout = (dsl: import('../dsl/schema.js').ScenesDsl): LayoutFile => {
  const safe = 96;
  return {
    lecture: dsl.lecture,
    scenes: dsl.scenes.map((scene, si) => {
      const tableId =
        typeof scene.slots.table === 'object' && scene.slots.table && 'id' in (scene.slots.table as object)
          ? String((scene.slots.table as {id: string}).id)
          : 'hero';
      const counterId =
        typeof scene.slots.annotation === 'object' &&
        scene.slots.annotation &&
        'id' in (scene.slots.annotation as object)
          ? String((scene.slots.annotation as {id: string}).id)
          : 'counter';
      const yBase = safe + 120 + si * 12;
      const boxes = {
        'stage-safe': {id: 'stage-safe', x: safe, y: safe, width: 1728, height: 888},
        'scene-title': {id: 'scene-title', x: safe, y: yBase, width: 800, height: 80},
        [tableId]: {id: tableId, x: safe, y: yBase + 120, width: 980, height: 360},
        [counterId]: {id: counterId, x: safe + 1100, y: yBase + 180, width: 420, height: 200},
      };
      return {
        sceneId: scene.id,
        preset: scene.preset,
        beats: scene.beats.map((_, beatIndex) => ({beatIndex, boxes})),
      };
    }),
  };
};

export const runLayout = async (
  lectureDir: string,
  outDir?: string,
): Promise<{layoutPath: string; layout: LayoutFile}> => {
  const name = basename(lectureDir);
  const targetOut = outDir ?? join(process.cwd(), 'out', name);
  const dsl = loadDsl(lectureDir);
  const prior = join(targetOut, 'layout.json');

  let layout: LayoutFile;
  const useMeasure = process.env.LAYOUT_FALLBACK !== '1';
  try {
    if (useMeasure) {
      layout = await measureLayoutWithRemotion(dsl);
    } else {
      throw new Error('forced fallback');
    }
  } catch (err) {
    if (existsSync(prior)) {
      layout = JSON.parse(readFileSync(prior, 'utf8')) as LayoutFile;
    } else {
      console.error(JSON.stringify({ok: false, layoutMeasureWarning: String(err)}));
      layout = fallbackLayout(dsl);
    }
  }

  mkdirSync(targetOut, {recursive: true});
  const layoutPath = join(targetOut, 'layout.json');
  writeFileSync(layoutPath, `${JSON.stringify(layout, null, 2)}\n`, 'utf8');
  return {layoutPath, layout};
};
