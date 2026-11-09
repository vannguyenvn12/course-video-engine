import {z} from 'zod';

export const BeatAtSchema = z.union([
  z.object({
    word: z.string().min(1),
    occurrence: z.number().int().positive().optional(),
  }),
  z.object({segmentStart: z.literal(true)}),
  z.object({
    after: z.string().min(1),
    gap: z.enum(['short', 'medium']).optional(),
  }),
]);

export const BeatVerbSchema = z.enum([
  'reveal',
  'hide',
  'emphasize',
  'deemphasize',
  'focus',
  'draw',
  'connect',
  'scan-rows',
  'traverse',
  'type-code',
  'highlight-lines',
  'count',
  'morph-into',
  'swap',
  'split',
  'merge',
]);

export const BeatSchema = z.object({
  id: z.string().optional(),
  at: BeatAtSchema,
  do: BeatVerbSchema,
  target: z.string().optional(),
  drive: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const TransitionSchema = z.enum(['morph', 'camera', 'cut', 'fade']);

export const SceneSchema = z.object({
  id: z.string().min(1),
  segment: z.string().min(1),
  preset: z.string().min(1),
  slots: z.record(z.unknown()),
  beats: z.array(BeatSchema).min(1),
  persist: z.array(z.string()).optional(),
  transition: TransitionSchema.optional(),
});

export const ScenesDslSchema = z.object({
  lecture: z.string().min(1),
  scenes: z.array(SceneSchema).min(1),
});

export type ScenesDsl = z.infer<typeof ScenesDslSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type BeatAt = z.infer<typeof BeatAtSchema>;
