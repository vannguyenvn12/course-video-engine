import {describe, expect, it} from 'vitest';
import {cameraForFocus} from '../src/layout/camera.js';
import {routeConnector} from '../src/layout/connectors.js';
import {DslResolveError, resolveWordAnchorMs} from '../src/dsl/resolve.js';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {TimelineSchema} from '../src/align/types.js';
import {SegmentsFileSchema} from '../src/segment/types.js';
import {runSchemaGate} from '../src/dsl/validate-gate.js';
import {runCompile} from '../src/compile/run-compile.js';
import {runLayout} from '../src/layout/run-layout.js';

const fixtureDir = join(process.cwd(), 'lectures', 'postgres', 'fixture-seq-scan');
const outDir = join(process.cwd(), 'out', 'fixture-seq-scan');

describe('Phase 2 — DSL, layout, compile', () => {
  it('connector route avoids text obstacle', () => {
    const from = {x: 100, y: 400, width: 80, height: 40};
    const to = {x: 900, y: 400, width: 80, height: 40};
    const obstacle = {x: 480, y: 380, width: 120, height: 80};
    const path = routeConnector(from, to, [obstacle]);
    expect(path.length).toBeGreaterThanOrEqual(3);
    const crossesObstacle = path.some((p) => p.x > obstacle.x && p.x < obstacle.x + obstacle.width);
    expect(crossesObstacle).toBe(false);
  });

  it('camera keeps focus target in safe area', () => {
    const target = {x: 1200, y: 200, width: 300, height: 120};
    const cam = cameraForFocus(target);
    expect(cam.scale).toBeLessThanOrEqual(1.25);
  });

  it('anchor resolution errors clearly', () => {
    const timeline = TimelineSchema.parse(
      JSON.parse(readFileSync(join(outDir, 'timeline.json'), 'utf8')),
    );
    const segments = SegmentsFileSchema.parse(
      JSON.parse(readFileSync(join(outDir, 'segments.json'), 'utf8')),
    );
    expect(() =>
      resolveWordAnchorMs(timeline, 'seg-01', segments, {word: 'nonexistent'}),
    ).toThrow(DslResolveError);
  });

  it('schema gate and compile pipeline', async () => {
    const schema = runSchemaGate(fixtureDir, outDir);
    expect(schema.ok).toBe(true);
    process.env.LAYOUT_FALLBACK = '1';
    await runLayout(fixtureDir, outDir);
    const {compiled} = runCompile(fixtureDir, outDir);
    expect(compiled.scenes.length).toBe(3);
    expect(compiled.scenes[0]!.beats[0]!.frame).toBeGreaterThanOrEqual(0);
  });
});
