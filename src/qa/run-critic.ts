import type {CompiledTimeline} from '../compile/compile.js';
import type {LintReport} from './types.js';
import {runSelfCritic, type CriticReport, type CriticScores} from './critic.js';
import {runSpatialCritic} from './spatial-critic.js';
import {runAgenticCritic} from './agentic-critic.js';
import {join} from 'node:path';

/** Gate 4 in this repo: deterministic + spatial + review-pack (Cursor agent reads PNGs). No API keys. */
export type CriticMode = 'agentic';

const mergeScores = (base: CriticScores, ...deltas: Partial<CriticScores>[]): CriticScores => {
  const out = {...base};
  for (const delta of deltas) {
    for (const k of Object.keys(delta) as (keyof CriticScores)[]) {
      const v = delta[k];
      if (typeof v === 'number') {
        out[k] = Math.min(out[k], v);
      }
    }
  }
  return out;
};

const finalize = (lecture: string, scores: CriticScores, issues: CriticReport['issues']): CriticReport => {
  const values = Object.values(scores);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const ok = values.every((v) => v >= 4) && average >= 4.3;
  return {lecture, scores, average, ok, issues};
};

const pushIssues = (issues: CriticReport['issues'], messages: string[]) => {
  for (const msg of messages) {
    issues.push({
      severity: msg.includes('missing') || msg.includes('invalid') ? 'major' : 'minor',
      evidence: msg,
      fix: {type: msg.startsWith('G-') ? 'preset' : 'dsl', note: msg},
    });
  }
};

export const runCritic = async (
  compiled: CompiledTimeline,
  geometry: LintReport,
  timing: LintReport,
  outDir: string,
): Promise<{report: CriticReport; mode: CriticMode}> => {
  void join(outDir, 'review');
  const heuristic = runSelfCritic(compiled, geometry, timing);
  const spatial = runSpatialCritic(compiled, geometry, outDir);
  const agentic = runAgenticCritic(compiled, geometry, timing, outDir);

  const issues = [...heuristic.issues];
  pushIssues(issues, spatial.issues);
  pushIssues(issues, agentic.issues);

  const merged = mergeScores(heuristic.scores, spatial.scoreDelta, agentic.scoreDelta);
  const report = finalize(compiled.lecture, merged, issues);
  return {report, mode: 'agentic'};
};
