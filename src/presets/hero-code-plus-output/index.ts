import {z} from 'zod';
import {CodeSlotSchema, IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  code: CodeSlotSchema,
  output: z.object({id: IdSlot, lines: z.array(z.string()).max(8)}),
});

export const heroCodePlusOutputPreset: PresetDefinition = {
  name: 'hero-code-plus-output',
  schema,
  description: 'Code left, output right, connector between',
  measureDataIds: ['stage-safe', 'code', 'output'],
};
