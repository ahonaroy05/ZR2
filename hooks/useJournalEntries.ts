import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  addJournalEntry, 
  updateJournalEntry, 
  deleteJournalEntry, 
  getJournalEntries, 
  JournalEntry 
} from '@/lib/database';

export function useJournalEntries() {
  const { user, isDemoMode } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async () => {
    if (!user) return;
    
    // In demo mode, load mock data
    if (isDemoMode) {
      const mockEntries: JournalEntry[] = [
        {
          id: 'demo-1',
          user_id: user.id,
          content: 'Morning commute was challenging due to delays, but the breathing exercises helped me stay centered.',
          mood: 'neutral',
          stress_level: 6,
          tags: ['commute', 'breathing', 'delays'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          user_id: user.id,
          content: 'Evening ride home was peaceful with the forest sounds playlist. Felt much more relaxed.',
          mood: 'happy',
          stress_level: 3,
          tags: ['evening', 'forest sounds', 'peaceful'],
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setEntries(mockEntries);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getJournalEntries(user.id);
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (
    content: string,
    mood: string,
    stressLevel: number,
    tags: string[] = []
  ) => {
    if (!user) return { error: 'User not authenticated' };
    
    // In demo mode, just add to local state
    if (isDemoMode) {
      const mockEntry: JournalEntry = {
        id: `demo-${Date.now()}`,
        user_id: user.id,
        content,
        mood,
        stress_level: stressLevel,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setEntries(prev => [mockEntry, ...prev]);
      return { data: mockEntry, error: null };
    }
    
    try {
      const { data, error } = await addJournalEntry({
        user_id: user.id,
        content,
        mood,
        stress_level: stressLevel,
        tags,
      });
      
      if (error) throw error;
      
      if (data) {
        setEntries(prev => [data, ...prev]);
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create journal entry';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateEntry = async (
    entryId: string,
    updates: Partial<Pick<JournalEntry, 'content' | 'mood' | 'stress_level' | 'tags'>>
  ) => {
    try {
      const { data, error } = await updateJournalEntry(entryId, updates);
      if (error) throw error;
      
      if (data) {
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? data : entry
        ));
      }
      
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update journal entry';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const removeEntry = async (entryId: string) => {
    try {
      const { error } = await deleteJournalEntry(entryId);
      if (error) throw error;
      
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete journal entry';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const getEntryById = (entryId: string) => {
    return entries.find(entry => entry.id === entryId);
  };

  const getEntriesByMood = (mood: string) => {
    return entries.filter(entry => entry.mood === mood);
  };

  const getAverageStressLevel = (days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentEntries = entries.filter(
      entry => new Date(entry.created_at) >= cutoffDate
    );
    
    if (recentEntries.length === 0) return null;
    
    const sum = recentEntries.reduce((acc, entry) => acc + entry.stress_level, 0);
    return Math.round((sum / recentEntries.length) * 10) / 10; // Round to 1 decimal
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  return {
    entries,
    loading,
    error,
    createEntry,
    updateEntry,
    removeEntry,
    getEntryById,
    getEntriesByMood,
    getAverageStressLevel,
    refreshEntries: loadEntries,
  };
}