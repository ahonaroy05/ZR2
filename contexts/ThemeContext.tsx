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
  textTertiary: string;
  textInverse: string;
  
  // Brand colors
  primary: string;
  primaryDark: string;
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
    background: '#FDF7FD',
    surface: '#FFFFFF',
    card: '#FEFBFE',
    text: '#4A3B4A',
    textSecondary: '#8B7A8B',
    textTertiary: '#B8A8B8',
    textInverse: '#FFFFFF',
    primary: '#E8B4E3',
    primaryDark: '#D8A7D8',
    accent: '#D8A7D8',
    success: '#C8E6C9',
    warning: '#FFE0B2',
    error: '#FFCDD2',
    border: '#F0E6F0',
    shadow: '#E8B4E3',
    overlay: 'rgba(232, 180, 227, 0.5)',
    primaryLight: '#F8F0F8',
  },
  gradient: {
    primary: ['#E8B4E3', '#D8A7D8'],
    accent: ['#D8A7D8', '#C8A2C8'],
    background: ['#FDF7FD', '#F8F0F8', '#F0E6F0'],
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#2A1A2A',
    surface: '#3D2A3D',
    card: '#4A3B4A',
    text: '#F0E6F0',
    textSecondary: '#C8B4C8',
    textTertiary: '#A89BA8',
    textInverse: '#2A1A2A',
    primary: '#B47FB4',
    primaryDark: '#A373A3',
    accent: '#A373A3',
    success: '#7BC97B',
    warning: '#E8A87C',
    error: '#E85A5A',
    border: '#5A4A5A',
    shadow: '#1A0A1A',
    overlay: 'rgba(180, 127, 180, 0.7)',
    primaryLight: '#3D2A3D',
  },
  gradient: {
    primary: ['#B47FB4', '#A373A3'],
    accent: ['#A373A3', '#936693'],
    background: ['#2A1A2A', '#3D2A3D', '#4A3B4A'],
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