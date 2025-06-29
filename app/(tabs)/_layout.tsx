import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { SettingsMenu } from '@/components/SettingsMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { Chrome as Home, Map, Volume2, BookOpen, Heart, Settings } from 'lucide-react-native';
import { useState } from 'react';

export default function TabLayout() {
  const { user, loading, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return null; // Or a loading screen
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {isDemoMode && <DemoBanner />}
      
      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: '#F5F5F5' }]}
        onPress={() => setShowSettings(true)}
        activeOpacity={0.8}
        accessibilityLabel="Open settings menu"
        accessibilityRole="button"
      >
        <Settings size={24} color="#333333" strokeWidth={2} />
      </TouchableOpacity>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarLabelStyle: {
            fontFamily: 'Quicksand-Medium',
            fontSize: 12,
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Routes',
            tabBarIcon: ({ size, color }) => (
              <Map size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="sound"
          options={{
            title: 'Sounds',
            tabBarIcon: ({ size, color }) => (
              <Volume2 size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ size, color }) => (
              <BookOpen size={size} color={color} strokeWidth={2} />
            ),
          }}
        />
      </Tabs>
      {/* Settings Menu */}
      <SettingsMenu
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );