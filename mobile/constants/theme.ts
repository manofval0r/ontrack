/**
 * Aggregate theme + neo-brutalist shadow helpers.
 * React Native has no box-shadow: iOS uses shadow* props, Android uses
 * elevation (blurs slightly — accepted; border + offset still read tactile).
 */
import { Brand, Colors, ThemeColors, ThemeName } from './colors';
import { Borders, Radii, Spacing, Touch } from './spacing';
import { FontFamily, FontWeight, Typography } from './typography';

export { Brand, Colors, Spacing, Radii, Borders, Touch, FontFamily, FontWeight, Typography };
export type { ThemeColors, ThemeName };

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/** Solid offset shadow (no blur): shadowRadius 0, full opacity. */
function offsetShadow(color: string, size: number): ShadowStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: size, height: size },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: size,
  };
}

export function shadowsFor(theme: ThemeName) {
  const c = Colors[theme].shadow;
  return {
    pill: offsetShadow(c, 3),
    pillPressed: offsetShadow(c, 1),
    card: offsetShadow(c, 4),
    cardLifted: offsetShadow(c, 6),
    bubble: offsetShadow(c, 3),
    statusPill: offsetShadow(c, 1),
  };
}

export const Shadows = shadowsFor('light');
export const DarkShadows = shadowsFor('dark');

/** Pressed-state helper: condense shadow + scale (replaces web :hover). */
export const Pressed = {
  scale: 0.97,
} as const;
