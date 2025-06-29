import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { DemoBanner } from '@/components/DemoBanner';
import { Chrome as Home, Map, Volume2, BookOpen, Heart } from 'lucide-react-native';

export default function TabLayout() {
  const { user, loading, isDemoMode } = useAuth();

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
    </>
  );
}