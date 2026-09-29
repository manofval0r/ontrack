/**
 * Type scale — DM Sans (UI) + Fraunces (data/display) + Original Surfer
 * (expressive headlines). Sized to match the app-mockup art direction:
 * generous display sizes, 16px body minimum, 12px caption floor.
 * Load via expo-font; family names must match the loaded font assets.
 */

export const FontFamily = {
  sans: 'DMSans',
  sansFallback: 'System',
  display: 'Fraunces',
  displayFallback: 'Georgia',
  /** Expressive display — headlines, hero numbers, empty states, timers.
   * Never body copy, never small labels. */
  expressive: 'OriginalSurfer_400Regular',
  expressiveFallback: 'Georgia',
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
  display: { fontFamily: FontFamily.display, fontSize: 40, fontWeight: FontWeight.bold, lineHeight: 46 },
  title: { fontFamily: FontFamily.display, fontSize: 28, fontWeight: FontWeight.bold, lineHeight: 34 },
  cardHeading: { fontFamily: FontFamily.sans, fontSize: 22, fontWeight: FontWeight.bold, lineHeight: 28 },
  body: { fontFamily: FontFamily.sans, fontSize: 17, fontWeight: FontWeight.regular, lineHeight: 25 },
  button: { fontFamily: FontFamily.sans, fontSize: 17, fontWeight: FontWeight.semiBold, lineHeight: 23 },
  caption: { fontFamily: FontFamily.sans, fontSize: 12, fontWeight: FontWeight.semiBold, lineHeight: 16 },
  micro: { fontFamily: FontFamily.sans, fontSize: 11, fontWeight: FontWeight.bold, lineHeight: 14 },
};
