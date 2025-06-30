import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWellnessGoals, 
  addWellnessGoal, 
  updateWellnessGoal, 
  WellnessGoal 
} from '@/lib/database';

export function useWellnessGoals() {
  const { user, isDemoMode } = useAuth();
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    if (!user) return;

    // In demo mode, start with empty goals
    if (isDemoMode) {
      setGoals([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getWellnessGoals(user.id);
      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wellness goals');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const createGoal = useCallback(async (goalData: Omit<WellnessGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockGoal: WellnessGoal = {
        id: `demo-goal-${Date.now()}`,
        user_id: user.id,
        ...goalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setGoals(prev => [mockGoal, ...prev]);
      return { data: mockGoal, error: null };
    }

    try {
      const { data, error } = await addWellnessGoal({
        user_id: user.id,
        ...goalData,
      });

      if (error) throw error;

      if (data) {
        setGoals(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create wellness goal';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<WellnessGoal>) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just update local state
    if (isDemoMode) {
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates, updated_at: new Date().toISOString() } : goal
      ));
      return { data: goals.find(g => g.id === goalId), error: null };
    }

    try {
      const { data, error } = await updateWellnessGoal(goalId, updates);
      if (error) throw error;

      if (data) {
        setGoals(prev => prev.map(goal => goal.id === goalId ? data : goal));
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update wellness goal';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode, goals]);

  const completeGoal = useCallback(async (goalId: string) => {
    return updateGoal(goalId, {
      is_completed: true,
      completed_at: new Date().toISOString(),
    });
  }, [updateGoal]);

  const deactivateGoal = useCallback(async (goalId: string) => {
    return updateGoal(goalId, { is_active: false });
  }, [updateGoal]);

  const getActiveGoals = useCallback(() => {
    return goals.filter(goal => goal.is_active && !goal.is_completed);
  }, [goals]);

  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.is_completed);
  }, [goals]);

  const getGoalProgress = useCallback((goal: WellnessGoal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    completeGoal,
    deactivateGoal,
    getActiveGoals,
    getCompletedGoals,
    getGoalProgress,
    refreshGoals: loadGoals,
  };
}