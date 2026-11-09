import {z} from 'zod';

export const TitleSlot = z.string().max(120);
export const IdSlot = z.string().min(1);

export const TableSlotSchema = z.object({
  id: IdSlot,
  columns: z.array(z.string()).min(1).max(6),
  rows: z.array(z.array(z.string())).min(1).max(12),
});

export const CounterAnnotationSchema = z.object({
  id: IdSlot,
  kind: z.literal('counter'),
  label: z.string().max(40),
  from: z.number(),
  to: z.number(),
});

export const CodeSlotSchema = z.object({
  id: IdSlot,
  language: z.string().default('sql'),
  lines: z.array(z.string()).min(1).max(14),
});
