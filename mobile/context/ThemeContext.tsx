import React, { createContext, useContext, useState } from 'react';
import { PRIMARY, SECONDARY, BACKGROUND, TEXT, TEXT_SECONDARY } from '../constants/Colors';

interface ThemeContextType {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    textSecondary: string;
  };
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const colors = {
    primary: PRIMARY,
    secondary: SECONDARY,
    background: isDark ? '#1A1A1A' : BACKGROUND,
    text: isDark ? '#FFFFFF' : TEXT,
    textSecondary: isDark ? '#AAAAAA' : TEXT_SECONDARY,
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 