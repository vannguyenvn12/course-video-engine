/**
 * Design tokens — values are starting points until DESIGN.md (Phase 0.5) is approved.
 * Presets reference roles only, not raw hex in DSL.
 */
export const canvas = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

export const layout = {
  safeArea: 96,
  columns: 12,
  gutter: 32,
  spacing: [8, 16, 24, 32, 48, 64, 96] as const,
  radiusCard: 12,
  radiusChip: 6,
  borderWidth: 1,
} as const;

export const colors = {
  bg: '#0a0909',
  surface: '#121010',
  surfaceRaised: '#1a1514',
  border: '#2a2220',
  text: '#f2ece8',
  textMuted: '#b8aea6',
  accent: '#c41e3a',
  accentBright: '#e8274b',
  accentWash: 'rgba(196, 30, 58, 0.12)',
} as const;

export const typography = {
  fontDisplay: 'IBMPlexSans',
  fontBody: 'IBMPlexSans',
  fontMono: 'IBMPlexMono',
  sizes: {
    display: 140,
    h1: 72,
    body: 40,
    caption: 28,
    code: 36,
  },
  weights: {
    light: 200,
    regular: 400,
    bold: 700,
    heavy: 800,
  },
} as const;

export const motion = {
  easeStandard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  durationMicro: 250,
  durationElement: 450,
  durationMorph: 900,
  dimUnfocused: 0.45,
} as const;
