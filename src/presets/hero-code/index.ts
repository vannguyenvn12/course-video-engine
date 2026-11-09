import {z} from 'zod';
import {CodeSlotSchema, TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  title: TitleSlot,
  code: CodeSlotSchema,
});

export const heroCodePreset: PresetDefinition = {
  name: 'hero-code',
  schema,
  description: 'Code block hero with highlightable lines',
  measureDataIds: ['stage-safe', 'scene-title', 'code'],
};
