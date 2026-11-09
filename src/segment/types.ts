import {z} from 'zod';

export const SegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  startMs: z.number().nonnegative(),
  endMs: z.number().nonnegative(),
  durationMs: z.number().positive(),
  sentenceIds: z.array(z.string()),
  wordIndexes: z.array(z.number().int()),
});

export const SegmentsFileSchema = z.object({
  lecture: z.string(),
  segments: z.array(SegmentSchema),
});

export type Segment = z.infer<typeof SegmentSchema>;
export type SegmentsFile = z.infer<typeof SegmentsFileSchema>;
