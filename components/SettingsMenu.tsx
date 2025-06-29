import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { X, Globe, Bell, User, Lock, Shield, Type, Palette, LayoutGrid as Layout, ChevronRight, Settings as SettingsIcon } from 'lucide-react-native';

interface SettingsMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action' | 'component';
  value?: boolean;
  onPress?: () => void;
  component?: React.ReactNode;
}

export function SettingsMenu({ visible, onClose }: SettingsMenuProps) {
  const { theme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Medium');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState(false);

  // Animation values
  const slideAnim = useSharedValue(-400);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      slideAnim.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      slideAnim.value = withTiming(-400, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedMenuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleClose = () => {
    slideAnim.value = withTiming(-400, { duration: 300 });
    overlayOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            signOut();
            onClose();
          }
        },
      ]
    );
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];
  const fontSizes = ['Small', 'Medium', 'Large', 'Extra Large'];

  const generalSettings: SettingItem[] = [
    {
      id: 'language',
      title: 'Language',
      subtitle: selectedLanguage,
      icon: <Globe size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => setShowLanguageModal(true),
    },
    {
      id: 'theme',
      title: 'Theme',
      subtitle: isDark ? 'Dark' : 'Light',
      icon: <Palette size={20} color={theme.colors.primary} />,
      type: 'component',
      component: <ThemeToggle size={32} />,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Push notifications and alerts',
      icon: <Bell size={20} color={theme.colors.primary} />,
      type: 'toggle',
      value: notifications,
      onPress: () => setNotifications(!notifications),
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'Profile Information',
      subtitle: user?.user_metadata?.username || user?.email || 'Update your profile',
      icon: <User size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => Alert.alert('Profile', 'Profile settings coming soon!'),
    },
    {
      id: 'password',
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: <Lock size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => Alert.alert('Password', 'Password change coming soon!'),
    },
    {
      id: 'privacy',
      title: 'Privacy Controls',
      subtitle: 'Manage your data and privacy',
      icon: <Shield size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
    },
  ];

  const displaySettings: SettingItem[] = [
    {
      id: 'fontSize',
      title: 'Font Size',
      subtitle: fontSize,
      icon: <Type size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => setShowFontModal(true),
    },
    {
      id: 'layout',
      title: 'Layout Preferences',
      subtitle: 'Customize your interface',
      icon: <Layout size={20} color={theme.colors.primary} />,
      type: 'navigation',
      onPress: () => Alert.alert('Layout', 'Layout preferences coming soon!'),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, { backgroundColor: theme.colors.card }]}
      onPress={item.onPress}
      disabled={item.type === 'component'}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        <View style={styles.settingAction}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          )}
          {item.type === 'navigation' && (
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          )}
          {item.type === 'component' && item.component}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
        {items.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const LanguageModal = () => (
    <Modal visible={showLanguageModal} transparent animationType="fade">
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Language</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.modalItem,
                  { backgroundColor: theme.colors.card },
                  selectedLanguage === language && { backgroundColor: theme.colors.primaryLight }
                ]}
                onPress={() => {
                  setSelectedLanguage(language);
                  setShowLanguageModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: theme.colors.text },
                  selectedLanguage === language && { color: theme.colors.primary }
                ]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  const FontSizeModal = () => (
    <Modal visible={showFontModal} transparent animationType="fade">
      <BlurView intensity={20} style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Font Size</Text>
            <TouchableOpacity onPress={() => setShowFontModal(false)}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.modalItem,
                  { backgroundColor: theme.colors.card },
                  fontSize === size && { backgroundColor: theme.colors.primaryLight }
                ]}
                onPress={() => {
                  setFontSize(size);
                  setShowFontModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  { color: theme.colors.text },
                  fontSize === size && { color: theme.colors.primary }
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <View style={styles.container}>
          {/* Overlay */}
          <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
            <TouchableOpacity
              style={styles.overlayTouchable}
              onPress={handleClose}
              activeOpacity={1}
            />
          </Animated.View>

          {/* Settings Menu */}
          <Animated.View style={[styles.menu, { backgroundColor: theme.colors.background }, animatedMenuStyle]}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <SettingsIcon size={24} color={theme.colors.primary} />
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.card }]}
                onPress={handleClose}
              >
                <X size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {renderSection('General Settings', generalSettings)}
              {renderSection('Account Settings', accountSettings)}
              {renderSection('Display Settings', displaySettings)}

              {/* Sign Out Button */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.signOutButton, { backgroundColor: theme.colors.error }]}
                  onPress={handleSignOut}
                >
                  <Text style={[styles.signOutText, { color: theme.colors.surface }]}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <LanguageModal />
      <FontSizeModal />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    width: 320,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    marginLeft: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  settingSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    marginTop: 2,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  signOutButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
  },
  modalContent: {
    maxHeight: 300,
  },
  modalItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalItemText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
  },
});