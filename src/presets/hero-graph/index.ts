import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  graph: z.object({
    id: IdSlot,
    nodes: z.array(z.object({id: z.string(), label: z.string()})).min(2),
    edges: z.array(z.tuple([z.string(), z.string()])).min(1),
  }),
});

export const heroGraphPreset: PresetDefinition = {
  name: 'hero-graph',
  schema,
  description: 'Architecture / flow diagram (elkjs layout)',
  measureDataIds: ['stage-safe', 'graph'],
};
