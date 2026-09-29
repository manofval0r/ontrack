/** OnTrack brand palette — 1:1 with web `index.css` @theme + dark overrides. */

export const Brand = {
  turquoise: '#00C4B3',
  navy: '#071E2D',
  teal: '#006D6A',
  aqua: '#33D6C5',
  gray: '#F3F6F8',
  grayCanvas: '#F8FAFB',
  white: '#FFFFFF',
  slate: '#1E293B', // icon squircle fill
  // Status-only (GoalStatusPill parity with web)
  amberBg: '#FFFBEB',
  amberText: '#B45309',
  amberBorder: '#F59E0B',
  amberDot: '#F59E0B',
  cyanBg: '#ECFEFF', // on-track pill + AI proposal card
  mint: '#99F6E4', // mid-intensity activity strip only
  placeholder: 'rgba(7,30,45,0.55)', // input placeholders — always visible
  // Error red — text/icons only, never shadows or fills.
  error: '#dc2626',
  // Overlays
  scrim: 'rgba(7,30,45,0.92)', // work-block scrim
  trackOnNavy: 'rgba(255,255,255,0.15)', // progress track on dark surfaces
  cardOnNavy: 'rgba(255,255,255,0.08)', // stat tiles on dark panels
  faintOnNavy: 'rgba(255,255,255,0.6)', // secondary labels on dark panels
  hairOnNavy: 'rgba(255,255,255,0.25)', // hairline borders on dark panels
  hairline: 'rgba(7,30,45,0.08)', // hairline dividers on light surfaces
  // Dark surfaces (web .dark overrides)
  darkBg: '#051520',
  darkSurface: '#0B2536',
  darkSurface2: '#0F3146',
  lightText: '#F1F5F9',
} as const;

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  canvas: string;
  surface: string;
  surface2: string;
  ink: string;
  inkSoft: string; // secondary text (ink at ~60-70%)
  border: string;
  shadow: string;
  primary: string; // primary button bg
  primaryInk: string; // primary button text
  accent: string; // turquoise actions, progress, active states
  teal: string;
  aqua: string;
  inputTrack: string;
  inputBorder: string;
}

export const Colors: Record<ThemeName, ThemeColors> = {
  light: {
    canvas: Brand.grayCanvas,
    surface: Brand.white,
    surface2: Brand.gray,
    ink: Brand.navy,
    inkSoft: 'rgba(7, 30, 45, 0.65)',
    border: Brand.navy,
    shadow: Brand.navy,
    primary: Brand.navy,
    primaryInk: Brand.white,
    accent: Brand.turquoise,
    teal: Brand.teal,
    aqua: Brand.aqua,
    inputTrack: Brand.gray,
    inputBorder: 'rgba(7, 30, 45, 0.2)',
  },
  dark: {
    canvas: Brand.darkBg,
    surface: Brand.darkSurface,
    surface2: Brand.darkSurface2,
    ink: '#FFFFFF',
    inkSoft: 'rgba(241, 245, 249, 0.65)',
    border: Brand.turquoise,
    shadow: Brand.turquoise,
    primary: Brand.turquoise,
    primaryInk: Brand.navy,
    accent: Brand.turquoise,
    teal: Brand.teal,
    aqua: Brand.aqua,
    inputTrack: Brand.darkSurface2,
    inputBorder: 'rgba(0, 196, 179, 0.35)',
  },
};
