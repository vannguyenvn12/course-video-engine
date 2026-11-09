import {z} from 'zod';
import {TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  warning: z.string().max(80),
});

export const warningCalloutPreset: PresetDefinition = {
  name: 'warning-callout',
  schema,
  description: 'Common mistake callout, red border',
  measureDataIds: ['stage-safe', 'warning'],
};
