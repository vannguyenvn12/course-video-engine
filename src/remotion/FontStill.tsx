import {useEffect} from 'react';
import {AbsoluteFill} from 'remotion';
import {colors, layout, typography} from '../design/tokens';
import {loadCourseFonts} from '../design/load-fonts';

const gridPattern = `
  linear-gradient(${colors.border}33 1px, transparent 1px),
  linear-gradient(90deg, ${colors.border}33 1px, transparent 1px)
`;

export const FontStill: React.FC = () => {
  useEffect(() => {
    void loadCourseFonts();
  }, []);

  const pad = layout.safeArea;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        backgroundImage: gridPattern,
        backgroundSize: '48px 48px',
      }}
    >
      <div
        data-id="stage-safe"
        style={{
          position: 'absolute',
          left: pad,
          top: pad,
          right: pad,
          bottom: pad,
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: layout.gutter,
          alignContent: 'center',
        }}
      >
        <div data-id="hero-title" style={{gridColumn: '1 / span 8'}}>
          <div
            style={{
              fontFamily: typography.fontDisplay,
              fontWeight: typography.weights.bold,
              fontSize: typography.sizes.display,
              lineHeight: 1.05,
              color: colors.text,
              letterSpacing: '-0.02em',
            }}
          >
            Sequential scan
          </div>
          <div
            data-id="hero-sub"
            style={{
              marginTop: 24,
              fontFamily: typography.fontBody,
              fontWeight: typography.weights.light,
              fontSize: typography.sizes.body,
              color: colors.textMuted,
              maxWidth: 720,
            }}
          >
            Every row on disk
          </div>
        </div>
        <div
          data-id="accent-panel"
          style={{
            gridColumn: '9 / span 4',
            background: colors.surfaceRaised,
            border: `${layout.borderWidth}px solid ${colors.border}`,
            borderRadius: layout.radiusCard,
            padding: 32,
            boxShadow: `inset 4px 0 0 ${colors.accent}`,
          }}
        >
          <div
            data-id="metric-value"
            style={{
              fontFamily: typography.fontMono,
              fontSize: 56,
              color: colors.text,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            4
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: typography.fontBody,
              fontSize: typography.sizes.caption,
              color: colors.textMuted,
            }}
          >
            rows touched
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
