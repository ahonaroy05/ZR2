import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { User, Bell, Shield, Palette, Volume2, Moon, Globe, CircleHelp as HelpCircle, MessageSquare, Star, LogOut, ChevronRight, Settings as SettingsIcon } from 'lucide-react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
}

export default function SettingsScreen() {
  const { user, signOut, isDemoMode } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: user?.user_metadata?.username || user?.email || 'Manage your profile',
          icon: <User size={20} color="#B6D0E2" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to profile'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your data and security settings',
          icon: <Shield size={20} color="#87CEEB" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to privacy'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive mindfulness reminders',
          icon: <Bell size={20} color="#A8E6CF" />,
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: <Moon size={20} color="#DDA0DD" />,
          type: 'toggle' as const,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          id: 'sound',
          title: 'Sound Effects',
          subtitle: 'Enable app sounds and feedback',
          icon: <Volume2 size={20} color="#FFB6C1" />,
          type: 'toggle' as const,
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
        {
          id: 'autoplay',
          title: 'Auto-play Sessions',
          subtitle: 'Automatically start next meditation',
          icon: <Palette size={20} color="#98E4D6" />,
          type: 'toggle' as const,
          value: autoPlay,
          onToggle: setAutoPlay,
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English (US)',
          icon: <Globe size={20} color="#B6D0E2" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to language'),
        },
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: <HelpCircle size={20} color="#87CEEB" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to help'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve ZenRoute',
          icon: <MessageSquare size={20} color="#A8E6CF" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to feedback'),
        },
        {
          id: 'rate',
          title: 'Rate ZenRoute',
          subtitle: 'Share your experience',
          icon: <Star size={20} color="#DDA0DD" />,
          type: 'navigation' as const,
          onPress: () => console.log('Navigate to rating'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color || '#F0F7FF'}` }]}>
            {item.icon}
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E0E0E0', true: '#B6D0E2' }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E0E0E0"
            />
          ) : (
            <ChevronRight size={16} color="#CCC" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <LinearGradient
                  colors={['#B6D0E2', '#87CEEB']}
                  style={styles.headerIconGradient}
                >
                  <SettingsIcon size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Customize your ZenRoute experience</Text>
              </View>
            </View>
          </View>
        </View>

        {isDemoMode && (
          <View style={styles.demoBanner}>
            <LinearGradient
              colors={['#FFB6C1', '#DDA0DD']}
              style={styles.demoBannerGradient}
            >
              <Text style={styles.demoBannerText}>
                🎭 Demo Mode - Settings changes won't be saved
              </Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.content}>
          {settingSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <View key={item.id}>
                    {renderSettingItem(item)}
                    {itemIndex < section.items.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.section}>
            <View style={styles.sectionContent}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={signOut}
                activeOpacity={0.7}
              >
                <View style={styles.settingItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFE5E5' }]}>
                    <LogOut size={20} color="#FF6B6B" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingTitle, { color: '#FF6B6B' }]}>
                      Sign Out
                    </Text>
                    <Text style={styles.settingSubtitle}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <ChevronRight size={16} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>ZenRoute v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              Made with ❤️ for mindful commuting
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    marginRight: 16,
  },
  headerIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B6D0E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  demoBanner: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  demoBannerGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  demoBannerText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#87CEEB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#333',
  },
  settingSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 76,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#999',
  },
  footerSubtext: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#CCC',
    marginTop: 4,
  },
});