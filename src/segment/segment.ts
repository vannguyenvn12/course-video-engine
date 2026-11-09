import type {Timeline} from '../align/types.js';
import {SegmentsFileSchema, type Segment} from './types.js';

/** One sentence per segment when ≥2.5s (matches lint T-SCENE floor). */
const MIN_MS = 2_500;
const MAX_MS = 20_000;
const GAP_MERGE_MS = 600;

export const buildSegments = (timeline: Timeline): ReturnType<typeof SegmentsFileSchema.parse> => {
  const segments: Segment[] = [];
  let buffer = {
    sentenceIds: [] as string[],
    wordIndexes: [] as number[],
    startMs: 0,
    endMs: 0,
    textParts: [] as string[],
  };

  const flush = () => {
    if (buffer.sentenceIds.length === 0) {
      return;
    }
    const durationMs = buffer.endMs - buffer.startMs;
    segments.push({
      id: `seg-${String(segments.length + 1).padStart(2, '0')}`,
      text: buffer.textParts.join(' '),
      startMs: buffer.startMs,
      endMs: buffer.endMs,
      durationMs,
      sentenceIds: [...buffer.sentenceIds],
      wordIndexes: [...buffer.wordIndexes],
    });
    buffer = {sentenceIds: [], wordIndexes: [], startMs: 0, endMs: 0, textParts: []};
  };

  for (const sent of timeline.sentences) {
    const sentDuration = sent.endMs - sent.startMs;
    const projectedEnd = buffer.sentenceIds.length ? buffer.endMs : sent.startMs;
    const projectedDuration =
      (buffer.sentenceIds.length ? buffer.endMs - buffer.startMs : 0) + sentDuration + GAP_MERGE_MS;

    if (buffer.sentenceIds.length > 0 && projectedDuration > MAX_MS) {
      flush();
    }

    if (buffer.sentenceIds.length === 0) {
      buffer.startMs = sent.startMs;
    }
    buffer.sentenceIds.push(sent.id);
    buffer.textParts.push(sent.text);
    buffer.wordIndexes.push(...sent.wordIndexes);
    buffer.endMs = sent.endMs;

    const duration = buffer.endMs - buffer.startMs;
    if (duration >= MIN_MS) {
      flush();
    }
  }
  flush();

  for (const seg of segments) {
    if (seg.durationMs < MIN_MS || seg.durationMs > MAX_MS) {
      throw new Error(
        `Segment ${seg.id} duration ${seg.durationMs}ms outside ${MIN_MS}–${MAX_MS}ms`,
      );
    }
  }

  return SegmentsFileSchema.parse({
    lecture: timeline.lecture,
    segments,
  });
};
