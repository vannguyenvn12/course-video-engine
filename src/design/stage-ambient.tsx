import {colors, canvas} from './tokens';

/** 8KB page lattice — drift driven by `motionFrame` (deterministic in Remotion). */
export const StageAmbient: React.FC<{motionFrame?: number}> = ({motionFrame = 0}) => {
  const driftX = (motionFrame * 0.35) % 48;
  const driftY = (motionFrame * 0.12) % 96;
  const breathe = 0.88 + 0.12 * Math.sin(motionFrame / 90);

  return (
    <div
      data-id="decorative"
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: breathe,
        backgroundImage: [
          `repeating-linear-gradient(0deg, transparent, transparent 95px, ${colors.seam}77 96px)`,
          `linear-gradient(${colors.seam}40 1px, transparent 1px)`,
          `linear-gradient(90deg, ${colors.seam}30 1px, transparent 1px)`,
          `linear-gradient(90deg, transparent 47px, ${colors.seam}22 48px, transparent 49px)`,
        ].join(', '),
        backgroundSize: '100% 96px, 100% 48px, 48px 100%, 96px 100%',
        backgroundPosition: `${driftX}px ${driftY}px, 0 0, ${driftX}px 0, ${driftY}px 0`,
      }}
    />
  );
};

/** Soft page blocks along bottom edge — breaks flat void without stealing focus. */
export const StagePageGlimmer: React.FC<{motionFrame?: number}> = ({motionFrame = 0}) => (
  <div
    aria-hidden
    data-id="decorative"
    style={{
      position: 'absolute',
      left: 96,
      right: 96,
      bottom: 0,
      height: canvas.height * 0.28,
      pointerEvents: 'none',
      background: [
        `repeating-linear-gradient(90deg, ${colors.ledger}00 0px, ${colors.ledger}55 1px, transparent 120px)`,
        `linear-gradient(0deg, ${colors.ledger}88 0%, transparent 85%)`,
      ].join(', '),
      opacity: 0.45 + 0.08 * Math.sin(motionFrame / 55),
    }}
  />
);
