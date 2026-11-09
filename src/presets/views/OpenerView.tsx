import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type OpenerSlots = {
  title: string;
  subtitle?: string;
};

export const OpenerView: React.FC<{slots: OpenerSlots; motion: MotionState; localFrame?: number}> = ({
  slots,
  motion,
  localFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 22, stiffness: 90}});
  const titleY = interpolate(enter, [0, 1], [48, 0]);
  const titleOpacity = interpolate(enter, [0, 1], [0, 1]);
  const stackLit = motion.revealed.has('page-stack') || motion.revealed.size === 0;
  const titleLit = motion.revealed.has('hero-title') || motion.revealed.size === 0;
  const emphasizePulse =
    motion.emphasized === 'hero-title' ? 1 + 0.012 * Math.sin(frame / 8) : 1;

  return (
    <SampleShell motionFrame={localFrame}>
      <div
        data-id="hero-title"
        style={{
          gridColumn: '1 / span 7',
          opacity: titleLit ? titleOpacity : 0.35,
          transform: `translateY(${titleY}px) scale(${emphasizePulse})`,
        }}
      >
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.display,
            lineHeight: 1.02,
            color: colors.ink,
            letterSpacing: '-0.03em',
            boxShadow:
              motion.emphasized === 'hero-title' ? `inset 0 -6px 0 ${colors.signal}` : undefined,
          }}
        >
          {slots.title}
        </div>
        {slots.subtitle ? (
          <div
            data-id="hero-sub"
            style={{
              marginTop: 28,
              fontFamily: typography.fontBody,
              fontWeight: typography.weights.light,
              fontSize: typography.sizes.body,
              color: colors.ash,
              maxWidth: 720,
              opacity: interpolate(enter, [0.4, 1], [0, 1], {extrapolateLeft: 'clamp'}),
              transform: `translateY(${interpolate(enter, [0.4, 1], [16, 0], {extrapolateLeft: 'clamp'})}px)`,
            }}
          >
            {slots.subtitle}
          </div>
        ) : null}
      </div>
      <div
        data-id="page-stack"
        style={{
          gridColumn: '9 / span 4',
          justifySelf: 'end',
          opacity: stackLit ? 1 : 0.35,
        }}
      >
        {[0, 1, 2].map((i) => {
          const slide = spring({
            frame: Math.max(0, frame - 6 - i * 5),
            fps,
            config: {damping: 20, stiffness: 110},
          });
          const x = interpolate(slide, [0, 1], [80, 0]);
          const op = interpolate(slide, [0, 1], [0, 1]);
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                width: 260 - i * 20,
                height: 52,
                marginBottom: 10,
                background: `linear-gradient(90deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
                border: `${layout.borderWidth}px solid ${colors.seam}`,
                borderRadius: 6,
                boxShadow:
                  i === 0 && stackLit
                    ? `inset 4px 0 0 ${colors.signal}, 0 8px 24px rgba(0,0,0,0.35)`
                    : undefined,
                padding: '12px 16px',
                fontFamily: typography.fontMono,
                fontSize: 22,
                color: colors.ash,
                transform: `translateX(${x}px)`,
                opacity: stackLit ? op : 0.35,
              }}
            >
              PAGE {8 - i}
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};
