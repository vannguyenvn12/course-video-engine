import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type MemoryBlocksSlots = {
  title: string;
  blocks: {id: string; pages: {id: string; label: string}[]};
};

export const MemoryBlocksView: React.FC<{
  slots: MemoryBlocksSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  let fillIndex = -1;
  const em = motion.emphasized;
  if (em?.includes('.page[')) {
    const m = em.match(/\[(\d+)\]/);
    if (m) {
      fillIndex = Number(m[1]);
    }
  } else if (motion.emphasized?.startsWith(`${slots.blocks.id}.page`)) {
    fillIndex = 0;
  }

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div style={{fontFamily: typography.fontDisplay, fontWeight: 700, fontSize: typography.sizes.h1, color: colors.ink}}>
          {slots.title}
        </div>
      </div>
      <div
        data-id={slots.blocks.id}
        style={{
          gridColumn: '2 / span 10',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginTop: 20,
        }}
      >
        {slots.blocks.pages.map((page, i) => {
          const id = `${slots.blocks.id}.page[${i}]`;
          const filled = fillIndex >= 0 && i <= fillIndex;
          const active = fillIndex === i;
          const pulse = spring({frame: Math.max(0, frame - i * 3), fps, config: {damping: 18, stiffness: 140}});
          return (
            <div
              key={page.id}
              data-id={id}
              style={{
                padding: '20px 16px',
                minHeight: 88,
                background: active
                  ? colors.signalMist
                  : filled
                    ? `linear-gradient(145deg, ${colors.slab}, ${colors.ledger})`
                    : colors.slab,
                border: `1px solid ${active || filled ? colors.signal : colors.seam}`,
                borderRadius: layout.radiusChip,
                borderLeft: active ? `4px solid ${colors.flare}` : filled ? `3px solid ${colors.signal}` : undefined,
                boxShadow: active ? `0 0 32px ${colors.signalMist}` : undefined,
                transform: `scale(${interpolate(pulse, [0, 1], [0.92, active ? 1.04 : 1])})`,
              }}
            >
              <PageLabel label={page.label} frame={frame} dim={!filled && !motion.revealed.has(slots.blocks.id)} />
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};

const PageLabel: React.FC<{label: string; frame: number; dim: boolean}> = ({label, frame, dim}) => (
  <div
    style={{
      fontFamily: typography.fontMono,
      fontSize: typography.sizes.caption,
      color: dim ? colors.ash : colors.ink,
      opacity: dim ? 0.45 : 0.85 + 0.1 * Math.sin(frame / 12),
    }}
  >
    {label}
  </div>
);
