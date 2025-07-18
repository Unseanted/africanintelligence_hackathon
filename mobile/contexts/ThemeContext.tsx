// context/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Define the color palette type
type ColorPalette = {
  background: string;
  text: string;
  textSecondary: string;
  cardBackground: string;
  borderColor: string;
  primary: string;
  surface: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
};

// Define your color palettes
const COLOR_PALETTES = {
  light: {
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    cardBackground: "#F8F8F8",
    borderColor: "#E0E0E0",
    primary: "#6200EE",
    surface: "#FFFFFF",
    accent: "#03DAC6",
    error: "#B00020",
    success: "#4CAF50",
    warning: "#FF9800",
  },
  dark: {
    background: "#121212",
    text: "#FFFFFF",
    textSecondary: "#BBBBBB",
    cardBackground: "#1E1E1E",
    borderColor: "#333333",
    primary: "#BB86FC",
    surface: "#1E1E1E",
    accent: "#03DAC6",
    error: "#CF6679",
    success: "#4CAF50",
    warning: "#FF9800",
  },
} as const satisfies Record<string, ColorPalette>;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ColorPalette;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "themePreference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on initial render
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === "dark" || savedTheme === "light") {
          setIsDarkMode(savedTheme === "dark");
        } else {
          // Default to system preference or light mode
          setIsDarkMode(false);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
        // Fallback to light mode
        setIsDarkMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
        
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? "dark" : "light");
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      // Revert the state if save failed
      setIsDarkMode(isDarkMode);
    }
  }, [isDarkMode]);

  const colors = useMemo(
    () => (isDarkMode ? COLOR_PALETTES.dark : COLOR_PALETTES.light),
    [isDarkMode]
  );

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      colors,
      isLoading,
    }),
    [isDarkMode, toggleTheme, colors, isLoading]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { COLOR_PALETTES };
export type { ThemeContextType, ColorPalette };