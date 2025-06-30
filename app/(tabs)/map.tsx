import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { InteractiveMap } from '@/components/InteractiveMap';
import { BoltLogo } from '@/components/BoltLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MapScreen() {
  const { colors } = useTheme();
  const { isDemoMode } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bolt Logo */}
      <View style={[
        styles.boltLogoContainer,
        { top: isDemoMode ? 120 : 80 }
      ]}>
        <BoltLogo size={36} />
      </View>

      <InteractiveMap />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boltLogoContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 1000,
  },
});