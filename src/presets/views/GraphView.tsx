import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {canvas, colors, layout, typography} from '../../design/tokens';
import {SampleShell} from '../../design/sample-shell';
import type {MotionState} from '../../motion/beat-state';

export type GraphSlots = {
  title: string;
  graph: {
    id: string;
    nodes: {id: string; label: string}[];
    edges: [string, string][];
  };
};

const layoutNodes = (nodes: GraphSlots['graph']['nodes']): {id: string; x: number; y: number}[] => {
  const w = canvas.width - 192 * 2;
  const step = w / Math.max(1, nodes.length - 1);
  return nodes.map((n, i) => ({
    id: n.id,
    x: 192 + i * step,
    y: 420 + (i % 2) * 120,
  }));
};

export const GraphView: React.FC<{slots: GraphSlots; motion: MotionState; localFrame?: number}> = ({
  slots,
  motion,
  localFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pos = layoutNodes(slots.graph.nodes);
  const byId = new Map(pos.map((p) => [p.id, p]));
  const hotNode = motion.emphasized?.replace(/^.*\.node\[/, '').replace(/\]$/, '');

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div style={{fontFamily: typography.fontDisplay, fontWeight: 700, fontSize: typography.sizes.h1, color: colors.ink}}>
          {slots.title}
        </div>
      </div>
      <div data-id={slots.graph.id} style={{gridColumn: '1 / -1', position: 'relative', height: 520, marginTop: 8 }}>
        <svg width={canvas.width - 192} height={520} style={{marginLeft: -layout.safeArea}}>
          {slots.graph.edges.map(([a, b], i) => {
            const from = byId.get(a);
            const to = byId.get(b);
            if (!from || !to) {
              return null;
            }
            const progress = spring({
              frame: Math.max(0, frame - 8 - i * 6),
              fps,
              config: {damping: 24, stiffness: 100},
            });
            const len = Math.hypot(to.x - from.x, to.y - from.y);
            return (
              <line
                key={`${a}-${b}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={colors.flare}
                strokeWidth={2}
                strokeDasharray={len}
                strokeDashoffset={len * (1 - progress)}
                opacity={0.5 + progress * 0.5}
              />
            );
          })}
        </svg>
        {slots.graph.nodes.map((node, i) => {
          const p = byId.get(node.id)!;
          const active = hotNode === node.id || hotNode === String(i);
          const appear = spring({frame: Math.max(0, frame - i * 4), fps});
          return (
            <div
              key={node.id}
              data-id={`${slots.graph.id}.node[${i}]`}
              style={{
                position: 'absolute',
                left: p.x - 90,
                top: p.y - 32,
                width: 180,
                padding: '14px 16px',
                textAlign: 'center',
                fontFamily: typography.fontMono,
                fontSize: typography.sizes.caption,
                color: colors.ink,
                background: active ? colors.signalMist : colors.slab,
                border: `1px solid ${active ? colors.signal : colors.seam}`,
                borderRadius: layout.radiusCard,
                boxShadow: active ? `0 0 40px ${colors.signalMist}` : undefined,
                opacity: interpolate(appear, [0, 1], [0.3, 1]),
              }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};
