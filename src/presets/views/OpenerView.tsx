import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

export type OpenerSlots = {
  title: string;
  subtitle?: string;
};

export const OpenerView: React.FC<{slots: OpenerSlots}> = ({slots}) => (
  <SampleShell>
    <div data-id="hero-title" style={{gridColumn: '1 / span 7'}}>
      <div
        style={{
          fontFamily: typography.fontDisplay,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.display,
          lineHeight: 1.02,
          color: colors.ink,
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
          }}
        >
          {slots.subtitle}
        </div>
      ) : null}
    </div>
    <div data-id="page-stack" style={{gridColumn: '9 / span 4', justifySelf: 'end'}}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 260 - i * 20,
            height: 48,
            marginBottom: 10,
            background: colors.ledger,
            border: `${layout.borderWidth}px solid ${colors.seam}`,
            boxShadow: i === 0 ? `inset 4px 0 0 ${colors.signal}` : undefined,
          }}
        />
      ))}
    </div>
  </SampleShell>
);
