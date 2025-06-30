import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStressTracking } from './useStressTracking';
import { useMeditationTracking } from './useMeditationTracking';
import { useJournalEntries } from './useJournalEntries';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  colors: string[];
  category: 'streak' | 'meditation' | 'journal' | 'stress' | 'special';
  requirement: {
    type: 'streak' | 'meditation_count' | 'journal_count' | 'stress_reduction' | 'affirmation_count';
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  unlockedAt?: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  userId: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'zen_sprout',
    title: 'Zen Sprout',
    description: 'Complete your first mindful session',
    icon: 'sprout',
    colors: ['#A8E6CF', '#7FCDCD'],
    category: 'meditation',
    requirement: {
      type: 'meditation_count',
      target: 1,
      timeframe: 'all_time',
    },
  },
  {
    id: 'lavender_loop',
    title: 'Lavender Loop',
    description: 'Maintain a 7-day streak',
    icon: 'loop',
    colors: ['#DDA0DD', '#BA68C8'],
    category: 'streak',
    requirement: {
      type: 'streak',
      target: 7,
    },
  },
  {
    id: 'mind_magnet',
    title: 'Mind Magnet',
    description: 'Complete 10 meditation sessions',
    icon: 'magnet',
    colors: ['#87CEEB', '#5DADE2'],
    category: 'meditation',
    requirement: {
      type: 'meditation_count',
      target: 10,
      timeframe: 'all_time',
    },
  },
  {
    id: 'calm_commuter',
    title: 'Calm Commuter',
    description: 'Reduce stress by 30% in a session',
    icon: 'sun',
    colors: ['#FFD93D', '#FFC107'],
    category: 'stress',
    requirement: {
      type: 'stress_reduction',
      target: 30,
    },
  },
  {
    id: 'mood_alchemist',
    title: 'Mood Alchemist',
    description: 'Write 5 journal entries',
    icon: 'palette',
    colors: ['#FFB6C1', '#F48FB1'],
    category: 'journal',
    requirement: {
      type: 'journal_count',
      target: 5,
      timeframe: 'all_time',
    },
  },
  {
    id: 'focus_forcefield',
    title: 'Focus Forcefield',
    description: 'Complete 20 meditation sessions',
    icon: 'shield',
    colors: ['#98E4D6', '#4DB6AC'],
    category: 'meditation',
    requirement: {
      type: 'meditation_count',
      target: 20,
      timeframe: 'all_time',
    },
  },
  {
    id: 'sound_surfer',
    title: 'Sound Surfer',
    description: 'Use soundscapes for 5 sessions',
    icon: 'headphones',
    colors: ['#B6D0E2', '#81C784'],
    category: 'special',
    requirement: {
      type: 'meditation_count',
      target: 5,
      timeframe: 'all_time',
    },
  },
  {
    id: 'stillness_master',
    title: 'Stillness Master',
    description: 'Maintain a 30-day streak',
    icon: 'meditation',
    colors: ['#E1BEE7', '#CE93D8'],
    category: 'streak',
    requirement: {
      type: 'streak',
      target: 30,
    },
  },
];

export function useAchievements() {
  const { user, isDemoMode } = useAuth();
  const { sessions: meditationSessions } = useMeditationTracking();
  const { entries: journalEntries } = useJournalEntries();
  const { stressReadings } = useStressTracking();
  
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(false);

  // Load unlocked achievements from storage
  const loadUnlockedAchievements = useCallback(async () => {
    if (!user) return;

    // In demo mode, simulate some unlocked achievements
    if (isDemoMode) {
      const demoUnlocked: UnlockedAchievement[] = [
        {
          achievementId: 'zen_sprout',
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          userId: user.id,
        },
        {
          achievementId: 'mood_alchemist',
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          userId: user.id,
        },
      ];
      setUnlockedAchievements(demoUnlocked);
      return;
    }

    // In a real app, this would load from Supabase
    // For now, use localStorage for web compatibility
    try {
      const stored = localStorage.getItem(`achievements_${user.id}`);
      if (stored) {
        setUnlockedAchievements(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  }, [user, isDemoMode]);

  // Save unlocked achievements to storage
  const saveUnlockedAchievements = useCallback(async (unlocked: UnlockedAchievement[]) => {
    if (!user || isDemoMode) return;

    try {
      localStorage.setItem(`achievements_${user.id}`, JSON.stringify(unlocked));
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  }, [user, isDemoMode]);

  // Check if an achievement should be unlocked
  const checkAchievementRequirement = useCallback((achievement: Achievement): boolean => {
    const { requirement } = achievement;

    switch (requirement.type) {
      case 'meditation_count':
        return meditationSessions.length >= requirement.target;
      
      case 'journal_count':
        return journalEntries.length >= requirement.target;
      
      case 'streak':
        // This would need to be connected to actual streak data
        // For demo purposes, we'll simulate based on meditation sessions
        const recentSessions = meditationSessions.filter(session => {
          const sessionDate = new Date(session.created_at);
          const daysDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= requirement.target;
        });
        return recentSessions.length >= requirement.target;
      
      case 'stress_reduction':
        const sessionsWithReduction = meditationSessions.filter(session => {
          if (!session.stress_before || !session.stress_after) return false;
          const reduction = ((session.stress_before - session.stress_after) / session.stress_before) * 100;
          return reduction >= requirement.target;
        });
        return sessionsWithReduction.length > 0;
      
      case 'affirmation_count':
        // This would connect to affirmation tracking
        return false; // Placeholder
      
      default:
        return false;
    }
  }, [meditationSessions, journalEntries, stressReadings]);

  // Get progress towards an achievement (0-1)
  const getAchievementProgress = useCallback((achievementId: string): number => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const { requirement } = achievement;
    let current = 0;

    switch (requirement.type) {
      case 'meditation_count':
        current = meditationSessions.length;
        break;
      case 'journal_count':
        current = journalEntries.length;
        break;
      case 'streak':
        current = Math.min(meditationSessions.length, requirement.target);
        break;
      case 'stress_reduction':
        const reductionSessions = meditationSessions.filter(session => {
          if (!session.stress_before || !session.stress_after) return false;
          const reduction = ((session.stress_before - session.stress_after) / session.stress_before) * 100;
          return reduction >= requirement.target;
        });
        current = reductionSessions.length > 0 ? requirement.target : 0;
        break;
    }

    return Math.min(current / requirement.target, 1);
  }, [achievements, meditationSessions, journalEntries]);

  // Check and unlock new achievements
  const checkAndUnlockAchievements = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const newUnlocked: UnlockedAchievement[] = [];

    for (const achievement of achievements) {
      const isAlreadyUnlocked = unlockedAchievements.some(
        ua => ua.achievementId === achievement.id
      );

      if (!isAlreadyUnlocked && checkAchievementRequirement(achievement)) {
        const unlocked: UnlockedAchievement = {
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
          userId: user.id,
        };
        newUnlocked.push(unlocked);
      }
    }

    if (newUnlocked.length > 0) {
      const updatedUnlocked = [...unlockedAchievements, ...newUnlocked];
      setUnlockedAchievements(updatedUnlocked);
      await saveUnlockedAchievements(updatedUnlocked);

      // Trigger notifications for new achievements
      newUnlocked.forEach(unlocked => {
        const achievement = achievements.find(a => a.id === unlocked.achievementId);
        if (achievement) {
          // This could trigger a callback to show confetti/notification
          console.log('Achievement unlocked:', achievement.title);
        }
      });
    }

    setLoading(false);
  }, [user, achievements, unlockedAchievements, checkAchievementRequirement, saveUnlockedAchievements]);

  useEffect(() => {
    loadUnlockedAchievements();
  }, [loadUnlockedAchievements]);

  return {
    achievements,
    unlockedAchievements,
    loading,
    checkAndUnlockAchievements,
    getAchievementProgress,
  };
}