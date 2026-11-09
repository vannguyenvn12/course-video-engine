import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SampleShell} from '../../design/sample-shell';
import {HighlightedSqlLine} from '../../design/HighlightedSqlLine';
import {colors, layout, motion as motionTokens, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';

export type CodePlusOutputSlots = {
  title: string;
  code: {id: string; lines: string[]};
  output: {id: string; lines: string[]};
};

export const CodePlusOutputView: React.FC<{
  slots: CodePlusOutputSlots;
  motion: MotionState;
  localFrame?: number;
}> = ({slots, motion, localFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const codeOn = motion.revealed.has(slots.code.id) || motion.revealed.size === 0;
  const planOn = motion.revealed.has(slots.output.id);
  const planHero = motion.focusId === slots.output.id || motion.emphasized?.startsWith(slots.output.id);
  const typing = motion.revealed.has(slots.code.id) && !planOn;

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
          gridColumn: '1 / span 6',
          marginTop: 12,
          opacity: codeOn ? 1 : motionTokens.dimUnfocused,
          background: `linear-gradient(180deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          padding: '8px 0',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
          transform: `translateY(${interpolate(spring({frame, fps}), [0, 1], [20, 0])}px)`,
        }}
      >
        {slots.code.lines.map((line, i) => {
          const lineId = `${slots.code.id}.line[${i}]`;
          const hot = motion.emphasized === lineId;
          return (
            <div
              key={i}
              data-id={lineId}
              style={{
                fontFamily: typography.fontMono,
                fontSize: typography.sizes.code,
                lineHeight: 1.5,
                color: colors.ink,
                padding: '10px 28px',
                background: hot ? colors.signalMist : 'transparent',
                borderLeft: hot ? `4px solid ${colors.flare}` : '4px solid transparent',
              }}
            >
              {typing ? (
                <TypeLine text={line} frame={frame} lineIndex={i} />
              ) : (
                <HighlightedSqlLine text={line} />
              )}
            </div>
          );
        })}
      </div>
      <div
        data-id={slots.output.id}
        style={{
          gridColumn: '8 / span 5',
          alignSelf: 'center',
          opacity: planOn ? 1 : motionTokens.dimUnfocused,
          background: planHero
            ? `linear-gradient(145deg, ${colors.slab} 0%, ${colors.ledger} 100%)`
            : colors.slab,
          border: planHero ? `1px solid ${colors.signal}55` : `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          padding: '28px 24px',
          boxShadow: planHero
            ? `inset 4px 0 0 ${colors.flare}, 0 0 40px ${colors.signalMist}`
            : `inset 3px 0 0 ${colors.signal}`,
        }}
      >
        {slots.output.lines.map((line, i) => (
          <div
            key={i}
            data-id={`${slots.output.id}.line[${i}]`}
            style={{
              fontFamily: typography.fontMono,
              fontSize: i === 0 ? typography.sizes.body : typography.sizes.caption,
              color: i === 0 ? colors.ink : colors.ash,
              fontWeight: i === 0 ? typography.weights.bold : typography.weights.regular,
              marginBottom: i < slots.output.lines.length - 1 ? 10 : 0,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </SampleShell>
  );
};

const TypeLine: React.FC<{text: string; frame: number; lineIndex: number}> = ({text, frame, lineIndex}) => {
  const start = lineIndex * 8;
  const visible = Math.min(text.length, Math.max(0, frame - start));
  return <HighlightedSqlLine text={text.slice(0, visible)} />;
};
