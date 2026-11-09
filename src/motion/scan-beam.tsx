import {interpolate, useCurrentFrame} from 'remotion';
import {colors, layout} from '../design/tokens.js';

/** Horizontal scan stripe — hero motion for seq scan table preset. */
export const ScanBeam: React.FC<{
  active: boolean;
  rowIndex: number;
  rowHeightPx?: number;
  headerOffsetPx?: number;
}> = ({active, rowIndex, rowHeightPx = 52, headerOffsetPx = 48}) => {
  const frame = useCurrentFrame();
  if (!active || rowIndex < 0) {
    return null;
  }

  const y = headerOffsetPx + rowIndex * rowHeightPx + rowHeightPx / 2;
  const pulse = interpolate((frame % 18) / 18, [0, 0.5, 1], [0.65, 1, 0.65]);

  return (
    <div
      aria-hidden
      data-id="decorative"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        height: 3,
        opacity: pulse,
        background: `linear-gradient(90deg, transparent, ${colors.flare}, transparent)`,
        boxShadow: `0 0 24px ${colors.signal}, 0 0 60px ${colors.signalMist}`,
        borderRadius: layout.radiusChip,
        pointerEvents: 'none',
      }}
    />
  );
};
