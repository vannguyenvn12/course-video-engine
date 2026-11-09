import {colors} from './tokens';

/** Subtle 8KB-page-ish lattice; decorative only (G-SAFE may exclude via data-id). */
export const StageAmbient: React.FC = () => (
  <div
    data-id="decorative"
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(${colors.seam}22 1px, transparent 1px),
        linear-gradient(90deg, ${colors.seam}18 1px, transparent 1px),
        linear-gradient(180deg, ${colors.seam}12 0px, transparent 96px)
      `,
      backgroundSize: '100% 96px, 48px 100%, 100% 100%',
    }}
  />
);
