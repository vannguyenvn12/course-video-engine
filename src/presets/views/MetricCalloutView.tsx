import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type MetricCalloutSlots = {
  title?: string;
  metric: {id: string; value: string; unit?: string};
};

export const MetricCalloutView: React.FC<{
  slots: MetricCalloutSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hero = motion.emphasized === slots.metric.id || motion.focusId === slots.metric.id;
  const pop = spring({frame, fps, config: {damping: 16, stiffness: 120}});

  return (
    <SampleShell motionFrame={localFrame}>
      {slots.title ? (
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
      ) : null}
      <div
        data-id={slots.metric.id}
        style={{
          gridColumn: '3 / span 8',
          textAlign: 'center',
          padding: '64px 48px',
          background: `linear-gradient(145deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: hero ? `1px solid ${colors.signal}77` : `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          boxShadow: hero ? `0 0 64px ${colors.signalMist}` : '0 32px 80px rgba(0,0,0,0.5)',
          transform: `scale(${interpolate(pop, [0, 1], [0.94, hero ? 1.04 : 1])})`,
        }}
      >
        <div
          style={{
            fontFamily: typography.fontMono,
            fontSize: 120,
            fontWeight: typography.weights.bold,
            color: hero ? colors.flare : colors.ink,
            lineHeight: 1,
          }}
        >
          {slots.metric.value}
          {slots.metric.unit ? (
            <span style={{fontSize: 48, color: colors.ash, marginLeft: 12}}>{slots.metric.unit}</span>
          ) : null}
        </div>
      </div>
    </SampleShell>
  );
};
