import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DemoBanner } from '@/components/DemoBanner';
import { AiAssistantFab } from '@/components/AiAssistantFab';
import { AiAssistantChat } from '@/components/AiAssistantChat';
import { House, Map, Volume2, BookOpen, Trophy } from 'lucide-react-native';

export default function TabLayout() {
  const { user, loading, isDemoMode } = useAuth();
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
            backgroundColor: '#F8FBFF',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: '#B6D0E2',
          tabBarInactiveTintColor: '#87CEEB',
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
              <House size={size} color={color} strokeWidth={2} />
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
        <Tabs.Screen
          name="achievements"
          options={{
            title: 'Achievements',
            tabBarIcon: ({ size, color }) => (
              <Trophy size={size} color={color} strokeWidth={2} />
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