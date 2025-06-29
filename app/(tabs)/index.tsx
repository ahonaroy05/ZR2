import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useStressTracking } from '@/hooks/useStressTracking';
import { useMeditationTracking } from '@/hooks/useMeditationTracking';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { StressMeter } from '@/components/StressMeter';
import { BreathingBubble } from '@/components/BreathingBubble';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { EmergencyCalm } from '@/components/EmergencyCalm';
import { Calendar, Clock, TrendingUp, Shield, MapPin, Settings } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, isDemoMode } = useAuth();
  const { theme } = useTheme();
  const { getCurrentStressLevel, getAverageStressLevel, recordStressLevel } = useStressTracking();
  const { sessions, getWeeklyStats } = useMeditationTracking();
  const [stressLevel] = useState(72);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showEmergencyCalm, setShowEmergencyCalm] = useState(false);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);

  // Get current stress level or use default
  const currentStress = getCurrentStressLevel() || stressLevel;
  const averageStress = getAverageStressLevel() || 0;

  // Load weekly stats
  React.useEffect(() => {
    const loadStats = async () => {
      const stats = await getWeeklyStats();
      setWeeklyStats(stats);
    };
    loadStats();
  }, []);

  const todayStats = {
    commutes: 2,
    mindfulMinutes: weeklyStats?.totalMinutes || 18,
    stressReduction: weeklyStats?.averageStressReduction || 23,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        style={[
          styles.settingsButton,
          { top: isDemoMode ? 60 : 20 } // Adjust for demo banner
        ]}
        onPress={() => router.push('/settings')}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#B6D0E2', '#87CEEB']}
          style={styles.settingsGradient}
        >
          <Settings size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
      
      <ScrollView style={[styles.scrollView]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good morning, {user?.user_metadata?.username || 'Friend'}
            </Text>
            <Text style={styles.subtitle}>How are you feeling today?</Text>
            <TouchableOpacity>
                <Text style={[styles.signOutText, { color: theme.colors.surface }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stressSection}>
          <StressMeter stressLevel={currentStress} size={140} />
          <View style={styles.stressInfo}>
            <Text style={[styles.stressDescription, { color: theme.colors.textSecondary }]}>
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
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mindful Breathing</Text>
          <TouchableOpacity 
            onPress={() => setIsBreathing(!isBreathing)}
            activeOpacity={0.8}
          >
            <BreathingBubble isActive={isBreathing} size={160} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={[styles.actionCard, { shadowColor: theme.colors.shadow }]}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MapPin size={24} color="#FAFAFA" />
                <Text style={[styles.actionText, { color: theme.colors.surface }]}>Start Journey</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { shadowColor: theme.colors.shadow }]}
              onPress={() => setShowEmergencyCalm(true)}
            >
              <LinearGradient
                colors={[theme.colors.accent, theme.colors.primary]}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Shield size={24} color="#FAFAFA" />
                <Text style={[styles.actionText, { color: theme.colors.surface }]}>Emergency Calm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todayStats}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{todayStats.commutes}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Commutes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <Clock size={20} color={theme.colors.accent} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{todayStats.mindfulMinutes}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Mindful Minutes</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
              <TrendingUp size={20} color={theme.colors.success} />
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>{todayStats.stressReduction}%</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Stress Reduction</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentSessions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Sessions</Text>
          <View style={[styles.sessionCard, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
            <View style={styles.sessionHeader}>
              <Text style={[styles.sessionTitle, { color: theme.colors.text }]}>Morning Commute</Text>
              <Text style={[styles.sessionTime, { color: theme.colors.textSecondary }]}>8:30 AM</Text>
            </View>
            <Text style={[styles.sessionDescription, { color: theme.colors.textSecondary }]}>
              15-minute guided meditation with nature sounds
            </Text>
            <View style={styles.sessionStats}>
              <Text style={[styles.sessionStat, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>-18% stress</Text>
              <Text style={[styles.sessionStat, { color: theme.colors.primary, backgroundColor: theme.colors.primaryLight }]}>Forest sounds</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <FloatingActionButton 
        onPress={() => setIsBreathing(!isBreathing)}
        isActive={isBreathing}
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
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#666',
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
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
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
    color: '#666',
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
    color: '#333',
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
    shadowColor: '#87CEEB',
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
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#666',
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
    color: '#333',
  },
  sessionTime: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#666',
  },
  sessionDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#666',
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
    color: '#FFFFFF',
    marginTop: 8,
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
  }
});