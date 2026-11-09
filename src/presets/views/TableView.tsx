import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

export type TableSlots = {
  title: string;
  table: {id: string; columns: string[]; rows: string[][]};
  annotation: {id: string; label: string; to: number};
};

export const TableView: React.FC<{slots: TableSlots}> = ({slots}) => (
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
        {slots.title}
      </div>
    </div>
    <div
      data-id={slots.table.id}
      style={{
        gridColumn: '1 / span 8',
        marginTop: 8,
        background: colors.ledger,
        border: `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${slots.table.columns.length}, 1fr)`,
          padding: '16px 24px',
          color: colors.ash,
          fontFamily: typography.fontMono,
          fontSize: typography.sizes.caption,
        }}
      >
        {slots.table.columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      {slots.table.rows.map((row, i) => (
        <div
          key={i}
          data-id={`${slots.table.id}.row[${i}]`}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${slots.table.columns.length}, 1fr)`,
            padding: '14px 24px',
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.code,
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
    <div
      data-id={slots.annotation.id}
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
      <div style={{fontFamily: typography.fontMono, fontSize: 56, color: colors.ink}}>
        {slots.annotation.to}
      </div>
      <div style={{fontFamily: typography.fontBody, fontSize: typography.sizes.caption, color: colors.ash}}>
        {slots.annotation.label}
      </div>
    </div>
  </SampleShell>
);
