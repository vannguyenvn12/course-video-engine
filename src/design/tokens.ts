/**
 * Approved values live in DESIGN.md. Presets use role names from this object only.
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
  vault: '#0c0a0b',
  ledger: '#141112',
  slab: '#1c1817',
  seam: '#302826',
  ink: '#f0e8e4',
  ash: '#b8aea6',
  signal: '#c41e3a',
  flare: '#e8274b',
  signalMist: 'rgba(196, 30, 58, 0.14)',
  /** @deprecated use vault */
  bg: '#0c0a0b',
  /** @deprecated use ledger */
  surface: '#141112',
  /** @deprecated use slab */
  surfaceRaised: '#1c1817',
  /** @deprecated use seam */
  border: '#302826',
  /** @deprecated use ink */
  text: '#f0e8e4',
  /** @deprecated use ash */
  textMuted: '#b8aea6',
  /** @deprecated use signal */
  accent: '#c41e3a',
  /** @deprecated use flare */
  accentBright: '#e8274b',
  /** @deprecated use signalMist */
  accentWash: 'rgba(196, 30, 58, 0.14)',
} as const;

export const typography = {
  fontDisplay: 'IBMPlexSans',
  fontBody: 'IBMPlexSans',
  fontMono: 'IBMPlexMono',
  sizes: {
    display: 132,
    h1: 72,
    body: 40,
    caption: 28,
    code: 36,
  },
  weights: {
    light: 200,
    regular: 400,
    bold: 700,
    heavy: 700,
  },
} as const;

export const motion = {
  easeStandard: 'cubic-bezier(0.16, 1, 0.3, 1)',
  durationMicro: 250,
  durationElement: 450,
  durationMorph: 900,
  dimUnfocused: 0.45,
} as const;
