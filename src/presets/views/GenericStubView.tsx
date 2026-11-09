import {SampleShell} from '../../design/sample-shell';
import {colors, typography} from '../../design/tokens';
import type {MotionState} from '../../motion/beat-state.js';

export const GenericStubView: React.FC<{
  preset: string;
  slots: Record<string, unknown>;
  motion: MotionState;
  localFrame?: number;
}> = ({preset, slots, motion, localFrame = 0}) => {
  const title = typeof slots.title === 'string' ? slots.title : preset;
  return (
    <SampleShell motionFrame={localFrame}>
      <div data-id="scene-title" style={{gridColumn: '1 / -1', opacity: motion.dim ? 0.65 : 1}}>
        <div
          style={{
            fontFamily: typography.fontDisplay,
            fontWeight: typography.weights.bold,
            fontSize: typography.sizes.h1,
            color: colors.ink,
          }}
        >
          {title}
        </div>
        <div
          data-id="hero-sub"
          style={{marginTop: 16, color: colors.ash, fontFamily: typography.fontBody, fontSize: typography.sizes.body}}
        >
          Preset view stub — schema-only until Phase 5 port.
        </div>
      </div>
      <div
        data-id="hero-visual"
        style={{
          gridColumn: '1 / span 8',
          minHeight: 320,
          background: colors.ledger,
          border: `1px solid ${colors.seam}`,
          opacity: motion.focusId === 'hero-visual' ? 1 : motion.dim ? 0.5 : 0.85,
        }}
      />
    </SampleShell>
  );
};
