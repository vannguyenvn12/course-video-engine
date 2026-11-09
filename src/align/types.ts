import {z} from 'zod';

export const WordTimingSchema = z.object({
  index: z.number().int().nonnegative(),
  text: z.string(),
  normalized: z.string(),
  occurrence: z.number().int().positive(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
});

export const SentenceSchema = z.object({
  id: z.string(),
  text: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  wordIndexes: z.array(z.number().int()),
});

export const TimelineSchema = z.object({
  lecture: z.string(),
  audioDurationMs: z.number().positive(),
  words: z.array(WordTimingSchema),
  sentences: z.array(SentenceSchema),
});

export type WordTiming = z.infer<typeof WordTimingSchema>;
export type Sentence = z.infer<typeof SentenceSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;

export const WhisperWordSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
});

export const WhisperPayloadSchema = z.object({
  words: z.array(WhisperWordSchema),
});

export type WhisperWord = z.infer<typeof WhisperWordSchema>;
