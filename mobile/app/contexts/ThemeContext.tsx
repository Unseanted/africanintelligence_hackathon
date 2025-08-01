import React, { createContext, useContext, useState } from 'react';

interface ThemeColors {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer?: string;
  onPrimaryContainer?: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer?: string;
  onSecondaryContainer?: string;
  
  // Background/surface colors
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer?: string;
  onErrorContainer?: string;
  
  // Status colors
  warning: string;
  success: string;
  info: string;
  
  // Additional colors
  outline: string;
  shadow?: string;
  inverseSurface?: string;
  inverseOnSurface?: string;
  inversePrimary?: string;
  
  // Custom colors
  cardBackground: string;
  inputBackground: string;
  text: string;
  tertiary: string;
  textSecondary: string;
  borderColor: string;
  bronze: string;
  
  // Navigation specific colors
  navBarBackground: string;
  activeNavBackground: string;
  activeNavIcon: string;
  activeNavText: string;
  inactiveNavIcon: string;
  inactiveNavText: string;
  textDisabled: string; // ← Add this
  successContainer: string;
  onSuccessContainer: string;
  
  elevation?: {
    level0?: string;
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level5?: string;
  };
}

interface ThemeContextType {
  colors: ThemeColors;
  toggleTheme: () => void;
  isDarkMode: boolean;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const colors: ThemeColors = {
    // Primary colors
    primary: isDark ? '#f59e0b' : '#d97706',
    onPrimary: '#FFFFFF',
    primaryContainer: isDark ? '#3700B3' : '#EADDFF',
    onPrimaryContainer: isDark ? '#EADDFF' : '#21005D',
    
    // Secondary colors
    secondary: isDark ? '#03DAC6' : '#018786',
    onSecondary: '#FFFFFF',
    secondaryContainer: isDark ? '#03DAC6' : '#E8F5E9',
    onSecondaryContainer: isDark ? '#E8F5E9' : '#1B5E20',
    
    // Background/surface colors
    background: isDark ? '#1d283a' : '#F5F5F5',
    onBackground: isDark ? '#FFFFFF' : '#000000',
    surface: isDark ? '#262626' : '#FAFAFA',
    onSurface: isDark ? '#FFFFFF' : '#000000',
    tertiary: isDark ? '#262626' : '#FAFAFA',
    surfaceVariant: isDark ? '#2D2D2D' : '#E0E0E0',
    onSurfaceVariant: isDark ? '#C8C8C8' : '#616161',
    
    // Error colors
    error: '#FF5252',
    onError: '#FFFFFF',
    errorContainer: isDark ? '#CF6679' : '#FFCDD2',
    onErrorContainer: isDark ? '#FFCDD2' : '#B71C1C',
    onSuccessContainer: isDark ? '#81C784' : '#4CAF50',
    
    // Status colors
    warning: isDark ? '#FFD700' : '#FFA000',
    success: isDark ? '#81C784' : '#4CAF50',
    successContainer: isDark ? '#81C784' : '#4CAF50',
    info: isDark ? '#4FC3F7' : '#0288D1',
    
    // Additional colors
    outline: isDark ? '#5C5C5C' : '#9E9E9E',
    shadow: isDark ? '#000000' : '#212121',
    inverseSurface: isDark ? '#E0E0E0' : '#2D2D2D',
    inverseOnSurface: isDark ? '#212121' : '#F5F5F5',
    inversePrimary: isDark ? '#3700B3' : '#BB86FC',
    
    // Custom colors
    cardBackground: isDark ? '#1E1E1E' : '#F8F8F8',
    inputBackground: isDark ? '#333333' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#B0B0B0' : '#757575',
    borderColor: isDark ? '#333333' : '#E5E7EB',
    bronze: isDark ? '#8B6F47' : '#CD7F32',
    textDisabled: isDark ? '#6B7280' : '#9CA3AF', // ← Tailwind gray-500 and gray-400

    
    // Navigation specific colors
    navBarBackground: isDark ? '#1F2937' : '#FFFFFF',
    activeNavBackground: isDark ? '#F97316' : '#F97316', // Orange pill background
    activeNavIcon: '#FFFFFF', // White icon on orange background
    activeNavText: '#FFFFFF', // White text on orange background
    inactiveNavIcon: isDark ? '#9CA3AF' : '#6B7280', // Gray icons
    inactiveNavText: isDark ? '#9CA3AF' : '#6B7280', // Gray text
    
    // Elevation colors
    elevation: {
      level0: 'transparent',
      level1: isDark ? '#2D2D2D' : '#F5F5F5',
      level2: isDark ? '#3D3D3D' : '#EEEEEE',
      level3: isDark ? '#4D4D4D' : '#E0E0E0',
      level4: isDark ? '#5D5D5D' : '#D5D5D5',
      level5: isDark ? '#6D6D6D' : '#C8C8C8',
    }
  };

  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  };

  const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ 
      colors, 
      toggleTheme, 
      isDarkMode: isDark,
      spacing,
      borderRadius
    }}>
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