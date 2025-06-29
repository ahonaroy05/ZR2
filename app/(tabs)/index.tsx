import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useStressTracking } from '@/hooks/useStressTracking';
import { useMeditationTracking } from '@/hooks/useMeditationTracking';
import { StressMeter } from '@/components/StressMeter';
import { BreathingBubble } from '@/components/BreathingBubble';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { EmergencyCalm } from '@/components/EmergencyCalm';
import { Calendar, Clock, TrendingUp, Shield, MapPin } from 'lucide-react-native';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Good morning, {user?.user_metadata?.username || 'Friend'}
              </Text>
              <Text style={styles.subtitle}>How are you feeling today?</Text>
            </View>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stressSection}>
          <StressMeter stressLevel={currentStress} size={140} />
          <View style={styles.stressInfo}>
            <Text style={styles.stressDescription}>
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
          <Text style={styles.sectionTitle}>Mindful Breathing</Text>
          <TouchableOpacity 
            onPress={() => setIsBreathing(!isBreathing)}
            activeOpacity={0.8}
          >
            <BreathingBubble isActive={isBreathing} size={160} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#A8E6CF', '#98E4D6']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MapPin size={24} color="#FAFAFA" />
                <Text style={styles.actionText}>Start Journey</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => setShowEmergencyCalm(true)}
            >
              <LinearGradient
                colors={['#FFB6C1', '#DDA0DD']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Shield size={24} color="#FAFAFA" />
                <Text style={styles.actionText}>Emergency Calm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todayStats}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={20} color="#A8E6CF" />
              <Text style={styles.statNumber}>{todayStats.commutes}</Text>
              <Text style={styles.statLabel}>Commutes</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={20} color="#DDA0DD" />
              <Text style={styles.statNumber}>{todayStats.mindfulMinutes}</Text>
              <Text style={styles.statLabel}>Mindful Minutes</Text>
            </View>
            <View style={styles.statCard}>
              <TrendingUp size={20} color="#FFB6C1" />
              <Text style={styles.statNumber}>{todayStats.stressReduction}%</Text>
              <Text style={styles.statLabel}>Stress Reduction</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentSessions}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionTitle}>Morning Commute</Text>
              <Text style={styles.sessionTime}>8:30 AM</Text>
            </View>
            <Text style={styles.sessionDescription}>
              15-minute guided meditation with nature sounds
            </Text>
            <View style={styles.sessionStats}>
              <Text style={styles.sessionStat}>-18% stress</Text>
              <Text style={styles.sessionStat}>Forest sounds</Text>
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
    backgroundColor: '#FAFAFA',
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
  signOutButton: {
    backgroundColor: '#FFB6C1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  signOutText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#FAFAFA',
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#FAFAFA',
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#A8E6CF',
    backgroundColor: '#F0FAF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});