import {z} from 'zod';
import {IdSlot, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot.optional(),
  metric: z.object({id: IdSlot, value: z.string(), unit: z.string().optional()}),
});

export const metricCalloutPreset: PresetDefinition = {
  name: 'metric-callout',
  schema,
  description: 'Large metric with context',
  measureDataIds: ['stage-safe', 'metric'],
};
