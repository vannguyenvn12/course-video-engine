import type {Timeline} from '../align/types.js';
import type {SegmentsFile} from '../segment/types.js';
import {normalizeToken} from '../align/normalize.js';
import type {Beat, BeatAt} from './schema.js';
import {canvas} from '../design/tokens.js';

const GAP_MS = {short: 400, medium: 900} as const;

export class DslResolveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DslResolveError';
  }
}

const segmentWords = (
  timeline: Timeline,
  segmentId: string,
  segments: SegmentsFile,
): {wordIndexes: number[]; startMs: number; endMs: number} => {
  const seg = segments.segments.find((s) => s.id === segmentId);
  if (!seg) {
    throw new DslResolveError(`Unknown segment "${segmentId}"`);
  }
  return {
    wordIndexes: seg.wordIndexes,
    startMs: seg.startMs,
    endMs: seg.endMs,
  };
};

export const resolveWordAnchorMs = (
  timeline: Timeline,
  segmentId: string,
  segments: SegmentsFile,
  at: Extract<BeatAt, {word: string}>,
): number => {
  const {wordIndexes} = segmentWords(timeline, segmentId, segments);
  const wantOccurrence = at.occurrence ?? 1;
  let seenInSegment = 0;
  for (const idx of wordIndexes) {
    const w = timeline.words[idx];
    if (!w) {
      continue;
    }
    if (w.normalized === normalizeToken(at.word)) {
      seenInSegment++;
      if (seenInSegment === wantOccurrence) {
        return w.startMs;
      }
    }
  }
  throw new DslResolveError(
    `Anchor word "${at.word}" occurrence ${wantOccurrence} not in segment "${segmentId}"`,
  );
};

export const resolveBeatAtMs = (
  timeline: Timeline,
  segments: SegmentsFile,
  sceneSegment: string,
  at: BeatAt,
  priorBeatMs: number | null,
): number => {
  if ('segmentStart' in at && at.segmentStart) {
    return segmentWords(timeline, sceneSegment, segments).startMs;
  }
  if ('word' in at) {
    return resolveWordAnchorMs(timeline, sceneSegment, segments, at);
  }
  if ('after' in at) {
    const base = priorBeatMs ?? segmentWords(timeline, sceneSegment, segments).startMs;
    return base + GAP_MS[at.gap ?? 'short'];
  }
  throw new DslResolveError('Unsupported beat anchor');
};

export const msToFrame = (ms: number): number => {
  return Math.round((ms / 1000) * canvas.fps);
};

export const resolveSceneBeats = (
  timeline: Timeline,
  segments: SegmentsFile,
  segmentId: string,
  beats: Beat[],
): {beat: Beat; startMs: number; frame: number}[] => {
  const resolved: {beat: Beat; startMs: number; frame: number}[] = [];
  let prior: number | null = null;
  for (const beat of beats) {
    const startMs = resolveBeatAtMs(timeline, segments, segmentId, beat.at, prior);
    resolved.push({beat, startMs, frame: msToFrame(startMs)});
    prior = startMs;
  }
  return resolved;
};
