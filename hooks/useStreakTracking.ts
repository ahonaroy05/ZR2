import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
  streakHistory: Array<{
    date: string;
    completed: boolean;
  }>;
}

export function useStreakTracking() {
  const { user, isDemoMode } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    streakHistory: [],
  });
  const [loading, setLoading] = useState(false);

  // Load streak data from storage
  const loadStreakData = useCallback(async () => {
    if (!user) return;

    // In demo mode, start with empty streak data
    if (isDemoMode) {
      const emptyStreak: StreakData = {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        streakHistory: [],
      };
      setStreakData(emptyStreak);
      return;
    }

    try {
      const stored = localStorage.getItem(`streak_${user.id}`);
      if (stored) {
        setStreakData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  }, [user, isDemoMode]);

  // Save streak data to storage
  const saveStreakData = useCallback(async (data: StreakData) => {
    if (!user || isDemoMode) return;

    try {
      localStorage.setItem(`streak_${user.id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }, [user, isDemoMode]);

  // Check if today's streak is completed
  const isTodayCompleted = useCallback((): boolean => {
    const today = new Date().toDateString();
    return streakData.streakHistory.some(
      entry => new Date(entry.date).toDateString() === today && entry.completed
    );
  }, [streakData.streakHistory]);

  // Record today's check-in
  const recordCheckIn = useCallback(async () => {
    if (!user || isTodayCompleted()) return;

    setLoading(true);

    const today = new Date().toISOString();
    const todayString = new Date().toDateString();
    
    // Check if we need to reset streak (missed yesterday)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    const yesterdayCompleted = streakData.streakHistory.some(
      entry => new Date(entry.date).toDateString() === yesterday && entry.completed
    );

    let newCurrentStreak = streakData.currentStreak;
    
    if (streakData.currentStreak === 0 || yesterdayCompleted || streakData.lastCheckIn === null) {
      // Continue or start streak
      newCurrentStreak = streakData.currentStreak + 1;
    } else {
      // Reset streak if we missed yesterday
      const lastCheckInDate = new Date(streakData.lastCheckIn).toDateString();
      const daysSinceLastCheckIn = Math.floor(
        (Date.now() - new Date(streakData.lastCheckIn).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastCheckIn > 1) {
        newCurrentStreak = 1; // Reset to 1 for today
      } else {
        newCurrentStreak = streakData.currentStreak + 1;
      }
    }

    const newStreakData: StreakData = {
      ...streakData,
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(streakData.longestStreak, newCurrentStreak),
      lastCheckIn: today,
      streakHistory: [
        { date: today, completed: true },
        ...streakData.streakHistory.filter(
          entry => new Date(entry.date).toDateString() !== todayString
        ),
      ].slice(0, 365), // Keep last year of data
    };

    setStreakData(newStreakData);
    await saveStreakData(newStreakData);
    setLoading(false);
  }, [user, streakData, isTodayCompleted, saveStreakData]);

  // Get streak status for a specific date
  const getStreakStatusForDate = useCallback((date: Date): boolean => {
    const dateString = date.toDateString();
    return streakData.streakHistory.some(
      entry => new Date(entry.date).toDateString() === dateString && entry.completed
    );
  }, [streakData.streakHistory]);

  // Get weekly completion rate
  const getWeeklyCompletionRate = useCallback((): number => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEntries = streakData.streakHistory.filter(
      entry => new Date(entry.date) >= oneWeekAgo
    );
    
    if (weeklyEntries.length === 0) return 0;
    
    const completedDays = weeklyEntries.filter(entry => entry.completed).length;
    return (completedDays / Math.min(weeklyEntries.length, 7)) * 100;
  }, [streakData.streakHistory]);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    lastCheckIn: streakData.lastCheckIn,
    streakHistory: streakData.streakHistory,
    streakData,
    loading,
    isTodayCompleted: isTodayCompleted(),
    recordCheckIn,
    getStreakStatusForDate,
    getWeeklyCompletionRate,
  };
}