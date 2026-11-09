import {SampleShell} from '../../design/sample-shell';
import {colors, layout, typography} from '../../design/tokens';

export type CodeSlots = {
  title: string;
  code: {id: string; lines: string[]};
};

export const CodeView: React.FC<{slots: CodeSlots}> = ({slots}) => (
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
      data-id={slots.code.id}
      style={{
        gridColumn: '2 / span 10',
        marginTop: 16,
        background: colors.slab,
        border: `${layout.borderWidth}px solid ${colors.seam}`,
        borderRadius: layout.radiusCard,
        padding: '28px 36px',
      }}
    >
      {slots.code.lines.map((line, i) => (
        <div
          key={i}
          data-id={`${slots.code.id}.line[${i}]`}
          style={{
            fontFamily: typography.fontMono,
            fontSize: typography.sizes.code,
            lineHeight: 1.5,
            color: colors.ink,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  </SampleShell>
);
