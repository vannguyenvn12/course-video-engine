import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {TimelineSchema} from '../align/types.js';
import {buildSegments} from './segment.js';

export const runSegment = (
  lectureDir: string,
  outDir?: string,
): {segmentsPath: string; segments: ReturnType<typeof buildSegments>} => {
  const name = basename(lectureDir);
  const targetOut = outDir ?? join(process.cwd(), 'out', name);
  const timelinePath = join(targetOut, 'timeline.json');
  const timeline = TimelineSchema.parse(JSON.parse(readFileSync(timelinePath, 'utf8')));
  const segments = buildSegments(timeline);

  mkdirSync(targetOut, {recursive: true});
  const segmentsPath = join(targetOut, 'segments.json');
  writeFileSync(segmentsPath, `${JSON.stringify(segments, null, 2)}\n`, 'utf8');

  return {segmentsPath, segments};
};
