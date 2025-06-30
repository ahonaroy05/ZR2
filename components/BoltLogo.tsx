import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface BoltLogoProps {
  size?: number;
  style?: any;
}

export function BoltLogo({ size = 32, style }: BoltLogoProps) {
  const { isDarkMode } = useTheme();

  // Use the appropriate logo based on theme
  const logoSource = isDarkMode 
    ? require('@/assets/images/WhatsApp Image 2025-06-30 at 11.34.28 AM.jpeg') // Dark theme logo
    : require('@/assets/images/WhatsApp Image 2025-06-30 at 11.34.27 AM.jpeg'); // Light theme logo

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          }
        ]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});