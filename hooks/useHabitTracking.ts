import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createHabit, 
  getUserHabits, 
  completeHabit, 
  getHabitCompletions,
  HabitTracking,
  HabitCompletion 
} from '@/lib/enhancedDatabase';

export function useHabitTracking() {
  const { user, isDemoMode } = useAuth();
  const [habits, setHabits] = useState<HabitTracking[]>([]);
  const [completions, setCompletions] = useState<Record<string, HabitCompletion[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    if (!user) return;

    // In demo mode, return mock habits
    if (isDemoMode) {
      const mockHabits: HabitTracking[] = [
        {
          id: 'demo-habit-1',
          user_id: user.id,
          habit_name: 'Morning Meditation',
          habit_category: 'mindfulness',
          target_frequency: 1,
          frequency_unit: 'daily',
          current_streak: 3,
          longest_streak: 7,
          is_active: true,
          reminder_time: '07:00',
          reminder_enabled: true,
          habit_color: '#A8E6CF',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-habit-2',
          user_id: user.id,
          habit_name: 'Gratitude Journal',
          habit_category: 'mindfulness',
          target_frequency: 1,
          frequency_unit: 'daily',
          current_streak: 1,
          longest_streak: 5,
          is_active: true,
          reminder_time: '21:00',
          reminder_enabled: true,
          habit_color: '#FFB6C1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setHabits(mockHabits);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getUserHabits(user.id);
      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const addHabit = useCallback(async (habitData: Omit<HabitTracking, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockHabit: HabitTracking = {
        id: `demo-habit-${Date.now()}`,
        user_id: user.id,
        ...habitData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setHabits(prev => [mockHabit, ...prev]);
      return { data: mockHabit, error: null };
    }

    try {
      const { data, error } = await createHabit({
        user_id: user.id,
        ...habitData,
      });

      if (error) throw error;

      if (data) {
        setHabits(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode]);

  const completeHabitToday = useCallback(async (habitId: string, moodRating?: number, notes?: string) => {
    if (!user) return { error: 'User not authenticated' };

    const today = new Date().toISOString().split('T')[0];

    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockCompletion: HabitCompletion = {
        id: `demo-completion-${Date.now()}`,
        habit_id: habitId,
        user_id: user.id,
        completion_date: today,
        completion_time: new Date().toISOString(),
        mood_rating,
        notes,
        created_at: new Date().toISOString(),
      };

      setCompletions(prev => ({
        ...prev,
        [habitId]: [mockCompletion, ...(prev[habitId] || [])],
      }));

      // Update habit streak (simplified for demo)
      setHabits(prev => prev.map(habit => 
        habit.id === habitId 
          ? { 
              ...habit, 
              current_streak: habit.current_streak + 1,
              longest_streak: Math.max(habit.longest_streak, habit.current_streak + 1)
            }
          : habit
      ));

      return { data: mockCompletion, error: null };
    }

    try {
      const { data, error } = await completeHabit({
        habit_id: habitId,
        user_id: user.id,
        completion_date: today,
        completion_time: new Date().toISOString(),
        mood_rating,
        notes,
      });

      if (error) throw error;

      if (data) {
        setCompletions(prev => ({
          ...prev,
          [habitId]: [data, ...(prev[habitId] || [])],
        }));
      }

      // Reload habits to get updated streak information
      await loadHabits();

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete habit';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode, loadHabits]);

  const loadHabitCompletions = useCallback(async (habitId: string, days = 30) => {
    if (!user || isDemoMode) return;

    try {
      const { data, error } = await getHabitCompletions(habitId, days);
      if (error) throw error;

      setCompletions(prev => ({
        ...prev,
        [habitId]: data || [],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load habit completions');
    }
  }, [user, isDemoMode]);

  const isHabitCompletedToday = useCallback((habitId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const habitCompletions = completions[habitId] || [];
    return habitCompletions.some(completion => completion.completion_date === today);
  }, [completions]);

  const getHabitCompletionRate = useCallback((habitId: string, days = 7): number => {
    const habitCompletions = completions[habitId] || [];
    const recentCompletions = habitCompletions.filter(completion => {
      const completionDate = new Date(completion.completion_date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return completionDate >= cutoffDate;
    });

    return (recentCompletions.length / days) * 100;
  }, [completions]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    completions,
    loading,
    error,
    addHabit,
    completeHabitToday,
    loadHabitCompletions,
    isHabitCompletedToday,
    getHabitCompletionRate,
    refreshHabits: loadHabits,
  };
}