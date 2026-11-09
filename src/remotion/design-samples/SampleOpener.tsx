import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

const PageStackArt: React.FC = () => (
  <div
    data-id="page-stack"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'flex-end',
    }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 280 - i * 24,
          height: 52,
          background: colors.ledger,
          border: `${layout.borderWidth}px solid ${colors.seam}`,
          borderRadius: 4,
          boxShadow: i === 0 ? `inset 4px 0 0 ${colors.signal}` : undefined,
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: 4,
          padding: '8px 12px',
        }}
      >
        {Array.from({length: 8}).map((_, j) => (
          <div
            key={j}
            style={{
              height: 6,
              borderRadius: 2,
              background: j === 2 && i === 0 ? colors.signalMist : colors.seam,
              opacity: j === 2 && i === 0 ? 1 : 0.45,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SampleOpener: React.FC = () => (
  <SampleShell>
    <div data-id="hero-title" style={{gridColumn: '1 / span 7'}}>
      <div
        style={{
          fontFamily: typography.fontDisplay,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.display,
          lineHeight: 1.02,
          color: colors.ink,
          letterSpacing: '-0.03em',
        }}
      >
        Inside PostgreSQL
      </div>
      <div
        data-id="hero-sub"
        style={{
          marginTop: 28,
          fontFamily: typography.fontBody,
          fontWeight: typography.weights.light,
          fontSize: typography.sizes.body,
          color: colors.ash,
          maxWidth: 640,
        }}
      >
        Pages, not slides
      </div>
    </div>
    <div style={{gridColumn: '9 / span 4', display: 'flex', justifyContent: 'flex-end'}}>
      <PageStackArt />
    </div>
  </SampleShell>
);
