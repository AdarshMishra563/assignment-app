import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme, ThemePalette } from './colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemePalette;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const resolvedDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const theme = resolvedDark ? DarkTheme : LightTheme;

  const value = useMemo(() => ({ theme, mode, setMode, isDark: resolvedDark }), [theme, mode, resolvedDark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useColor = (): ThemePalette => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useColor must be used inside ThemeProvider');
  return ctx.theme;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeProvider');
  return ctx;
};
