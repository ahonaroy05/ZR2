import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textInverse: string;
  
  // Brand colors
  primary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  
  // UI colors
  border: string;
  shadow: string;
  overlay: string;
  
  // Special colors
  primaryLight: string;
}

export interface Theme {
  isDark: boolean;
  colors: ThemeColors;
  gradient: {
    primary: string[];
    accent: string[];
    background: string[];
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#F8FBFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#2D3748',
    textSecondary: '#718096',
    textInverse: '#FFFFFF',
    primary: '#00C4B4',
    accent: '#FF6B6B',
    success: '#48BB78',
    warning: '#F6AD55',
    error: '#FC8181',
    border: '#E2E8F0',
    shadow: '#CBD5E0',
    overlay: 'rgba(0, 196, 180, 0.5)',
    primaryLight: '#E6FFFA',
  },
  gradient: {
    primary: ['#00C4B4', '#38B2AC'],
    accent: ['#FF6B6B', '#F56565'],
    background: ['#F8FBFF', '#EDF2F7', '#E2E8F0'],
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#1A202C',
    surface: '#2D3748',
    card: '#2D3748',
    text: '#F7FAFC',
    textSecondary: '#A0AEC0',
    textInverse: '#1A202C',
    primary: '#4FD1C5',
    accent: '#FC8181',
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    border: '#4A5568',
    shadow: '#171923',
    overlay: 'rgba(79, 209, 197, 0.7)',
    primaryLight: '#285E61',
  },
  gradient: {
    primary: ['#4FD1C5', '#38B2AC'],
    accent: ['#FC8181', '#F56565'],
    background: ['#1A202C', '#2D3748', '#4A5568'],
  },
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@zenroute_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        try {
          const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme !== null) {
            setIsDarkMode(JSON.parse(savedTheme));
          }
        } catch (error) {
          console.error('Error loading theme preference from localStorage:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Use AsyncStorage for mobile
        try {
          const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedTheme !== null) {
            setIsDarkMode(JSON.parse(savedTheme));
          }
        } catch (error) {
          console.error('Error loading theme preference from AsyncStorage:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadThemePreference();
  }, []);

  // Save theme preference to storage
  const saveThemePreference = async (isDark: boolean) => {
    if (Platform.OS === 'web') {
      // Use localStorage for web
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDark));
      } catch (error) {
        console.error('Error saving theme preference to localStorage:', error);
      }
    } else {
      // Use AsyncStorage for mobile
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDark));
      } catch (error) {
        console.error('Error saving theme preference to AsyncStorage:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  // Don't render children until theme is loaded
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,
        isDarkMode,
        toggleTheme,
        colors: currentTheme.colors,
      }}
    >
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