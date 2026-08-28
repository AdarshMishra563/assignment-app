import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemePalette, DarkTheme, LightTheme } from '../theme/colors';

interface ThemeContextType {
  theme: ThemePalette;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DarkTheme,
  isDark: true,
  toggleTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(deviceColorScheme === 'dark');

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
