import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DemoBanner } from '@/components/DemoBanner';
import { AiAssistantFab } from '@/components/AiAssistantFab';
import { AiAssistantChat } from '@/components/AiAssistantChat';
import { House, Map, Volume2, BookOpen, Trophy } from 'lucide-react-native';

export default function TabLayout() {
  const { user, loading, isDemoMode } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [showAiChat, setShowAiChat] = useState(false);

  if (loading) {
    return null; // Or a loading screen
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <>
      {isDemoMode && <DemoBanner />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
            borderTopWidth: 0,
            elevation: 8,
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: isDarkMode ? colors.textSecondary : '#8B7A8B',
          tabBarLabelStyle: {
            fontFamily: 'Quicksand-SemiBold',
            fontSize: 12,
            marginTop: 4,
            fontWeight: '600',
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color, focused }) => (
              <House 
                size={focused ? size + 2 : size} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Routes',
            tabBarIcon: ({ size, color, focused }) => (
              <Map 
                size={focused ? size + 2 : size} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sound"
          options={{
            title: 'Sounds',
            tabBarIcon: ({ size, color, focused }) => (
              <Volume2 
                size={focused ? size + 2 : size} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ size, color, focused }) => (
              <BookOpen 
                size={focused ? size + 2 : size} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Achievements',
            tabBarIcon: ({ size, color, focused }) => (
              <Trophy 
                size={focused ? size + 2 : size} 
                color={color} 
                strokeWidth={focused ? 2.5 : 2} 
              />
            ),
          }}
        />
      </Tabs>
      
      {/* AI Assistant FAB */}
      <AiAssistantFab 
        onPress={() => setShowAiChat(true)}
        isActive={showAiChat}
      />
      
      {/* AI Assistant Chat Modal */}
      <AiAssistantChat
        visible={showAiChat}
        onClose={() => setShowAiChat(false)}
      />
    </>
  );
}