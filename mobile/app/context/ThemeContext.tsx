// ThemeContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define your color palettes
const COLOR_PALETTES = {
  light: {
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    cardBackground: '#F8F8F8',
    borderColor: '#E0E0E0',
    primary: '#6200EE',
  },
  dark: {
    background: '#121212',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    cardBackground: '#1E1E1E',
    borderColor: '#333333',
    primary: '#BB86FC',
  },
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof COLOR_PALETTES.light;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme preference on initial render
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, [isDarkMode]);

  const colors = useMemo(() => (
    isDarkMode ? COLOR_PALETTES.dark : COLOR_PALETTES.light
  ), [isDarkMode]);

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