import {z} from 'zod';
import {TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  subtitle: z.string().max(80).optional(),
});

export const openerPreset: PresetDefinition = {
  name: 'opener',
  schema,
  description: 'Section open: large title + optional subtitle + page-stack ids',
  measureDataIds: ['stage-safe', 'hero-title', 'hero-sub', 'page-stack'],
};
