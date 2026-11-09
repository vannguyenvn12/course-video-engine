import {SampleShell} from '../../design/sample-shell';
import {colors, typography} from '../../design/tokens';

export const StatementView: React.FC<{slots: {statement: string}}> = ({slots}) => (
  <SampleShell>
    <div
      data-id="statement"
      style={{
        gridColumn: '2 / span 10',
        fontFamily: typography.fontDisplay,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.display,
        color: colors.ink,
        lineHeight: 1.05,
      }}
    >
      {slots.statement}
    </div>
  </SampleShell>
);
