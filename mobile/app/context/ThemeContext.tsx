import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKGROUND, BACKGROUND_DARK, TEXT_PRIMARY, TEXT_SECONDARY, CARD_BACKGROUND, BORDER_COLOR } from '../constants/colors';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    cardBackground: string;
    borderColor: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const colors = useMemo(() => ({
    background: isDarkMode ? BACKGROUND_DARK : BACKGROUND,
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    cardBackground: CARD_BACKGROUND,
    borderColor: BORDER_COLOR,
  }), [isDarkMode]);

  const value = useMemo(() => ({
    isDarkMode,
    toggleTheme,
    colors
  }), [isDarkMode, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider; 