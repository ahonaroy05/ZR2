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
import { BoltLogo } from '@/components/BoltLogo';
import { Calendar, Clock, TrendingUp, Shield, MapPin, Menu } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, isDemoMode } = useAuth();
  const { colors, theme } = useTheme();
  const { getCurrentStressLevel, getAverageStressLevel, recordStressLevel } = useStressTracking();
  const { sessions, getWeeklyStats } = useMeditationTracking();
  const [isBreathing, setIsBreathing] = useState(false);
  const [showEmergencyCalm, setShowEmergencyCalm] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation for breathing button press
  const pressScale = useSharedValue(1);

  // Get current stress level
  const currentStress = getCurrentStressLevel();
  const averageStress = getAverageStressLevel();

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

  // Calculate today's stats from actual data
  const todayStats = {
    commutes: 0, // This would be calculated from actual journey data
    mindfulMinutes: weeklyStats?.totalMinutes || 0,
    stressReduction: weeklyStats?.averageStressReduction || 0,
  };

  // Get stress level description
  const getStressDescription = (level: number | null) => {
    if (level === null) {
      return 'Start tracking your stress levels to see insights here.';
    }
    
    if (level > 70) {
      return 'Your stress level is elevated. Consider taking a few mindful breaths.';
    } else if (level > 40) {
      return 'Your stress level is moderate. You\'re doing well!';
    } else {
      return 'Your stress level is low. Great job staying calm!';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity 
        style={[
          styles.settingsButton,
          { top: isDemoMode ? 120 : 80 }
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
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <TimeBasedGreeting 
                username={user?.user_metadata?.username || 'Friend'}
                style={styles.greeting}
                updateInterval={60000}
              />
            </View>
            
            {/* Bolt Logo positioned on the same line as greeting */}
            <View style={styles.boltLogoContainer}>
              <BoltLogo size={42} />
            </View>
          </View>
          
          <Text style={[styles.subtitle, { color: colors.text }]}>How are you feeling today?</Text>
        </View>

        <View style={styles.stressSection}>
          <StressMeter stressLevel={currentStress || 50} size={140} />
          <View style={styles.stressInfo}>
            <Text style={[styles.stressDescription, { color: colors.text }]}>
              {getStressDescription(currentStress)}
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
              <Text style={[styles.statLabel, { color: colors.text }]}>Journeys</Text>
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

        {/* Recent Sessions - Only show if there are actual sessions */}
        {sessions.length > 0 && (
          <View style={styles.recentSessions}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
            {sessions.slice(0, 3).map((session, index) => (
              <View key={session.id || index} style={[styles.sessionCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <View style={styles.sessionHeader}>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>
                    {session.session_type === 'breathing' ? 'Breathing Exercise' : 
                     session.session_type === 'meditation' ? 'Meditation Session' : 
                     'Mindfulness Session'}
                  </Text>
                  <Text style={[styles.sessionTime, { color: colors.text }]}>
                    {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={[styles.sessionDescription, { color: colors.text }]}>
                  {session.duration_minutes}-minute {session.session_type} session
                </Text>
                <View style={styles.sessionStats}>
                  {session.stress_before && session.stress_after && (
                    <Text style={[styles.sessionStat, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                      -{Math.round(((session.stress_before - session.stress_after) / session.stress_before) * 100)}% stress
                    </Text>
                  )}
                  <Text style={[styles.sessionStat, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                    {session.session_type}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty state when no sessions */}
        {sessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Start Your Mindful Journey</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Begin with a breathing exercise or meditation session to see your progress here.
            </Text>
          </View>
        )}
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
  },
  boltLogoContainer: {
    marginLeft: 16,
    marginTop: 4, // Slight adjustment to align with text baseline
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
    paddingBottom: 32,
  },
  sessionCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});