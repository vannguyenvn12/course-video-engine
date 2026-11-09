import {interpolate} from 'remotion';
import {colors, canvas} from './tokens';
import {StageAmbient, StagePageGlimmer} from './stage-ambient';

type StageBackdropProps = {
  /** Scene-local frame for parallax (Remotion). */
  motionFrame?: number;
};

/** Layered vault background: depth gradient + hero glow + page lattice (DESIGN § Motion & background). */
export const StageBackdrop: React.FC<StageBackdropProps> = ({motionFrame = 0}) => {
  const parallax = interpolate((motionFrame % 900) / 900, [0, 1], [0, 24]);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            `radial-gradient(ellipse 110% 75% at ${20 + parallax * 0.03}% 30%, #26201e 0%, transparent 68%)`,
            `radial-gradient(ellipse 70% 60% at 78% 36%, rgba(196, 30, 58, 0.22) 0%, transparent 62%)`,
            `radial-gradient(ellipse 50% 45% at 48% 92%, rgba(240, 232, 228, 0.09) 0%, transparent 58%)`,
            `linear-gradient(168deg, #221c1b 0%, ${colors.vault} 36%, #0a0808 100%)`,
          ].join(', '),
        }}
      />
      <StageAmbient motionFrame={motionFrame} />
      <StagePageGlimmer motionFrame={motionFrame} />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 140px 48px rgba(0, 0, 0, 0.42)`,
        }}
      />
      <div
        data-id="decorative"
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: canvas.width,
          height: 120,
          background: `linear-gradient(180deg, rgba(240, 232, 228, 0.07) 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};
