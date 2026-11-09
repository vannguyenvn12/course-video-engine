import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {TimelineSchema} from '../align/types.js';
import {SegmentsFileSchema} from '../segment/types.js';
import {getPreset} from '../presets/registry.js';
import {ScenesDslSchema, type ScenesDsl} from './schema.js';
import {collectSlotIds, targetExists} from './collect-targets.js';
import {resolveWordAnchorMs} from './resolve.js';
import type {LintIssue} from '../qa/types.js';

export type SchemaGateReport = {
  ok: boolean;
  issues: LintIssue[];
};

export const loadDsl = (lectureDir: string): ScenesDsl => {
  const path = join(lectureDir, 'scenes.dsl.json');
  if (!existsSync(path)) {
    throw new Error(`Missing scenes.dsl.json in ${lectureDir}`);
  }
  return ScenesDslSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
};

export const runSchemaGate = (lectureDir: string, outDir: string): SchemaGateReport => {
  const dsl = loadDsl(lectureDir);
  const timeline = TimelineSchema.parse(
    JSON.parse(readFileSync(join(outDir, 'timeline.json'), 'utf8')),
  );
  const segments = SegmentsFileSchema.parse(
    JSON.parse(readFileSync(join(outDir, 'segments.json'), 'utf8')),
  );

  const issues: LintIssue[] = [];

  for (const scene of dsl.scenes) {
    let preset;
    try {
      preset = getPreset(scene.preset);
    } catch {
      issues.push({
        rule: 'GATE-SCHEMA',
        severity: 'error',
        message: `Unknown preset "${scene.preset}" in scene ${scene.id}`,
        hint: 'Choose a preset from registry or add preset implementation.',
      });
      continue;
    }

    const slotsResult = preset.schema.safeParse(scene.slots);
    if (!slotsResult.success) {
      issues.push({
        rule: 'GATE-SCHEMA',
        severity: 'error',
        message: `Invalid slots for ${scene.preset} in ${scene.id}: ${slotsResult.error.message}`,
      });
      continue;
    }

    const slotIds = new Set([...collectSlotIds(scene.slots), ...preset.measureDataIds]);

    if (!segments.segments.some((s) => s.id === scene.segment)) {
      issues.push({
        rule: 'GATE-SCHEMA',
        severity: 'error',
        message: `Scene ${scene.id} references missing segment ${scene.segment}`,
      });
    }

    for (const beat of scene.beats) {
      if (beat.target && !targetExists(beat.target, slotIds)) {
        issues.push({
          rule: 'GATE-SCHEMA',
          severity: 'error',
          message: `Beat target "${beat.target}" not found in slots of ${scene.id}`,
          hint: 'Add id to slot object or fix target path.',
        });
      }
      if ('word' in beat.at) {
        try {
          resolveWordAnchorMs(timeline, scene.segment, segments, beat.at);
        } catch (e) {
          issues.push({
            rule: 'GATE-SCHEMA',
            severity: 'error',
            message: String(e),
            hint: 'Fix anchor word or occurrence to match segment transcript.',
          });
        }
      }
    }
  }

  for (const scene of dsl.scenes) {
    const title = scene.slots.title;
    if (typeof title === 'string') {
      const words = title.split(/\s+/).filter(Boolean);
      if (words.length > 8) {
        issues.push({
          rule: 'GATE-SCHEMA',
          severity: 'error',
          message: `Scene ${scene.id} title has ${words.length} words (max 8)`,
        });
      }
    }
  }
  return {ok: issues.every((i) => i.severity !== 'error'), issues};
};
