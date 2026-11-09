import {interpolate, useCurrentFrame} from 'remotion';
import type {CompiledBeat} from '../compile/compile.js';
import {colors, canvas} from '../design/tokens.js';

const DRAW_FRAMES = 27;

const toD = (points: {x: number; y: number}[]): string =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

const polylineLength = (points: {x: number; y: number}[]): number => {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
};

export const ConnectorOverlay: React.FC<{beats: CompiledBeat[]}> = ({beats}) => {
  const frame = useCurrentFrame();
  const segments: {d: string; dash: number; progress: number; key: string}[] = [];

  for (const beat of beats) {
    if (beat.frame > frame || !beat.connectors?.length) {
      continue;
    }
    const progress = interpolate(
      frame,
      [beat.frame, beat.frame + DRAW_FRAMES],
      [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
    );
    for (const c of beat.connectors) {
      const dash = Math.max(40, polylineLength(c.points));
      segments.push({d: toD(c.points), dash, progress, key: `${beat.index}-${c.from}-${c.to}`});
    }
  }

  if (segments.length === 0) {
    return null;
  }

  return (
    <svg
      aria-hidden
      data-id="decorative"
      width={canvas.width}
      height={canvas.height}
      style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible'}}
    >
      <defs>
        <filter id="connector-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {segments.map((seg) => (
        <path
          key={seg.key}
          d={seg.d}
          fill="none"
          stroke={colors.flare}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={seg.dash}
          strokeDashoffset={seg.dash * (1 - seg.progress)}
          opacity={0.92}
          filter="url(#connector-glow)"
        />
      ))}
    </svg>
  );
};
