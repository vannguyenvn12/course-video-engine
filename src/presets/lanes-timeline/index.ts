import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  lanes: z.array(z.object({id: IdSlot, label: z.string()})).min(2).max(3),
});

export const lanesTimelinePreset: PresetDefinition = {
  name: 'lanes-timeline',
  schema,
  description: 'Parallel lanes over time',
  measureDataIds: ['stage-safe', 'lanes'],
};
