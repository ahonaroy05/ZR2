import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInsights } from '@/lib/database';

export interface UserInsights {
  stress_average: number;
  stress_trend: 'increasing' | 'decreasing' | 'stable';
  meditation_minutes: number;
  meditation_sessions: number;
  journal_entries: number;
  most_common_mood: string | null;
  stress_reduction_sessions: number;
}

export function useUserInsights(days = 7) {
  const { user, isDemoMode } = useAuth();
  const [insights, setInsights] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (!user) return;

    // In demo mode, return mock insights
    if (isDemoMode) {
      const mockInsights: UserInsights = {
        stress_average: 45,
        stress_trend: 'decreasing',
        meditation_minutes: 0,
        meditation_sessions: 0,
        journal_entries: 0,
        most_common_mood: null,
        stress_reduction_sessions: 0,
      };
      setInsights(mockInsights);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getUserInsights(user.id, days);
      if (error) throw error;
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, days]);

  const getInsightSummary = useCallback(() => {
    if (!insights) return null;

    const summary = [];

    // Stress trend insight
    if (insights.stress_trend === 'decreasing') {
      summary.push('Your stress levels are improving! 📉');
    } else if (insights.stress_trend === 'increasing') {
      summary.push('Consider more mindfulness practices to manage stress. 📈');
    } else {
      summary.push('Your stress levels are stable. 📊');
    }

    // Meditation insight
    if (insights.meditation_minutes > 0) {
      summary.push(`You've meditated for ${insights.meditation_minutes} minutes this week! 🧘‍♀️`);
    } else {
      summary.push('Try starting with a 5-minute meditation session. 🌱');
    }

    // Journal insight
    if (insights.journal_entries > 0) {
      summary.push(`You've written ${insights.journal_entries} journal entries. 📝`);
    } else {
      summary.push('Journaling can help process your thoughts and emotions. ✍️');
    }

    return summary;
  }, [insights]);

  const getStressLevelDescription = useCallback(() => {
    if (!insights) return null;

    const avg = insights.stress_average;
    if (avg < 30) return 'Low stress - you\'re doing great!';
    if (avg < 50) return 'Moderate stress - manageable levels';
    if (avg < 70) return 'Elevated stress - consider more relaxation';
    return 'High stress - prioritize stress management';
  }, [insights]);

  const getRecommendations = useCallback(() => {
    if (!insights) return [];

    const recommendations = [];

    // Stress-based recommendations
    if (insights.stress_average > 60) {
      recommendations.push({
        type: 'stress',
        title: 'Try breathing exercises',
        description: 'Your stress levels are elevated. Regular breathing exercises can help.',
        action: 'Start a breathing session',
      });
    }

    // Meditation recommendations
    if (insights.meditation_minutes < 30) {
      recommendations.push({
        type: 'meditation',
        title: 'Increase meditation time',
        description: 'Aim for at least 30 minutes of meditation per week.',
        action: 'Browse meditation content',
      });
    }

    // Journal recommendations
    if (insights.journal_entries < 3) {
      recommendations.push({
        type: 'journal',
        title: 'Write more journal entries',
        description: 'Regular journaling helps process emotions and track progress.',
        action: 'Start journaling',
      });
    }

    // Stress reduction recommendations
    if (insights.stress_reduction_sessions === 0) {
      recommendations.push({
        type: 'stress_reduction',
        title: 'Track stress before and after sessions',
        description: 'Measuring stress levels helps you see the impact of mindfulness practices.',
        action: 'Record stress levels',
      });
    }

    return recommendations;
  }, [insights]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    loading,
    error,
    getInsightSummary,
    getStressLevelDescription,
    getRecommendations,
    refreshInsights: loadInsights,
  };
}