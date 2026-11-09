import {existsSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import type {CompiledTimeline} from '../compile/compile.js';
import type {LintReport} from './types.js';
import type {CriticScores} from './critic.js';

export type AgenticCriticResult = {
  agenticOk: boolean;
  issues: string[];
  scoreDelta: Partial<CriticScores>;
  reviewPack: {contactSheet: boolean; filmstrips: number; stills: number; context: boolean};
};

const MIN_PNG_BYTES = 4_000;

export const runAgenticCritic = (
  compiled: CompiledTimeline,
  geometry: LintReport,
  timing: LintReport,
  outDir: string,
): AgenticCriticResult => {
  const reviewDir = join(outDir, 'review');
  const issues: string[] = [];
  const scoreDelta: Partial<CriticScores> = {};

  const contact = join(reviewDir, 'contact-sheet.png');
  const context = join(reviewDir, 'context.md');
  const contactSheet = existsSync(contact) && statSync(contact).size >= MIN_PNG_BYTES;
  const contextOk = existsSync(context);

  let filmstrips = 0;
  let stills = 0;
  for (const scene of compiled.scenes) {
    const strip = join(reviewDir, `filmstrip-${scene.id}.png`);
    const still = join(reviewDir, `scene-${scene.id}.png`);
    if (existsSync(strip) && statSync(strip).size >= MIN_PNG_BYTES) {
      filmstrips++;
    }
    if (existsSync(still) && statSync(still).size >= MIN_PNG_BYTES) {
      stills++;
    }
  }

  if (!contactSheet) {
    issues.push('Review pack missing contact-sheet.png (agent cannot verify composition)');
    scoreDelta.composition = 3;
  }
  if (stills < compiled.scenes.length) {
    issues.push(`Scene stills ${stills}/${compiled.scenes.length}`);
    scoreDelta.legibility = 3;
  }
  if (filmstrips < compiled.scenes.length) {
    issues.push(`Filmstrips ${filmstrips}/${compiled.scenes.length} (motion rubric needs strips)`);
    scoreDelta.motion = Math.min(scoreDelta.motion ?? 5, 3);
  }
  if (!contextOk) {
    issues.push('review/context.md missing');
    scoreDelta.explanationFit = 3;
  }

  const idleErrors = timing.issues.filter((i) => i.rule === 'T-IDLE');
  if (idleErrors.length >= 2) {
    issues.push(`Multiple T-IDLE gaps (${idleErrors.length}) — slideshow risk`);
    scoreDelta.notASlideshow = 3;
  } else if (idleErrors.length === 1) {
    issues.push('One T-IDLE gap — add after-beats or hero motion');
    scoreDelta.notASlideshow = 4;
  }

  const tells = geometry.issues.filter((i) => i.rule === 'G-TELLS' || i.rule === 'G-ENTRANCE');
  if (tells.length) {
    issues.push(`G-TELLS/G-ENTRANCE: ${tells.length} (not-generic smell)`);
    scoreDelta.notGeneric = Math.min(scoreDelta.notGeneric ?? 5, 3);
  }

  const morph = compiled.scenes.filter((s) => s.transition === 'morph' || s.transition === 'camera').length;
  if (compiled.scenes.length >= 4 && morph < 2) {
    issues.push('Few morph/camera transitions for multi-scene lecture');
    scoreDelta.motion = Math.min(scoreDelta.motion ?? 5, 3);
  }

  const agenticOk =
    contactSheet &&
    filmstrips >= compiled.scenes.length &&
    stills >= compiled.scenes.length &&
    contextOk &&
    !issues.some((i) => i.includes('missing contact-sheet'));

  if (agenticOk && idleErrors.length === 0 && tells.length === 0) {
    scoreDelta.consistency = 5;
    scoreDelta.notGeneric = 5;
  }

  const checklistPath = join(reviewDir, 'AGENT_CHECKLIST.md');
  if (agenticOk) {
    const body = `# Agent visual pass (no API)

Open in IDE **before** declaring lecture done:

1. \`contact-sheet.png\` — hierarchy & composition (1s test).
2. Each \`filmstrip-*.png\` — motion not slideshow.
3. Compare \`context.md\` + DSL: explanation fit.
4. If anything <4 mentally, patch DSL/engine and re-run \`pnpm qa\`.

Deterministic gates already passed; this is the Opus editorial bar.
`;
    writeFileSync(checklistPath, body, 'utf8');
  }

  return {
    agenticOk,
    issues,
    scoreDelta,
    reviewPack: {contactSheet, filmstrips, stills, context: contextOk},
  };
};
