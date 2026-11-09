import type {Timeline} from '../align/types.js';
import type {SegmentsFile} from '../segment/types.js';
import type {ScenesDsl} from '../dsl/schema.js';
import {resolveSceneBeats} from '../dsl/resolve.js';
import {targetRootId} from '../dsl/collect-targets.js';
import type {LayoutFile} from '../layout/run-layout-types.js';
import {cameraForFocus} from '../layout/camera.js';
import {routeConnector} from '../layout/connectors.js';
import type {Bbox} from '../layout/bbox.js';
import type {MeasuredBox} from '../qa/lint-geometry.js';
import {canvas} from '../design/tokens.js';

export type CompiledBeat = {
  index: number;
  frame: number;
  startMs: number;
  do: string;
  target?: string;
  camera?: ReturnType<typeof cameraForFocus>;
  connectors?: {from: string; to: string; points: {x: number; y: number}[]}[];
};

export type CompiledScene = {
  id: string;
  segment: string;
  preset: string;
  transition?: 'morph' | 'camera' | 'cut' | 'fade';
  startMs: number;
  endMs: number;
  startFrame: number;
  endFrame: number;
  beats: CompiledBeat[];
};

export type CompiledTimeline = {
  lecture: string;
  fps: number;
  durationMs: number;
  scenes: CompiledScene[];
};

const sceneTimeRange = (segmentId: string, segments: SegmentsFile) => {
  const seg = segments.segments.find((s) => s.id === segmentId)!;
  return {startMs: seg.startMs, endMs: seg.endMs};
};

export const compileTimeline = (
  dsl: ScenesDsl,
  timeline: Timeline,
  segments: SegmentsFile,
  layout: LayoutFile,
): CompiledTimeline => {
  const scenes: CompiledScene[] = [];

  for (const scene of dsl.scenes) {
    const range = sceneTimeRange(scene.segment, segments);
    const resolved = resolveSceneBeats(timeline, segments, scene.segment, scene.beats);
    const layoutScene = layout.scenes.find((s) => s.sceneId === scene.id);
    const beats: CompiledBeat[] = resolved.map((r, index) => {
      const beatLayout = layoutScene?.beats[index]?.boxes ?? {};
      const compiled: CompiledBeat = {
        index,
        frame: r.frame,
        startMs: r.startMs,
        do: r.beat.do,
        target: r.beat.target,
      };
      if ((r.beat.do === 'focus' || r.beat.do === 'draw') && r.beat.target) {
        const box = beatLayout[targetRootId(r.beat.target)] as MeasuredBox | undefined;
        if (box) {
          compiled.camera = cameraForFocus(box);
        }
      }
      if (r.beat.do === 'connect' && r.beat.from && r.beat.to) {
        const a = beatLayout[targetRootId(r.beat.from)] as MeasuredBox | undefined;
        const b = beatLayout[targetRootId(r.beat.to)] as MeasuredBox | undefined;
        if (a && b) {
          const obstacles: Bbox[] = Object.values(beatLayout)
            .filter((box) => box.id !== a.id && box.id !== b.id)
            .map(({x, y, width, height}) => ({x, y, width, height}));
          compiled.connectors = [
            {
              from: r.beat.from,
              to: r.beat.to,
              points: routeConnector(a, b, obstacles),
            },
          ];
        }
      }
      return compiled;
    });
    beats.sort((a, b) => a.startMs - b.startMs);
    beats.forEach((b, index) => {
      b.index = index;
    });

    const fps = canvas.fps;
    scenes.push({
      id: scene.id,
      segment: scene.segment,
      preset: scene.preset,
      transition: scene.transition,
      startMs: range.startMs,
      endMs: range.endMs,
      startFrame: Math.round((range.startMs / 1000) * fps),
      endFrame: Math.round((range.endMs / 1000) * fps),
      beats,
    });
  }

  if (scenes.length > 0) {
    const last = scenes.at(-1)!;
    last.endMs = timeline.audioDurationMs;
    last.endFrame = Math.round((timeline.audioDurationMs / 1000) * 30);
  }

  return {
    lecture: dsl.lecture,
    fps: 30,
    durationMs: timeline.audioDurationMs,
    scenes,
  };
};
