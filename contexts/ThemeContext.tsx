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
    background: '#FDF7FF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    text: '#2D1B3D',
    textSecondary: '#6B4C7A',
    textTertiary: '#9B7BA8',
    
    primary: '#E8B4E3',
    primaryLight: '#F5E1F3',
    primaryDark: '#D896D1',
    
    accent: '#C8A8E9',
    accentLight: '#E5D4F1',
    
    success: '#A8E6CF',
    warning: '#FFD3A5',
    error: '#FFB3BA',
    
    border: '#F0E6F7',
    shadow: '#E8B4E3',
    
    ripple: 'rgba(232, 180, 227, 0.3)',
    overlay: 'rgba(45, 27, 61, 0.5)',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#1A0F1F',
    surface: '#2D1B3D',
    card: '#3D2A4A',
    
    text: '#F5E1F3',
    textSecondary: '#D4B8E0',
    textTertiary: '#B39BC7',
    
    primary: '#D896D1',
    primaryLight: '#E8B4E3',
    primaryDark: '#C67BB8',
    
    accent: '#B084CC',
    accentLight: '#C8A8E9',
    
    success: '#7DDBB0',
    warning: '#FFB366',
    error: '#FF8A95',
    
    border: '#4A3757',
    shadow: '#000000',
    
    ripple: 'rgba(216, 150, 209, 0.3)',
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