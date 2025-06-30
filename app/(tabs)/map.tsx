import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { InteractiveMap } from '@/components/InteractiveMap';
import { BoltLogo } from '@/components/BoltLogo';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function MapScreen() {
  const { colors } = useTheme();
  const { isDemoMode } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with title and Bolt Logo */}
      <View style={[
        styles.headerContainer,
        { top: isDemoMode ? 40 : 0 }
      ]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Routes</Text>
          <View style={styles.boltLogoContainer}>
            <BoltLogo size={42} />
          </View>
        </View>
      </View>

      <InteractiveMap />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
  },
  boltLogoContainer: {
    marginTop: 4,
  },
});