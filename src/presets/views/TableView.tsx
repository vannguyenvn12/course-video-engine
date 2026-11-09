import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CompiledBeat} from '../../compile/compile.js';
import {SampleShell} from '../../design/sample-shell';
import {colors, layout, motion as motionTokens, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state';
import {ScanBeam} from '../../motion/scan-beam';

export type TableSlots = {
  title: string;
  table: {id: string; columns: string[]; rows: string[][]};
  annotation: {id: string; label: string; to: number};
};

const rowVisual = (
  rowId: string,
  rowIndex: number,
  motion: MotionState,
  tableId: string,
) => {
  const emphasized = motion.emphasized === rowId;
  const isScanTarget = motion.scanActive;
  const scanned = isScanTarget && rowIndex <= motion.scanRowIndex;
  const scanningNow = isScanTarget && rowIndex === motion.scanRowIndex;
  let opacity = 1;
  if (isScanTarget && !scanned) {
    opacity = 0.38;
  }

  const background = scanningNow
    ? colors.signalMist
    : emphasized
      ? colors.signalMist
      : scanned
        ? 'rgba(240, 232, 228, 0.03)'
        : 'transparent';

  const borderLeft = scanningNow || emphasized ? `4px solid ${colors.flare}` : '4px solid transparent';

  return {
    opacity,
    background,
    borderLeft,
    boxShadow: scanningNow ? `0 0 32px ${colors.signalMist}` : undefined,
  };
};

export const TableView: React.FC<{
  slots: TableSlots;
  motion: MotionState;
  localFrame: number;
  beats: CompiledBeat[];
}> = ({slots, motion, localFrame, beats}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const scanBeatFrame = beats.find((b) => b.do === 'scan-rows')?.frame ?? 0;
  const counterSpring =
    motion.scanActive && scanBeatFrame <= frame
      ? spring({
          frame: frame - scanBeatFrame,
          fps,
          config: {damping: 18, stiffness: 120},
        })
      : 1;
  const tableFocused = motion.dim && motion.focusId !== slots.annotation.id;
  const counterHero = motion.scanActive || motion.focusId === slots.annotation.id;
  const displayCount = Math.round(
    interpolate(
      counterSpring,
      [0, 1],
      [0, motion.counterValue ?? slots.annotation.to],
      {extrapolateRight: 'clamp'},
    ),
  );

  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.h1,
            color: colors.ink,
            letterSpacing: '-0.02em',
          }}
        >
          {slots.title}
        </div>
      </div>
      <div
        data-id={slots.table.id}
        style={{
          gridColumn: '1 / span 8',
          marginTop: 8,
          opacity: tableFocused ? motionTokens.dimUnfocused : 1,
          background: `linear-gradient(180deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
          border: `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          boxShadow: `0 24px 64px rgba(0,0,0,0.45), inset 0 1px 0 rgba(240,232,228,0.06)`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ScanBeam active={motion.scanActive} rowIndex={motion.scanRowIndex} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${slots.table.columns.length}, 1fr)`,
            padding: '14px 24px',
            color: colors.ash,
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.caption,
            background: 'rgba(0,0,0,0.25)',
            borderBottom: `1px solid ${colors.seam}`,
            textTransform: 'lowercase',
          }}
        >
          {slots.table.columns.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        {slots.table.rows.map((row, i) => {
          const rowId = `${slots.table.id}.row[${i}]`;
          const vis = rowVisual(rowId, i, motion, slots.table.id);
          return (
            <div
              key={i}
              data-id={rowId}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${slots.table.columns.length}, 1fr)`,
                padding: '14px 24px 14px 20px',
                fontFamily: typography.fontMono,
                fontSize: typography.sizes.code,
                color: colors.ink,
                borderTop: `1px solid ${colors.seam}`,
                transition: 'background 0.2s',
                ...vis,
              }}
            >
              {row.map((cell, j) => (
                <span
                  key={j}
                  style={{
                    color:
                      slots.table.columns[j] === 'status' && cell === 'shipped'
                        ? colors.ink
                        : slots.table.columns[j] === 'status'
                          ? colors.ash
                          : colors.ink,
                    fontWeight:
                      motion.emphasized === rowId && j === 1 ? typography.weights.bold : typography.weights.regular,
                  }}
                >
                  {cell}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <div
        data-id={slots.annotation.id}
        style={{
          gridColumn: '9 / span 4',
          alignSelf: 'center',
          background: counterHero
            ? `linear-gradient(145deg, ${colors.slab} 0%, ${colors.ledger} 100%)`
            : colors.slab,
          border: counterHero ? `1px solid ${colors.signal}66` : `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: layout.radiusCard,
          padding: '36px 32px',
          boxShadow: counterHero
            ? `inset 4px 0 0 ${colors.flare}, 0 0 48px ${colors.signalMist}`
            : `inset 4px 0 0 ${colors.signal}`,
          transform: counterHero ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <div
          style={{
            fontFamily: typography.fontMono,
            fontSize: 72,
            fontWeight: typography.weights.bold,
            color: counterHero ? colors.flare : colors.ink,
            lineHeight: 1,
          }}
        >
          {displayCount}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: typography.fontBody,
            fontSize: typography.sizes.caption,
            color: colors.ash,
          }}
        >
          {slots.annotation.label}
        </div>
      </div>
    </SampleShell>
  );
};
