import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  left: z.object({id: IdSlot, label: z.string()}),
  right: z.object({id: IdSlot, label: z.string()}),
});

export const compareSplitPreset: PresetDefinition = {
  name: 'compare-split',
  schema,
  description: 'A vs B same-scale comparison',
  measureDataIds: ['stage-safe', 'left', 'right'],
};
