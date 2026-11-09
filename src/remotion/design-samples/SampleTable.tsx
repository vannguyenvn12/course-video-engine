import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

const rows = [
  ['1', 'pending', '42.00'],
  ['2', 'shipped', '18.50'],
  ['3', 'pending', '9.99'],
];

export const SampleTable: React.FC = () => (
  <SampleShell>
    <div data-id="scene-title" style={{gridColumn: '1 / -1', marginBottom: 8}}>
      <div
        style={{
          fontFamily: typography.fontDisplay,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.h1,
          color: colors.ink,
        }}
      >
        Heap scan
      </div>
    </div>
    <div
      data-id="orders"
      style={{
        gridColumn: '1 / span 8',
        background: colors.ledger,
        border: `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr 1fr',
          gap: 16,
          padding: '20px 28px',
          borderBottom: `1px solid ${colors.seam}`,
          fontFamily: typography.fontMono,
          fontSize: typography.sizes.caption,
          color: colors.ash,
        }}
      >
        <span>id</span>
        <span>status</span>
        <span>total</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={row[0]}
          data-id={i === 1 ? 'orders.row[1]' : undefined}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 1fr',
            gap: 16,
            padding: '18px 28px',
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.code,
            color: colors.ink,
            background: i === 1 ? colors.signalMist : 'transparent',
            boxShadow: i === 1 ? `inset 4px 0 0 ${colors.signal}` : undefined,
          }}
        >
          {row.map((cell) => (
            <span key={cell}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
    <div
      data-id="counter"
      style={{
        gridColumn: '9 / span 4',
        alignSelf: 'center',
        background: colors.slab,
        border: `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
        padding: 32,
        boxShadow: `inset 4px 0 0 ${colors.signal}`,
      }}
    >
      <div
        style={{
          fontFamily: typography.fontMono,
          fontSize: 56,
          color: colors.ink,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        3
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: typography.fontBody,
          fontSize: typography.sizes.caption,
          color: colors.ash,
        }}
      >
        rows read
      </div>
    </div>
  </SampleShell>
);
