import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addMeditationSession, getMeditationSessions, getMeditationStats, MeditationSession } from '@/lib/database';

export function useMeditationTracking() {
  const { user, isDemoMode } = useAuth();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    if (!user) return;
    
    // In demo mode, start with empty sessions
    if (isDemoMode) {
      setSessions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getMeditationSessions(user.id);
      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meditation sessions');
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (
    sessionType: string,
    stressBefore?: number
  ) => {
    if (!user) return { error: 'User not authenticated' };
    
    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockSession: MeditationSession = {
        id: `demo-session-${Date.now()}`,
        user_id: user.id,
        duration_minutes: 0,
        session_type: sessionType,
        stress_before: stressBefore,
        created_at: new Date().toISOString(),
      };
      setSessions(prev => [mockSession, ...prev]);
      return { data: mockSession, error: null };
    }
    
    try {
      const { data, error } = await addMeditationSession({
        user_id: user.id,
        duration_minutes: 0,
        session_type: sessionType,
        stress_before: stressBefore,
      });
      
      if (error) throw error;
      
      if (data) {
        setSessions(prev => [data, ...prev]);
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const completeSession = async (
    sessionId: string,
    durationMinutes: number,
    stressAfter?: number
  ) => {
    // Note: This would require an update function in the database module
    // For now, we'll create a new session with the complete data
    return { error: 'Session completion not implemented yet' };
  };

  const getWeeklyStats = async () => {
    if (!user) return null;
    
    // In demo mode, return empty stats initially
    if (isDemoMode) {
      return {
        totalMinutes: 0,
        sessionCount: 0,
        averageStressReduction: 0,
      };
    }
    
    try {
      const { data, error } = await getMeditationStats(user.id, 7);
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      const totalMinutes = data.reduce((sum, session) => sum + session.duration_minutes, 0);
      const averageStressReduction = data
        .filter(session => session.stress_before && session.stress_after)
        .reduce((sum, session, _, arr) => {
          const reduction = (session.stress_before! - session.stress_after!) / session.stress_before! * 100;
          return sum + reduction / arr.length;
        }, 0);
      
      return {
        totalMinutes,
        sessionCount: data.length,
        averageStressReduction: Math.round(averageStressReduction),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get weekly stats');
      return null;
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  return {
    sessions,
    loading,
    error,
    startSession,
    completeSession,
    getWeeklyStats,
    refreshSessions: loadSessions,
  };
}