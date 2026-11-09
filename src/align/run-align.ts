import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {join, basename} from 'node:path';
import {alignScriptToWhisper} from './align.js';
import {parseScriptMarkdown} from './parse-script.js';
import {loadWhisperWords} from './whisper.js';
import {TimelineSchema} from './types.js';

export const runAlign = (lectureDir: string, outDir?: string): {timelinePath: string; timeline: ReturnType<typeof TimelineSchema.parse>} => {
  const scriptPath = join(lectureDir, 'script.md');
  const scriptMd = readFileSync(scriptPath, 'utf8');
  const parsed = parseScriptMarkdown(scriptMd);
  const {words, durationMs} = loadWhisperWords(lectureDir);
  const lecture = basename(lectureDir);
  const timeline = alignScriptToWhisper(parsed, words, lecture, durationMs);

  const targetOut = outDir ?? join(process.cwd(), 'out', lecture);
  mkdirSync(targetOut, {recursive: true});
  const timelinePath = join(targetOut, 'timeline.json');
  writeFileSync(timelinePath, `${JSON.stringify(timeline, null, 2)}\n`, 'utf8');

  return {timelinePath, timeline};
};
