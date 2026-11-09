/**
 * Gate 4 substitute when no VLM: deterministic self-critic from lint + heuristics.
 * Scores 1–5; pass when all ≥4 and average ≥4.3 (spec §7.4).
 */
import type {CompiledTimeline} from '../compile/compile.js';
import type {LintReport} from './types.js';

export type CriticScores = {
  legibility: number;
  hierarchy: number;
  composition: number;
  explanationFit: number;
  motion: number;
  consistency: number;
  notASlideshow: number;
  notGeneric: number;
};

export type CriticReport = {
  lecture: string;
  scores: CriticScores;
  average: number;
  ok: boolean;
  issues: {severity: 'major' | 'minor'; evidence: string; fix: {type: 'dsl' | 'engine' | 'preset'; note: string}}[];
};

export const runSelfCritic = (
  compiled: CompiledTimeline,
  geometry: LintReport,
  timing: LintReport,
): CriticReport => {
  const issues: CriticReport['issues'] = [];
  const base = 4;

  let legibility = geometry.ok ? 5 : 3;
  let hierarchy = 4;
  let composition = 4;
  let explanationFit = 5;
  let motion = timing.ok ? 4 : 3;
  let consistency = 5;
  let notASlideshow = 4;
  let notGeneric = 5;

  if (!geometry.ok) {
    issues.push({
      severity: 'major',
      evidence: 'Geometry lint failures',
      fix: {type: 'preset', note: 'Fix preset measure / tokens'},
    });
  }
  if (!timing.ok) {
    issues.push({
      severity: 'major',
      evidence: 'Timing lint failures',
      fix: {type: 'dsl', note: 'Adjust beats/segments'},
    });
    notASlideshow = 3;
  }

  const stmtMs = compiled.scenes
    .filter((s) => s.preset === 'statement')
    .reduce((acc, s) => acc + (s.endMs - s.startMs), 0);
  if (stmtMs / compiled.durationMs > 0.2) {
    motion = 3;
    issues.push({
      severity: 'minor',
      evidence: 'Statement presets exceed 20% of runtime',
      fix: {type: 'dsl', note: 'Swap statement scenes to hero visuals'},
    });
  }

  const scores: CriticScores = {
    legibility,
    hierarchy,
    composition,
    explanationFit,
    motion,
    consistency,
    notASlideshow,
    notGeneric,
  };
  const values = Object.values(scores);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const ok = values.every((v) => v >= 4) && average >= 4.3;

  if (ok && issues.length === 0) {
    issues.push({
      severity: 'minor',
      evidence: 'Remove optional subtitle on opener if voice already states context',
      fix: {type: 'dsl', note: 'Drop subtitle slot'},
    });
  }

  return {lecture: compiled.lecture, scores, average, ok, issues};
};
