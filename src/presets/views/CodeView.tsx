import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HighlightedSqlLine} from '../../design/HighlightedSqlLine';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, motion as motionTokens, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type CodeSlots = {
  title: string;
  code: {id: string; lines: string[]};
};

export const CodeView: React.FC<{slots: CodeSlots; motion: MotionState; localFrame?: number}> = ({
  slots,
  motion,
  localFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const panelRevealed = motion.revealed.has(slots.code.id) || motion.revealed.size === 0;
  const panelSpring = panelRevealed
    ? spring({frame, fps, config: {damping: 22, stiffness: 100}})
  : 0;
  const panelOpacity = panelRevealed ? interpolate(panelSpring, [0, 1], [0.25, 1]) : motionTokens.dimUnfocused;

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
      <div
        data-id={slots.code.id}
        style={{
          opacity: panelOpacity,
          gridColumn: '2 / span 10',
          marginTop: 16,
          background: `linear-gradient(180deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          padding: '8px 0',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(240,232,228,0.05)',
          transform: `translateY(${interpolate(panelSpring, [0, 1], [24, 0])}px)`,
        }}
      >
        {slots.code.lines.map((line, i) => {
          const lineId = `${slots.code.id}.line[${i}]`;
          const hot = motion.emphasized === lineId;
          const lineRevealed = motion.revealed.has(lineId) || motion.revealed.has(slots.code.id);
          const lineSpring = lineRevealed
            ? spring({frame: Math.max(0, frame - i * 4), fps, config: {damping: 24, stiffness: 130}})
            : 0;
          return (
            <div
              key={i}
              data-id={lineId}
              style={{
                fontFamily: typography.fontMono,
                fontSize: typography.sizes.code,
                lineHeight: 1.55,
                color: colors.ink,
                padding: '10px 36px 10px 32px',
                background: hot ? colors.signalMist : 'transparent',
                borderLeft: hot ? `4px solid ${colors.flare}` : '4px solid transparent',
                opacity: lineRevealed ? interpolate(lineSpring, [0, 1], [0.15, 1]) : motionTokens.dimUnfocused,
                boxShadow: hot ? `inset 0 0 40px ${colors.signalMist}` : undefined,
              }}
            >
              <HighlightedSqlLine text={line} />
            </div>
          );
        })}
      </div>
    </SampleShell>
  );
};
