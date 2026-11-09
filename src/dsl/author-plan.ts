import {z} from 'zod';

export const AuthorPlanSceneSchema = z.object({
  sceneId: z.string().min(1),
  segmentId: z.string().min(1),
  votSteps: z.array(z.string().min(1)).min(3),
  semanticGrid: z.string().min(1),
  subtractDetail: z.string().min(1),
  preset: z.string().min(1),
  heroIds: z.array(z.string()).min(1),
});

export const AuthorPlanSchema = z.object({
  lecture: z.string().min(1),
  scenes: z.array(AuthorPlanSceneSchema).min(1),
  generatedAt: z.string().min(1),
  mode: z.enum(['deterministic', 'agentic', 'llm']).optional(),
});

export type AuthorPlan = z.infer<typeof AuthorPlanSchema>;
