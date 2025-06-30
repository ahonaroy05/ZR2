import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWellnessInsights, 
  markInsightAsRead, 
  dismissInsight, 
  WellnessInsight 
} from '@/lib/enhancedDatabase';

export function useWellnessInsights() {
  const { user, isDemoMode } = useAuth();
  const [insights, setInsights] = useState<WellnessInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (!user) return;

    // In demo mode, return mock insights
    if (isDemoMode) {
      const mockInsights: WellnessInsight[] = [
        {
          id: 'demo-insight-1',
          user_id: user.id,
          insight_type: 'stress_pattern',
          title: 'Stress Pattern Detected',
          description: 'Your stress levels tend to be higher on weekdays between 2-4 PM. Consider scheduling a brief meditation during this time.',
          data_points: { peak_hours: ['14:00', '15:00', '16:00'], average_stress: 75 },
          confidence_score: 0.85,
          is_read: false,
          is_dismissed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-insight-2',
          user_id: user.id,
          insight_type: 'habit_suggestion',
          title: 'Build a Morning Routine',
          description: 'Users who meditate in the morning report 23% lower stress levels throughout the day. Try a 5-minute morning session.',
          data_points: { suggested_time: '07:00', expected_benefit: 23 },
          confidence_score: 0.78,
          is_read: false,
          is_dismissed: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setInsights(mockInsights);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getWellnessInsights(user.id);
      if (error) throw error;
      setInsights(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const markAsRead = useCallback(async (insightId: string) => {
    if (isDemoMode) {
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, is_read: true } : insight
      ));
      return { error: null };
    }

    try {
      const { error } = await markInsightAsRead(insightId);
      if (error) throw error;
      
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, is_read: true } : insight
      ));
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to mark insight as read';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [isDemoMode]);

  const dismiss = useCallback(async (insightId: string) => {
    if (isDemoMode) {
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
      return { error: null };
    }

    try {
      const { error } = await dismissInsight(insightId);
      if (error) throw error;
      
      setInsights(prev => prev.filter(insight => insight.id !== insightId));
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insight';
      setError(errorMessage);
      return { error: errorMessage };
    }
  }, [isDemoMode]);

  const getUnreadCount = useCallback(() => {
    return insights.filter(insight => !insight.is_read).length;
  }, [insights]);

  const getInsightsByType = useCallback((type: WellnessInsight['insight_type']) => {
    return insights.filter(insight => insight.insight_type === type);
  }, [insights]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    insights,
    loading,
    error,
    markAsRead,
    dismiss,
    getUnreadCount,
    getInsightsByType,
    refreshInsights: loadInsights,
  };
}