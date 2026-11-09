import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type LanesTimelineSlots = {
  title: string;
  lanes: {id: string; label: string}[];
};

export const LanesTimelineView: React.FC<{
  slots: LanesTimelineSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div style={{fontFamily: typography.fontDisplay, fontWeight: 700, fontSize: typography.sizes.h1, color: colors.ink}}>
          {slots.title}
        </div>
      </div>
      <div data-id="lanes" style={{gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 28, marginTop: 24 }}>
        {slots.lanes.map((lane, i) => {
          const active = motion.emphasized === lane.id || motion.focusId === lane.id;
          const progress = spring({frame: Math.max(0, frame - i * 10), fps, config: {damping: 20, stiffness: 90}});
          const barW = interpolate(progress, [0, 1], [0, 72]);
          return (
            <div key={lane.id} data-id={lane.id} style={{opacity: motion.revealed.has(lane.id) || motion.revealed.size === 0 ? 1 : 0.4}}>
              <div style={{fontFamily: typography.fontBody, fontSize: typography.sizes.caption, color: colors.ash, marginBottom: 10 }}>
                {lane.label}
              </div>
              <LaneBar widthPercent={barW} active={active} frame={frame} />
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};

const LaneBar: React.FC<{widthPercent: number; active: boolean; frame: number}> = ({
  widthPercent,
  active,
  frame,
}) => (
  <div
    style={{
      position: 'relative',
      height: 14,
      background: colors.ledger,
      borderRadius: layout.radiusChip,
      overflow: 'hidden',
      border: `1px solid ${colors.seam}`,
    }}
  >
    <div
      style={{
        width: `${widthPercent}%`,
        height: '100%',
        background: active ? `linear-gradient(90deg, ${colors.signal}, ${colors.flare})` : colors.seam,
        boxShadow: active ? `0 0 24px ${colors.signalMist}` : undefined,
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${(frame * 2) % 100}%`,
        width: 40,
        height: '100%',
        background: `linear-gradient(90deg, transparent, rgba(240,232,228,0.15), transparent)`,
      }}
    />
  </div>
);
