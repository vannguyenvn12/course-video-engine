import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  blocks: z.object({
    id: IdSlot,
    pages: z.array(z.object({id: z.string(), label: z.string()})).min(1).max(12),
  }),
});

export const memoryBlocksPreset: PresetDefinition = {
  name: 'memory-blocks',
  schema,
  description: 'Page / buffer memory grid',
  measureDataIds: ['stage-safe', 'blocks'],
};
