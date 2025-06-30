import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getActiveWellnessChallenges, 
  joinWellnessChallenge, 
  getUserChallengeParticipation,
  WellnessChallenge,
  UserChallengeParticipation 
} from '@/lib/enhancedDatabase';

export function useWellnessChallenges() {
  const { user, isDemoMode } = useAuth();
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [userParticipation, setUserParticipation] = useState<UserChallengeParticipation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    // In demo mode, return mock challenges
    if (isDemoMode) {
      const mockChallenges: WellnessChallenge[] = [
        {
          id: 'demo-challenge-1',
          title: '7-Day Mindfulness Starter',
          description: 'Complete 7 days of meditation to build a mindful habit',
          challenge_type: 'meditation',
          duration_days: 7,
          target_metric: 'meditation_minutes',
          target_value: 70,
          difficulty_level: 'beginner',
          reward_points: 100,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-challenge-2',
          title: 'Stress Awareness Week',
          description: 'Track your stress levels daily for one week',
          challenge_type: 'stress_reduction',
          duration_days: 7,
          target_metric: 'stress_readings',
          target_value: 7,
          difficulty_level: 'beginner',
          reward_points: 75,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-challenge-3',
          title: 'Meditation Master',
          description: 'Complete 300 minutes of meditation in 30 days',
          challenge_type: 'meditation',
          duration_days: 30,
          target_metric: 'meditation_minutes',
          target_value: 300,
          difficulty_level: 'advanced',
          reward_points: 300,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setChallenges(mockChallenges);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getActiveWellnessChallenges();
      if (error) throw error;
      setChallenges(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const loadUserParticipation = useCallback(async () => {
    if (!user) return;

    // In demo mode, return mock participation
    if (isDemoMode) {
      const mockParticipation: UserChallengeParticipation[] = [
        {
          id: 'demo-participation-1',
          user_id: user.id,
          challenge_id: 'demo-challenge-1',
          joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          current_progress: 30,
          is_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setUserParticipation(mockParticipation);
      return;
    }

    try {
      const { data, error } = await getUserChallengeParticipation(user.id);
      if (error) throw error;
      setUserParticipation(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user participation');
    }
  }, [user, isDemoMode]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockParticipation: UserChallengeParticipation = {
        id: `demo-participation-${Date.now()}`,
        user_id: user.id,
        challenge_id: challengeId,
        joined_at: new Date().toISOString(),
        current_progress: 0,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUserParticipation(prev => [mockParticipation, ...prev]);
      return { data: mockParticipation, error: null };
    }

    try {
      const { data, error } = await joinWellnessChallenge(user.id, challengeId);
      if (error) throw error;

      if (data) {
        setUserParticipation(prev => [data, ...prev]);
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join challenge';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [user, isDemoMode]);

  const isUserParticipating = useCallback((challengeId: string): boolean => {
    return userParticipation.some(participation => 
      participation.challenge_id === challengeId && !participation.is_completed
    );
  }, [userParticipation]);

  const getUserProgress = useCallback((challengeId: string): UserChallengeParticipation | null => {
    return userParticipation.find(participation => 
      participation.challenge_id === challengeId
    ) || null;
  }, [userParticipation]);

  const getCompletedChallenges = useCallback(() => {
    return userParticipation.filter(participation => participation.is_completed);
  }, [userParticipation]);

  const getActiveChallenges = useCallback(() => {
    return userParticipation.filter(participation => !participation.is_completed);
  }, [userParticipation]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    loadUserParticipation();
  }, [loadUserParticipation]);

  return {
    challenges,
    userParticipation,
    loading,
    error,
    joinChallenge,
    isUserParticipating,
    getUserProgress,
    getCompletedChallenges,
    getActiveChallenges,
    refreshChallenges: loadChallenges,
    refreshParticipation: loadUserParticipation,
  };
}