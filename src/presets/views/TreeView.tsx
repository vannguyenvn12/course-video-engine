import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type TreeSlots = {
  title: string;
  tree: {id: string; nodes: {id: string; label: string}[]};
};

const nodeKey = (treeId: string, index: number) => `${treeId}.node[${index}]`;

export const TreeView: React.FC<{slots: TreeSlots; motion: MotionState; localFrame?: number}> = ({
  slots,
  motion,
  localFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let pathIndex = -1;
  if (motion.emphasized?.startsWith(`${slots.tree.id}.node[`)) {
    const m = motion.emphasized.match(/\[(\d+)\]/);
    if (m) {
      pathIndex = Number(m[1]);
    }
  }

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.h1,
            color: colors.ink,
          }}
        >
          {slots.title}
        </div>
      </div>
      <div data-id={slots.tree.id} style={{gridColumn: '2 / span 10', marginTop: 24}}>
        {slots.tree.nodes.map((node, i) => {
          const id = nodeKey(slots.tree.id, i);
          const onPath = pathIndex >= 0 && i <= pathIndex;
          const active = pathIndex === i;
          const appear = spring({frame: Math.max(0, frame - i * 5), fps, config: {damping: 22, stiffness: 120}});
          const lit = onPath || motion.revealed.has(slots.tree.id);
          return (
            <div
              key={node.id}
              data-id={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: i * 52,
                marginBottom: 20,
                opacity: lit ? interpolate(appear, [0, 1], [0.25, 1]) : 0.35,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: active ? colors.flare : onPath ? colors.signal : colors.seam,
                  boxShadow: active ? `0 0 28px ${colors.signal}` : undefined,
                }}
              />
              {i > 0 && lit ? (
                <MotionSvgLink frame={frame} i={i} />
              ) : (
                <span style={{width: 36}} />
              )}
              <div
                style={{
                  marginLeft: 4,
                  padding: '12px 22px',
                  fontFamily: typography.fontMono,
                  fontSize: typography.sizes.code,
                  color: colors.ink,
                  background: active ? colors.signalMist : colors.slab,
                  border: `${layout.borderWidth}px solid ${active ? colors.signal : colors.seam}`,
                  borderRadius: layout.radiusChip,
                  borderLeft: active ? `4px solid ${colors.flare}` : '4px solid transparent',
                }}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};

const MotionSvgLink: React.FC<{frame: number; i: number}> = ({frame, i}) => {
  const len = interpolate((frame + i * 3) % 30, [0, 30], [0, 1]);
  return (
    <svg width={36} height={12} style={{marginLeft: 4, opacity: 0.6 + len * 0.4}}>
      <line
        x1={0}
        y1={6}
        x2={36}
        y2={6}
        stroke={colors.flare}
        strokeWidth={2}
        strokeDasharray={36}
        strokeDashoffset={36 * (1 - len)}
      />
    </svg>
  );
};
