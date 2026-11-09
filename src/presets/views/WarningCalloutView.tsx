import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type WarningCalloutSlots = {
  title: string;
  warning: string;
};

export const WarningCalloutView: React.FC<{
  slots: WarningCalloutSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 16, stiffness: 100}});
  const pulse = 1 + 0.008 * Math.sin(frame / 6);
  const emphasized = motion.emphasized === 'warning';

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div style={{fontFamily: typography.fontDisplay, fontWeight: 700, fontSize: typography.sizes.h1, color: colors.ink}}>
          {slots.title}
        </div>
      </div>
      <div
        data-id="warning"
        style={{
          gridColumn: '2 / span 10',
          padding: '40px 48px',
          marginTop: 16,
          background: `linear-gradient(135deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: `2px solid ${colors.signal}`,
          borderRadius: layout.radiusCard,
          boxShadow: emphasized
            ? `0 0 64px ${colors.signalMist}, inset 0 0 0 1px ${colors.flare}`
            : `0 24px 64px rgba(0,0,0,0.5)`,
          transform: `translateY(${interpolate(enter, [0, 1], [40, 0])}px) scale(${pulse})`,
        }}
      >
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.h1,
            color: colors.ink,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
          }}
        >
          {slots.warning}
        </div>
      </div>
    </SampleShell>
  );
};
