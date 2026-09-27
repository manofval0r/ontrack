/**
 * Type scale — DM Sans (UI) + Fraunces (display), ~2px under web.
 * Load via expo-font (@expo-google-fonts/dm-sans, @expo-google-fonts/fraunces).
 * Family names must match the loaded font assets; fallbacks are system.
 */

export const FontFamily = {
  sans: 'DMSans',
  sansFallback: 'System',
  display: 'Fraunces',
  displayFallback: 'Georgia',
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
}

export const Typography: Record<
  'display' | 'title' | 'cardHeading' | 'body' | 'button' | 'caption' | 'micro',
  TextStyle
> = {
  display: { fontFamily: FontFamily.display, fontSize: 34, fontWeight: FontWeight.bold, lineHeight: 40 },
  title: { fontFamily: FontFamily.display, fontSize: 24, fontWeight: FontWeight.bold, lineHeight: 30 },
  cardHeading: { fontFamily: FontFamily.sans, fontSize: 18, fontWeight: FontWeight.bold, lineHeight: 24 },
  body: { fontFamily: FontFamily.sans, fontSize: 15, fontWeight: FontWeight.regular, lineHeight: 22 },
  button: { fontFamily: FontFamily.sans, fontSize: 15, fontWeight: FontWeight.semiBold, lineHeight: 20 },
  caption: { fontFamily: FontFamily.sans, fontSize: 12, fontWeight: FontWeight.semiBold, lineHeight: 16 },
  micro: { fontFamily: FontFamily.sans, fontSize: 10, fontWeight: FontWeight.bold, lineHeight: 14 },
};
