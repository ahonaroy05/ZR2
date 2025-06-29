import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Switch, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2, 
  Moon, 
  Globe, 
  CircleHelp as HelpCircle, 
  MessageSquare, 
  Star, 
  LogOut, 
  ChevronRight, 
  X,
  Settings as SettingsIcon 
} from 'lucide-react-native';

interface SettingsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 350);

export function SettingsDrawer({ visible, onClose }: SettingsDrawerProps) {
  const { user, signOut, isDemoMode } = useAuth();
  const { colors, theme, isDarkMode, toggleTheme } = useTheme();
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);

  // Settings state
  const [notifications, setNotifications] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [autoPlay, setAutoPlay] = React.useState(false);

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleSignOut = () => {
    onClose();
    setTimeout(() => {
      signOut();
    }, 300);
  };

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
          value: isDarkMode,
          onToggle: toggleTheme,
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
        style={[styles.settingItem]}
        onPress={item.onPress}
        disabled={item.type === 'toggle'}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${item.color || colors.primaryLight}` }]}>
            {item.icon}
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            {item.subtitle && (
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.settingItemRight}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
              ios_backgroundColor={colors.border}
            />
          ) : (
            <ChevronRight size={16} color={colors.border} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { backgroundColor: colors.overlay }, overlayAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.overlayTouchable} 
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Drawer */}
        <Animated.View style={[styles.drawer, { backgroundColor: colors.background }, drawerAnimatedStyle, { width: DRAWER_WIDTH }]}>
          <View style={styles.drawerContent}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.headerIconContainer}>
                    <LinearGradient
                      colors={theme.gradient.primary}
                      style={styles.headerIconGradient}
                    >
                      <SettingsIcon size={24} color={colors.textInverse} />
                    </LinearGradient>
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Customize your experience</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Demo Banner */}
            {isDemoMode && (
              <View style={[styles.demoBanner]}>
                <LinearGradient
                  colors={[colors.warning, colors.accent]}
                  style={styles.demoBannerGradient}
                >
                  <Text style={[styles.demoBannerText, { color: colors.textInverse }]}>
                    🎭 Demo Mode - Settings changes won't be saved
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Settings Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                {settingSections.map((section, sectionIndex) => (
                  <View key={section.title} style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                    <View style={[styles.sectionContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                      {section.items.map((item, itemIndex) => (
                        <View key={item.id}>
                          {renderSettingItem(item)}
                          {itemIndex < section.items.length - 1 && (
                            <View style={[styles.separator, { backgroundColor: colors.border }]} />
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                ))}

                {/* Sign Out Section */}
                <View style={styles.section}>
                  <View style={[styles.sectionContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <TouchableOpacity
                      style={styles.signOutButton}
                      onPress={handleSignOut}
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
                          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                            Sign out of your account
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: colors.textSecondary }]}>ZenRoute v1.0.0</Text>
                  <Text style={[styles.footerSubtext, { color: colors.border }]}>
                    Made with ❤️ for mindful commuting
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    marginRight: 12,
  },
  headerIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  demoBanner: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  demoBannerGradient: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  demoBannerText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 15,
  },
  settingSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    marginTop: 1,
  },
  settingItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    marginLeft: 64,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 13,
  },
  footerSubtext: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 11,
    marginTop: 2,
  },
});