import {interpolate, useCurrentFrame} from 'remotion';
import {colors, layout, typography} from '../design/tokens.js';
import {MORPH_FRAMES} from './scene-transition.js';

export type PersistTableEcho = {
  id: string;
  columns: string[];
  rows: string[][];
};

export const PersistTableEcho: React.FC<{
  table: PersistTableEcho;
  morphPhase: 'enter' | 'exit' | 'none';
}> = ({table, morphPhase}) => {
  const frame = useCurrentFrame();
  if (morphPhase === 'none') {
    return null;
  }

  const t =
    morphPhase === 'enter'
      ? interpolate(frame, [0, MORPH_FRAMES], [0, 1], {extrapolateRight: 'clamp'})
      : interpolate(frame, [0, MORPH_FRAMES], [1, 0], {extrapolateRight: 'clamp'});

  const scale = interpolate(t, [0, 1], [0.88, 0.72]);
  const opacity = interpolate(t, [0, 0.4, 1], [0, 0.85, 0.25]);
  const y = interpolate(t, [0, 1], [40, -12]);

  return (
    <div
      data-id={table.id}
      style={{
        position: 'absolute',
        right: layout.safeArea,
        top: layout.safeArea + y,
        width: 420,
        zIndex: 20,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: 'top right',
        pointerEvents: 'none',
        background: `linear-gradient(180deg, ${colors.slab} 0%, ${colors.ledger} 100%)`,
        border: `1px solid ${colors.signal}55`,
        borderRadius: layout.radiusCard,
        boxShadow: `0 20px 48px rgba(0,0,0,0.55), inset 3px 0 0 ${colors.signal}`,
        overflow: 'hidden',
      }}
    >
      <EchoHeader columns={table.columns} />
      {table.rows.slice(0, 3).map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${table.columns.length}, 1fr)`,
            padding: '8px 14px',
            fontFamily: typography.fontMono,
            fontSize: 22,
            color: colors.ink,
            borderTop: `1px solid ${colors.seam}`,
          }}
        >
          {row.map((cell, j) => (
            <span key={j}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
};

const EchoHeader: React.FC<{columns: string[]}> = ({columns}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
      padding: '8px 14px',
      fontFamily: typography.fontMono,
      fontSize: 18,
      color: colors.ash,
      background: 'rgba(0,0,0,0.25)',
    }}
  >
    {columns.map((c) => (
      <span key={c}>{c}</span>
    ))}
  </div>
);
