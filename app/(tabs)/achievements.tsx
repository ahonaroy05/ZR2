import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useDailyAffirmations } from '@/hooks/useDailyAffirmations';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  RefreshCw, 
  Heart, 
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Shield,
  Gem
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AchievementsScreen() {
  const { colors, theme } = useTheme();
  const { user, isDemoMode } = useAuth();
  const { 
    achievements, 
    unlockedAchievements, 
    checkAndUnlockAchievements,
    getAchievementProgress 
  } = useAchievements();
  const { currentStreak, longestStreak, streakData } = useStreakTracking();
  const { 
    todaysAffirmation, 
    favoriteAffirmations, 
    refreshAffirmation,
    toggleFavorite,
    affirmationCount 
  } = useDailyAffirmations();

  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);

  // Animation values
  const confettiScale = useSharedValue(0);
  const achievementScale = useSharedValue(1);

  useEffect(() => {
    // Check for new achievements when component mounts
    checkAndUnlockAchievements();
  }, []);

  const triggerAchievementUnlock = (achievement: any) => {
    setNewAchievement(achievement);
    setShowConfetti(true);
    
    // Animate confetti
    confettiScale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(0, { damping: 15 }, () => {
        runOnJS(setShowConfetti)(false);
      })
    );

    // Show achievement notification
    Alert.alert(
      '🎉 Achievement Unlocked!',
      `${achievement.title}\n\n${achievement.description}`,
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
    opacity: confettiScale.value,
  }));

  const getAchievementIcon = (iconName: string) => {
    const iconProps = { size: 24, color: colors.textInverse };
    
    switch (iconName) {
      case 'sprout': return <Sparkles {...iconProps} />;
      case 'loop': return <RefreshCw {...iconProps} />;
      case 'magnet': return <Target {...iconProps} />;
      case 'sun': return <Star {...iconProps} />;
      case 'palette': return <Heart {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'headphones': return <Zap {...iconProps} />;
      case 'meditation': return <Crown {...iconProps} />;
      default: return <Trophy {...iconProps} />;
    }
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak >= 30) return ['#FF6B9D', '#C44569'];
    if (streak >= 14) return ['#FFA726', '#FF8F00'];
    if (streak >= 7) return ['#AB47BC', '#8E24AA'];
    if (streak >= 3) return ['#26A69A', '#00695C'];
    return [colors.primary, colors.accent];
  };

  const renderStreakSection = () => (
    <View style={[styles.streakSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.streakHeader}>
        <View style={styles.streakIconContainer}>
          <LinearGradient
            colors={getStreakBadgeColor(currentStreak)}
            style={styles.streakIconGradient}
          >
            <Flame size={28} color={colors.textInverse} />
          </LinearGradient>
        </View>
        <View style={styles.streakInfo}>
          <Text style={[styles.streakNumber, { color: colors.text }]}>{currentStreak}</Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>Day Streak</Text>
        </View>
        <View style={styles.streakStats}>
          <Text style={[styles.streakBest, { color: colors.textSecondary }]}>Best: {longestStreak}</Text>
        </View>
      </View>
      
      <View style={styles.streakProgress}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={getStreakBadgeColor(currentStreak)}
            style={[
              styles.progressFill,
              { width: `${Math.min((currentStreak / 30) * 100, 100)}%` }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {30 - currentStreak > 0 ? `${30 - currentStreak} days to Zen Master` : 'Zen Master Achieved!'}
        </Text>
      </View>
    </View>
  );

  const renderAchievementBadge = (achievement: any, isUnlocked: boolean) => {
    const progress = getAchievementProgress(achievement.id);
    
    return (
      <TouchableOpacity
        key={achievement.id}
        style={[
          styles.achievementBadge,
          { backgroundColor: colors.card, shadowColor: colors.shadow },
          !isUnlocked && styles.lockedBadge
        ]}
        onPress={() => {
          if (isUnlocked) {
            Alert.alert(
              achievement.title,
              `${achievement.description}\n\nUnlocked: ${new Date(achievement.unlockedAt || Date.now()).toLocaleDateString()}`
            );
          }
        }}
        activeOpacity={0.8}
      >
        <View style={[
          styles.badgeIconContainer,
          { opacity: isUnlocked ? 1 : 0.4 }
        ]}>
          <LinearGradient
            colors={isUnlocked ? achievement.colors : [colors.border, colors.border]}
            style={styles.badgeIconGradient}
          >
            {getAchievementIcon(achievement.icon)}
          </LinearGradient>
          {!isUnlocked && progress > 0 && (
            <View style={[styles.progressRing, { borderColor: colors.primary }]}>
              <Text style={[styles.progressPercentage, { color: colors.primary }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          )}
        </View>
        
        <Text style={[
          styles.badgeTitle,
          { color: isUnlocked ? colors.text : colors.textSecondary }
        ]}>
          {achievement.title}
        </Text>
        
        {isUnlocked && (
          <View style={styles.unlockedIndicator}>
            <Star size={12} color={colors.warning} fill={colors.warning} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAffirmationSection = () => (
    <View style={[styles.affirmationSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.affirmationHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Affirmation</Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primaryLight }]}
          onPress={refreshAffirmation}
        >
          <RefreshCw size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.affirmationCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.affirmationText, { color: colors.text }]}>
          "{todaysAffirmation.text}"
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(todaysAffirmation.id)}
        >
          <Heart 
            size={20} 
            color={favoriteAffirmations.includes(todaysAffirmation.id) ? colors.error : colors.textSecondary}
            fill={favoriteAffirmations.includes(todaysAffirmation.id) ? colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.affirmationStats}>
        <Text style={[styles.affirmationCount, { color: colors.textSecondary }]}>
          {affirmationCount} affirmations this month
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAllButton, { color: colors.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Confetti Animation */}
      {showConfetti && (
        <Animated.View style={[styles.confettiContainer, confettiStyle]}>
          <View style={styles.confetti}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.confettiPiece,
                  {
                    backgroundColor: [colors.primary, colors.accent, colors.success, colors.warning][i % 4],
                    left: `${(i * 5) % 100}%`,
                    animationDelay: `${i * 100}ms`,
                  }
                ]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Achievements</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your mindful journey
          </Text>
        </View>

        {/* Streak Section */}
        {renderStreakSection()}

        {/* Achievements Grid */}
        <View style={styles.achievementsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Badges ({unlockedAchievements.length}/{achievements.length})
          </Text>
          
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.some(ua => ua.achievementId === achievement.id);
              return renderAchievementBadge(achievement, isUnlocked);
            })}
          </View>
        </View>

        {/* Daily Affirmation Section */}
        {renderAffirmationSection()}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingBottom: 24,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
  },
  subtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    marginTop: 8,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  confetti: {
    flex: 1,
    position: 'relative',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -10,
  },
  streakSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakIconContainer: {
    marginRight: 16,
  },
  streakIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
  },
  streakLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    marginTop: -4,
  },
  streakStats: {
    alignItems: 'flex-end',
  },
  streakBest: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  streakProgress: {
    marginTop: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 20,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: (width - 80) / 2,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  badgeIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  progressRing: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontFamily: 'Nunito-Bold',
    fontSize: 8,
  },
  badgeTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  affirmationSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  affirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  affirmationCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  affirmationText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingRight: 40,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  affirmationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  affirmationCount: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  seeAllButton: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
  },
  bottomPadding: {
    height: 100,
  },
});