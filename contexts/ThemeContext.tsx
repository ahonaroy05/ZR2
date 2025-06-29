import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Accent colors
  accent: string;
  accentLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Border and shadow
  border: string;
  shadow: string;
  
  // Interactive states
  ripple: string;
  overlay: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F8FBFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textTertiary: '#6A6A6A',
    
    primary: '#B6D0E2',
    primaryLight: '#E6F3FF',
    primaryDark: '#87CEEB',
    
    accent: '#87CEEB',
    accentLight: '#B6D0E2',
    
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    
    border: '#E8E8E8',
    shadow: '#87CEEB',
    
    ripple: 'rgba(182, 208, 226, 0.2)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0F1419',
    surface: '#1A1F2E',
    card: '#252B3A',
    
    text: '#FFFFFF',
    textSecondary: '#B8C5D1',
    textTertiary: '#8A9BA8',
    
    primary: '#4A90E2',
    primaryLight: '#6BB6FF',
    primaryDark: '#2171B5',
    
    accent: '#5DADE2',
    accentLight: '#85C1E9',
    
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    
    border: '#3A4553',
    shadow: '#000000',
    
    ripple: 'rgba(74, 144, 226, 0.2)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only auto-switch if user hasn't set a preference
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
        if (!stored) {
          setIsDark(colorScheme === 'dark');
        }
      });
    });

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        setIsDark(JSON.parse(stored));
      } else {
        // Use system preference if no stored preference
        const systemScheme = Appearance.getColorScheme();
        setIsDark(systemScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to system preference
      const systemScheme = Appearance.getColorScheme();
      setIsDark(systemScheme === 'dark');
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveThemePreference(newIsDark);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
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