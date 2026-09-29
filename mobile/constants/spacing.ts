/** 4pt base scale + radii + touch targets (web shape language, touch-adapted). */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radii = {
  pill: 999,
  card: 20,
  modal: 24,
  input: 12,
  bubble: 18,
  squircle: 12,
  checkbox: 8,
  badge: 999,
} as const;

export const Borders = {
  thin: 1.5,
  regular: 2,
} as const;

/** Minimum touch target (48×48pt) + key component sizes. */
export const Touch = {
  min: 48,
  bubble: 32, // pill-button inner circle
  iconButton: 52, // mic / send / 🔊 buttons
  plusButton: 72, // counter +1 circle
  checkbox: 28,
  micHero: 104, // voice modal pulsing mic
  iconSquircle: 48,
  tabIcon: 44,
} as const;
