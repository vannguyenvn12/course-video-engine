import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadDsl} from '../dsl/validate-gate.js';
import {AuthorPlanSchema} from '../dsl/author-plan.js';
import {buildAuthorPlanFromDsl} from './plan-from-dsl.js';

export type AuthorResult = {
  ok: boolean;
  planPath: string;
  mode: 'agentic';
  sceneCount: number;
  error?: string;
};

/**
 * VoT sidecar from current DSL — no external API.
 * Scene DSL is edited by the coding agent using prompts/author-vot.md + prompts/author.md.
 */
export const runAuthor = async (lectureDir: string, outDir: string): Promise<AuthorResult> => {
  mkdirSync(outDir, {recursive: true});
  const planPath = join(outDir, 'author.plan.json');

  try {
    const dsl = loadDsl(lectureDir);
    const plan = buildAuthorPlanFromDsl(dsl, 'deterministic');
    plan.mode = 'agentic';

    const check = AuthorPlanSchema.safeParse(plan);
    if (!check.success) {
      return {ok: false, planPath, mode: 'agentic', sceneCount: 0, error: check.error.message};
    }
    writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
    return {
      ok: true,
      planPath,
      mode: 'agentic',
      sceneCount: plan.scenes.length,
    };
  } catch (err) {
    return {ok: false, planPath, mode: 'agentic', sceneCount: 0, error: String(err)};
  }
};
