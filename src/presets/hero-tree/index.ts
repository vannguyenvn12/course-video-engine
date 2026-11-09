import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  tree: z.object({id: IdSlot, nodes: z.array(z.object({id: z.string(), label: z.string()})).min(1)}),
});

export const heroTreePreset: PresetDefinition = {
  name: 'hero-tree',
  schema,
  description: 'B-tree style path traversal',
  measureDataIds: ['stage-safe', 'tree'],
};
