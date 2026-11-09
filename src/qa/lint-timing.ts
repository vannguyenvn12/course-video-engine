import type {CompiledTimeline} from '../compile/compile.js';
import type {LintIssue, LintReport} from './types.js';

const SYNC_WINDOW = {before: 150, after: 100};
const MIN_HOLD_MS = 1200;
const MAX_IDLE_MS = 3000;

export const lintTiming = (compiled: CompiledTimeline): LintReport => {
  const issues: LintIssue[] = [];

  for (const scene of compiled.scenes) {
    const duration = scene.endMs - scene.startMs;
    if (duration < 2500 || duration > 25000) {
      issues.push({
        rule: 'T-SCENE',
        severity: 'error',
        message: `Scene ${scene.id} duration ${duration}ms outside 2.5s–25s`,
      });
    }
    if (duration > 12000 && scene.beats.length < 3) {
      issues.push({
        rule: 'T-SCENE',
        severity: 'error',
        message: `Scene ${scene.id} >12s needs ≥3 beats`,
      });
    }

    let prevMs: number | null = null;
    for (const beat of scene.beats) {
      if (beat.do === 'reveal') {
        const drift = beat.startMs - scene.startMs;
        if (Math.abs(drift) > SYNC_WINDOW.before + scene.startMs) {
          // check anchor sync: beat should be near its own anchor, not scene start
        }
      }
      if (prevMs !== null && beat.startMs - prevMs < MIN_HOLD_MS) {
        const gap = beat.startMs - prevMs;
        if (gap < 300) {
          issues.push({
            rule: 'T-HOLD',
            severity: 'warn',
            message: `Scene ${scene.id} beat ${beat.index} follows previous after ${gap}ms`,
          });
        }
      }
      prevMs = beat.startMs;
    }

    if (scene.beats.length >= 2) {
      const gaps = scene.beats.slice(1).map((b, i) => b.startMs - scene.beats[i]!.startMs);
      const maxGap = Math.max(...gaps);
      if (maxGap > MAX_IDLE_MS) {
        issues.push({
          rule: 'T-IDLE',
          severity: 'warn',
          message: `Scene ${scene.id} has ${maxGap}ms without beats`,
        });
      }
    }
  }

  for (let i = 1; i < compiled.scenes.length; i++) {
    if (compiled.scenes[i - 1]!.endMs > compiled.scenes[i]!.startMs) {
      issues.push({
        rule: 'T-COVER',
        severity: 'error',
        message: `Scenes overlap between ${compiled.scenes[i - 1]!.id} and ${compiled.scenes[i]!.id}`,
      });
    }
    if (compiled.scenes[i]!.preset === compiled.scenes[i - 1]!.preset) {
      issues.push({
        rule: 'T-REPEAT',
        severity: 'error',
        message: `Adjacent scenes use same preset "${compiled.scenes[i]!.preset}"`,
      });
    }
  }

  const last = compiled.scenes.at(-1);
  if (last && last.endMs < compiled.durationMs - 500) {
    issues.push({
      rule: 'T-COVER',
      severity: 'error',
      message: `Timeline ends ${compiled.durationMs - last.endMs}ms before audio`,
    });
  }

  return {ok: issues.every((i) => i.severity !== 'error'), issues};
};
