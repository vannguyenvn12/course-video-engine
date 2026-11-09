/** Motion primitives (Phase 3). Used by compile/render; durations from design tokens. */
export const motionVerbs = [
  'reveal',
  'scan-rows',
  'focus',
  'emphasize',
] as const;

export type MotionVerb = (typeof motionVerbs)[number];
