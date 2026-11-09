import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, motion as motionTokens, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type CompareSplitSlots = {
  title: string;
  left: {id: string; label: string};
  right: {id: string; label: string};
};

export const CompareSplitView: React.FC<{
  slots: CompareSplitSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const leftHot = motion.emphasized === slots.left.id || motion.focusId === slots.left.id;
  const rightHot = motion.emphasized === slots.right.id || motion.focusId === slots.right.id;
  const dimCold = motion.dim;
  const enter = spring({frame, fps, config: {damping: 22, stiffness: 100}});

  const lane = (id: string, label: string, hot: boolean, col: string) => (
    <div
      data-id={id}
      style={{
        gridColumn: col,
        padding: '48px 40px',
        minHeight: 320,
        background: hot
          ? `linear-gradient(160deg, ${colors.slab} 0%, ${colors.ledger} 100%)`
          : colors.slab,
        border: hot ? `1px solid ${colors.signal}66` : `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
        boxShadow: hot ? `0 0 48px ${colors.signalMist}, inset 4px 0 0 ${colors.flare}` : '0 16px 48px rgba(0,0,0,0.35)',
        opacity:
          motion.revealed.has(id) || motion.revealed.size === 0
            ? hot || !dimCold
              ? 1
              : motionTokens.dimUnfocused
            : motionTokens.dimUnfocused,
        transform: `translateY(${interpolate(enter, [0, 1], [hot ? 0 : 8, 0])}px) scale(${hot ? 1.02 : 1})`,
      }}
    >
      <div
        style={{
          fontFamily: typography.fontDisplay,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.h1,
          color: colors.ink,
          letterSpacing: '-0.02em',
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1', marginBottom: 8}}>
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
      {lane(slots.left.id, slots.left.label, leftHot, '1 / span 6')}
      {lane(slots.right.id, slots.right.label, rightHot, '7 / span 6')}
    </SampleShell>
  );
};
