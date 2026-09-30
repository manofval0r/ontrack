/** Theme provider — light / dark / teal harmony, persisted locally.
 * Screens read semantic colors via useTheme() (canvas/surface/ink/...);
 * fixed brand moments (turquoise tiles, navy chat bubble) keep Brand. */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Colors, type ThemeColors, type ThemeName } from '../constants/colors';

const KEY = 'ontrack_theme';

interface ThemeCtx extends ThemeColors {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const Fallback: ThemeCtx = { ...Colors.light, theme: 'light', setTheme: () => {} };
const Ctx = createContext<ThemeCtx>(Fallback);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    SecureStore.getItemAsync(KEY).then((v) => {
      if (v === 'dark' || v === 'teal' || v === 'light') setThemeState(v);
    }).catch(() => {});
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    SecureStore.setItemAsync(KEY, t).catch(() => {});
  }, []);

  const value: ThemeCtx = { ...Colors[theme], theme, setTheme };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}
