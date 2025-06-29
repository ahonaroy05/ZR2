import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useStressTracking } from '@/hooks/useStressTracking';
import { useMeditationTracking } from '@/hooks/useMeditationTracking';
import { TimeBasedGreeting } from '@/components/TimeBasedGreeting';
import { StressMeter } from '@/components/StressMeter';
import { BreathingBubble } from '@/components/BreathingBubble';
import { EmergencyCalm } from '@/components/EmergencyCalm';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { Calendar, Clock, TrendingUp, Shield, MapPin, Menu } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, isDemoMode } = useAuth();
  const { colors, theme } = useTheme();
  const { getCurrentStressLevel, getAverageStressLevel, recordStressLevel } = useStressTracking();
  const { sessions, getWeeklyStats } = useMeditationTracking();
  const [stressLevel] = useState(72);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showEmergencyCalm, setShowEmergencyCalm] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation for breathing button press
  const pressScale = useSharedValue(1);

  // Get current stress level or use default
  const currentStress = getCurrentStressLevel() || stressLevel;
  const averageStress = getAverageStressLevel() || 0;

  // Update time every minute for real-time greeting updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load weekly stats
  React.useEffect(() => {
    const loadStats = async () => {
      const stats = await getWeeklyStats();
      setWeeklyStats(stats);
    };
    loadStats();
  }, []);

  // Animated style for breathing button press
  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const handleBreathingPress = () => {
    setIsBreathing(!isBreathing);
  };

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const todayStats = {
    commutes: 2,
    mindfulMinutes: weeklyStats?.totalMinutes || 18,
    stressReduction: weeklyStats?.averageStressReduction || 23,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={[
          styles.settingsButton,
          { top: isDemoMode ? 60 : 20 } // Adjust for demo banner
        ]}
        onPress={() => setShowSettingsDrawer(true)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={theme.gradient.primary}
          style={styles.settingsGradient}
        >
          <Menu size={20} color={colors.textInverse} />
        </LinearGradient>
      </TouchableOpacity>
      
      <ScrollView style={[styles.scrollView]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <TimeBasedGreeting 
              username={user?.user_metadata?.username || 'Friend'}
              style={styles.greeting}
              updateInterval={60000}
            />
            <Text style={[styles.subtitle, { color: colors.text }]}>How are you feeling today?</Text>
          </View>
        </View>

        <View style={styles.stressSection}>
          <StressMeter stressLevel={currentStress} size={140} />
          <View style={styles.stressInfo}>
            <Text style={[styles.stressDescription, { color: colors.text }]}>
              {currentStress > 70 
                ? 'Your stress level is elevated. Consider taking a few mindful breaths.'
                : currentStress > 40
                ? 'Your stress level is moderate. You\'re doing well!'
                : 'Your stress level is low. Great job staying calm!'
              }
            </Text>
          </View>
        </View>

        <View style={styles.breathingSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mindful Breathing</Text>
          <Animated.View style={animatedPressStyle}>
            <TouchableOpacity 
              onPress={handleBreathingPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              <BreathingBubble isActive={isBreathing} size={160} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionCard, { shadowColor: colors.shadow }]}>
              <LinearGradient
                colors={theme.gradient.primary}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MapPin size={24} color={colors.textInverse} />
                <Text style={[styles.actionText, { color: colors.textInverse }]}>Start Journey</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { shadowColor: colors.shadow }]}
              onPress={() => setShowEmergencyCalm(true)}
            >
              <LinearGradient
                colors={theme.gradient.accent}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Shield size={24} color={colors.textInverse} />
                <Text style={[styles.actionText, { color: colors.textInverse }]}>Emergency Calm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todayStats}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{todayStats.commutes}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Commutes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <Clock size={20} color={colors.accent} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{todayStats.mindfulMinutes}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Mindful Minutes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <TrendingUp size={20} color={colors.success} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{todayStats.stressReduction}%</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Stress Reduction</Text>
            </View>
          </View>
        </View>
        <View style={styles.recentSessions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
          <View style={[styles.sessionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: colors.text }]}>Morning Commute</Text>
              <Text style={[styles.sessionTime, { color: colors.text }]}>8:30 AM</Text>
            </View>
            <Text style={[styles.sessionDescription, { color: colors.text }]}>
              15-minute guided meditation with nature sounds
            </Text>
            <View style={styles.sessionStats}>
              <Text style={[styles.sessionStat, { color: colors.primary, backgroundColor: colors.primaryLight }]}>-18% stress</Text>
              <Text style={[styles.sessionStat, { color: colors.primary, backgroundColor: colors.primaryLight }]}>Forest sounds</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SettingsDrawer
        visible={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
      />
      <EmergencyCalm 
        visible={showEmergencyCalm}
        onClose={() => setShowEmergencyCalm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute',
    left: 24,
    zIndex: 1000,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  signOutText: {
  },
  stressSection: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  stressInfo: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  stressDescription: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  breathingSection: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    marginBottom: 16,
  },
  quickActions: {
    paddingBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  settingsGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    textAlign: 'center',
  },
  todayStats: {
    paddingBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    marginTop: 4,
  },
  recentSessions: {
    paddingBottom: 120,
  },
  sessionCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
  sessionTime: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  sessionDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  sessionStat: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});