import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addStressReading, getStressReadings, StressReading } from '@/lib/database';

export function useStressTracking() {
  const { user, isDemoMode } = useAuth();
  const [stressReadings, setStressReadings] = useState<StressReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStressReadings = async () => {
    if (!user) return;
    
    // In demo mode, use minimal demo data
    if (isDemoMode) {
      const mockReadings: StressReading[] = [
        {
          id: 'demo-1',
          user_id: user.id,
          stress_level: 65,
          location: 'Current Location',
          created_at: new Date().toISOString(),
        },
      ];
      setStressReadings(mockReadings);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getStressReadings(user.id);
      if (error) throw error;
      setStressReadings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stress readings');
    } finally {
      setLoading(false);
    }
  };

  const recordStressLevel = async (stressLevel: number, location?: string) => {
    if (!user) return { error: 'User not authenticated' };
    
    // In demo mode, just add to local state without saving to database
    if (isDemoMode) {
      const mockReading: StressReading = {
        id: `demo-${Date.now()}`,
        user_id: user.id,
        stress_level: stressLevel,
        location,
        created_at: new Date().toISOString(),
      };
      setStressReadings(prev => [mockReading, ...prev]);
      return { data: mockReading, error: null };
    }
    
    try {
      const { data, error } = await addStressReading({
        user_id: user.id,
        stress_level: stressLevel,
        location,
      });
      
      if (error) throw error;
      
      // Add to local state
      if (data) {
        setStressReadings(prev => [data, ...prev]);
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record stress level';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const getCurrentStressLevel = () => {
    if (stressReadings.length === 0) return null;
    return stressReadings[0].stress_level;
  };

  const getAverageStressLevel = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentReadings = stressReadings.filter(
      reading => new Date(reading.created_at) >= cutoffDate
    );
    
    if (recentReadings.length === 0) return null;
    
    const sum = recentReadings.reduce((acc, reading) => acc + reading.stress_level, 0);
    return Math.round(sum / recentReadings.length);
  };

  useEffect(() => {
    loadStressReadings();
  }, [user]);

  return {
    stressReadings,
    loading,
    error,
    recordStressLevel,
    getCurrentStressLevel,
    getAverageStressLevel,
    refreshStressReadings: loadStressReadings,
  };
}