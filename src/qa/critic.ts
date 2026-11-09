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

const HERO_VERBS = new Set([
  'scan-rows',
  'connect',
  'traverse',
  'draw',
  'type-code',
  'highlight-lines',
  'count',
]);

export const runSelfCritic = (
  compiled: CompiledTimeline,
  geometry: LintReport,
  timing: LintReport,
): CriticReport => {
  const issues: CriticReport['issues'] = [];

  let legibility = geometry.ok ? 5 : 3;
  let consistency = 5;
  let explanationFit = 5;

  const presets = new Set(compiled.scenes.map((s) => s.preset));
  const beats = compiled.scenes.flatMap((s) => s.beats);
  const heroBeatCount = beats.filter((b) => HERO_VERBS.has(b.do)).length;
  const morphScenes = compiled.scenes.filter((s) => s.transition === 'morph' || s.transition === 'camera')
    .length;
  const idleWarns = timing.issues.filter((i) => i.rule === 'T-IDLE').length;
  const repeatPresets = compiled.scenes.length - presets.size;

  let hierarchy = presets.size >= 4 ? 5 : presets.size >= 3 ? 4 : 3;
  let composition =
    compiled.scenes.length >= 5 ? 5 : compiled.scenes.length >= 3 ? 4 : 3;

  let motion = 3;
  if (heroBeatCount >= 4 && morphScenes >= 2) {
    motion = 5;
  } else if (heroBeatCount >= 2) {
    motion = 4;
  }
  if (!timing.ok) {
    motion = Math.min(motion, 3);
  }

  let notASlideshow = motion;
  if (idleWarns > 0) {
    notASlideshow = Math.max(3, notASlideshow - 1);
    issues.push({
      severity: 'minor',
      evidence: `${idleWarns} segment(s) with >3s gap between beats (T-IDLE)`,
      fix: {type: 'dsl', note: 'Add anchor beats or after+gap holds'},
    });
  }
  if (heroBeatCount < 2) {
    notASlideshow = Math.min(notASlideshow, 3);
    issues.push({
      severity: 'major',
      evidence: 'Few hero motion beats (scan/connect/traverse)',
      fix: {type: 'dsl', note: 'Add scan-rows, connect, or traverse beats'},
    });
  }

  let notGeneric = presets.size >= 4 && repeatPresets === 0 ? 5 : 4;

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
  }

  const stmtMs = compiled.scenes
    .filter((s) => s.preset === 'statement')
    .reduce((acc, s) => acc + (s.endMs - s.startMs), 0);
  if (stmtMs / compiled.durationMs > 0.2) {
    motion = Math.min(motion, 3);
    notASlideshow = Math.min(notASlideshow, 3);
    issues.push({
      severity: 'minor',
      evidence: 'Statement presets exceed 20% of runtime',
      fix: {type: 'dsl', note: 'Swap statement scenes to hero visuals'},
    });
  }

  if (hierarchy < 4) {
    issues.push({
      severity: 'minor',
      evidence: 'Low preset diversity',
      fix: {type: 'dsl', note: 'Use more distinct presets per scene'},
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

  return {lecture: compiled.lecture, scores, average, ok, issues};
};
