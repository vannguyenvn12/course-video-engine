import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

const lines = [
  {text: 'EXPLAIN SELECT * FROM orders', highlight: false},
  {text: '  WHERE status = $1;', highlight: true},
  {text: '→ Seq Scan on orders', highlight: false},
];

export const SampleCode: React.FC = () => (
  <SampleShell>
    <div data-id="scene-title" style={{gridColumn: '1 / -1'}}>
      <div
        style={{
          fontFamily: typography.fontDisplay,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.h1,
          color: colors.ink,
        }}
      >
        Planner chooses scan
      </div>
    </div>
    <div
      data-id="code"
      style={{
        gridColumn: '2 / span 10',
        marginTop: 16,
        background: colors.slab,
        border: `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
        padding: '32px 40px',
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          data-id={line.highlight ? 'code.line[1]' : undefined}
          style={{
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.code,
            lineHeight: 1.55,
            color: colors.ink,
            padding: '6px 0 6px 16px',
            marginLeft: -16,
            background: line.highlight ? colors.signalMist : 'transparent',
            boxShadow: line.highlight ? `inset 4px 0 0 ${colors.signal}` : undefined,
          }}
        >
          {line.text}
        </div>
      ))}
    </div>
  </SampleShell>
);
