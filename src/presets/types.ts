import type {z} from 'zod';

export type PresetDefinition = {
  name: string;
  schema: z.ZodType<Record<string, unknown>>;
  description: string;
  measureDataIds: string[];
};
