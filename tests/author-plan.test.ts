import {describe, expect, it} from 'vitest';
import {buildAuthorPlanFromDsl} from '../src/author/plan-from-dsl.js';
import {AuthorPlanSchema} from '../src/dsl/author-plan.js';
import type {ScenesDsl} from '../src/dsl/schema.js';

const mini: ScenesDsl = {
  lecture: 'postgres/test',
  scenes: [
    {
      id: 's01',
      segment: 'seg-01',
      preset: 'memory-blocks',
      slots: {title: 'Heap', blocks: {id: 'heap', pages: [{id: 'p1', label: 'P1'}]}},
      beats: [{at: {segmentStart: true}, do: 'reveal', target: 'heap'}],
    },
  ],
};

describe('author plan', () => {
  it('builds VoT steps from DSL', () => {
    const plan = buildAuthorPlanFromDsl(mini);
    const parsed = AuthorPlanSchema.safeParse(plan);
    expect(parsed.success).toBe(true);
    expect(plan.scenes[0]!.votSteps.length).toBeGreaterThanOrEqual(3);
  });
});
