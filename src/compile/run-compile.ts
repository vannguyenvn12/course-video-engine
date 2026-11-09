import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {TimelineSchema} from '../align/types.js';
import {SegmentsFileSchema} from '../segment/types.js';
import {loadDsl} from '../dsl/validate-gate.js';
import type {LayoutFile} from '../layout/run-layout.js';
import {compileTimeline} from './compile.js';

export const runCompile = (
  lectureDir: string,
  outDir?: string,
): {compiledPath: string; compiled: ReturnType<typeof compileTimeline>} => {
  const name = basename(lectureDir);
  const targetOut = outDir ?? join(process.cwd(), 'out', name);
  const dsl = loadDsl(lectureDir);
  const timeline = TimelineSchema.parse(
    JSON.parse(readFileSync(join(targetOut, 'timeline.json'), 'utf8')),
  );
  const segments = SegmentsFileSchema.parse(
    JSON.parse(readFileSync(join(targetOut, 'segments.json'), 'utf8')),
  );
  const layout = JSON.parse(readFileSync(join(targetOut, 'layout.json'), 'utf8')) as LayoutFile;
  const compiled = compileTimeline(dsl, timeline, segments, layout);

  mkdirSync(targetOut, {recursive: true});
  const compiledPath = join(targetOut, 'timeline.compiled.json');
  writeFileSync(compiledPath, `${JSON.stringify(compiled, null, 2)}\n`, 'utf8');
  return {compiledPath, compiled};
};
