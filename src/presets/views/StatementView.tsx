import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export const StatementView: React.FC<{
  slots: {statement: string};
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 20, stiffness: 90}});

  return (
    <SampleShell motionFrame={localFrame}>
      <div
        data-id="statement"
        style={{
          gridColumn: '2 / span 10',
          padding: '48px 56px',
          background: `linear-gradient(135deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          borderLeft: `4px solid ${colors.signal}`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          opacity: motion.emphasized === 'statement' || !motion.dim ? 1 : 0.75,
          transform: `translateY(${interpolate(enter, [0, 1], [32, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.display,
            color: colors.ink,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        >
          {slots.statement}
        </div>
      </div>
    </SampleShell>
  );
};
