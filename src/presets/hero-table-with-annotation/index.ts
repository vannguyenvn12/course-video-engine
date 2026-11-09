import {z} from 'zod';
import {CounterAnnotationSchema, TableSlotSchema, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  table: TableSlotSchema,
  annotation: CounterAnnotationSchema,
});

export const heroTablePreset: PresetDefinition = {
  name: 'hero-table-with-annotation',
  schema,
  description: 'Data table + counter annotation',
  measureDataIds: ['stage-safe', 'scene-title', 'orders', 'counter'],
};
