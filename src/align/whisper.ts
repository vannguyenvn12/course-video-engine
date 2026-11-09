import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {WhisperPayloadSchema, type WhisperWord} from './types.js';

export type WhisperSource = {
  words: WhisperWord[];
  durationMs: number;
};

const loadJsonWords = (path: string): WhisperWord[] => {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  return WhisperPayloadSchema.parse(raw).words;
};

/** Prefer cached whisper.json; fixture whisper.words.json for CI; optional audio duration sidecar. */
export const loadWhisperWords = (lectureDir: string): WhisperSource => {
  const cached = join(lectureDir, 'whisper.words.json');
  const fixture = join(lectureDir, 'whisper.fixture.json');
  const durationFile = join(lectureDir, 'audio.duration.json');

  let words: WhisperWord[];
  if (existsSync(cached)) {
    words = loadJsonWords(cached);
  } else if (existsSync(fixture)) {
    words = loadJsonWords(fixture);
  } else {
    throw new Error(
      `Missing whisper.words.json or whisper.fixture.json in ${lectureDir}. Run offline whisper export or add a fixture.`,
    );
  }

  let durationMs: number;
  if (existsSync(durationFile)) {
    const d = JSON.parse(readFileSync(durationFile, 'utf8')) as {durationMs: number};
    durationMs = d.durationMs;
  } else {
    const last = words.at(-1);
    durationMs = last ? Math.ceil(last.end * 1000) + 500 : 0;
  }

  return {words, durationMs};
};
