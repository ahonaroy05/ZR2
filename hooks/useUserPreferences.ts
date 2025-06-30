import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPreferences, updateUserPreferences, UserPreferences } from '@/lib/database';

export function useUserPreferences() {
  const { user, isDemoMode } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    // In demo mode, use default preferences
    if (isDemoMode) {
      const defaultPreferences: UserPreferences = {
        id: 'demo-prefs',
        user_id: user.id,
        theme_preference: 'auto',
        notification_enabled: true,
        sound_enabled: true,
        auto_play_sessions: false,
        preferred_session_duration: 10,
        stress_reminder_frequency: 'daily',
        language_preference: 'en',
        privacy_analytics: true,
        privacy_location: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPreferences(defaultPreferences);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await getUserPreferences(user.id);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const defaultPrefs = {
          user_id: user.id,
          theme_preference: 'auto' as const,
          notification_enabled: true,
          sound_enabled: true,
          auto_play_sessions: false,
          preferred_session_duration: 10,
          stress_reminder_frequency: 'daily' as const,
          language_preference: 'en',
          privacy_analytics: true,
          privacy_location: true,
        };

        const { data: newPrefs, error: createError } = await updateUserPreferences(user.id, defaultPrefs);
        
        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) return { error: 'User not authenticated' };

    // In demo mode, just update local state
    if (isDemoMode) {
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      return { data: preferences, error: null };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await updateUserPreferences(user.id, updates);
      
      if (error) throw error;
      
      setPreferences(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, preferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences: loadPreferences,
  };
}