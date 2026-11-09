import {z} from 'zod';
import {TitleSlot} from '../_shared/schemas.js';
import type {PresetDefinition} from '../types.js';

const schema = z.object({
  statement: TitleSlot,
});

export const statementPreset: PresetDefinition = {
  name: 'statement',
  schema,
  description: 'Single kinetic statement, max ~8 words',
  measureDataIds: ['stage-safe', 'statement'],
};
