import {existsSync, readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {CompiledTimeline} from '../compile/compile.js';
import type {LintReport} from './types.js';
import {AuthorPlanSchema} from '../dsl/author-plan.js';
import type {CriticScores} from './critic.js';

export type SpatialCriticResult = {
  spatialOk: boolean;
  issues: string[];
  scoreDelta: Partial<CriticScores>;
};

const SPATIAL_RULES = ['G-OVERLAP', 'G-SAFE', 'G-COVERAGE', 'G-BALANCE'] as const;

export const runSpatialCritic = (
  compiled: CompiledTimeline,
  geometry: LintReport,
  outDir: string,
): SpatialCriticResult => {
  const issues: string[] = [];
  const scoreDelta: Partial<CriticScores> = {};

  for (const rule of SPATIAL_RULES) {
    const hits = geometry.issues.filter((i) => i.rule === rule);
    if (hits.length) {
      issues.push(`${rule}: ${hits.length} issue(s) — ${hits[0]!.message}`);
    }
  }

  const planPath = join(outDir, 'author.plan.json');
  if (existsSync(planPath)) {
    const raw = JSON.parse(readFileSync(planPath, 'utf8'));
    const plan = AuthorPlanSchema.safeParse(raw);
    if (!plan.success) {
      issues.push('author.plan.json invalid schema');
      scoreDelta.explanationFit = 3;
    } else if (plan.data.scenes.length < compiled.scenes.length) {
      issues.push('author plan missing scenes');
      scoreDelta.explanationFit = 3;
    } else {
      const thin = plan.data.scenes.filter((s) => s.votSteps.length < 3);
      if (thin.length) {
        issues.push(`VoT steps <3 for: ${thin.map((s) => s.sceneId).join(', ')}`);
        scoreDelta.notGeneric = 3;
      }
    }
  } else {
    issues.push('author.plan.json missing (run author step)');
    scoreDelta.consistency = 3;
  }

  const connectBeats = compiled.scenes.flatMap((s) => s.beats).filter((b) => b.do === 'connect').length;
  const drawBeats = compiled.scenes.flatMap((s) => s.beats).filter((b) => b.do === 'draw' || b.do === 'traverse').length;
  if (connectBeats < 1 && drawBeats < 2 && compiled.scenes.length >= 4) {
    issues.push('No connect/draw spatial beats — weak spatial narrative');
    scoreDelta.motion = 3;
  }

  const majorGeo = geometry.issues.filter((i) => i.severity === 'error').length;
  const spatialOk = majorGeo === 0 && !issues.some((i) => i.includes('invalid') || i.includes('missing scenes'));

  if (spatialOk && issues.length === 0) {
    scoreDelta.composition = 5;
    scoreDelta.hierarchy = 4;
  }

  return {spatialOk, issues, scoreDelta};
};
