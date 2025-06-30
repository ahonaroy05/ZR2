import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Affirmation {
  id: string;
  text: string;
  category: 'motivation' | 'self_love' | 'mindfulness' | 'strength' | 'gratitude';
  tags: string[];
}

export interface AffirmationLog {
  id: string;
  affirmationId: string;
  date: string;
  isFavorite: boolean;
}

const AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff_1',
    text: 'I am consistent, I am strong.',
    category: 'strength',
    tags: ['consistency', 'strength', 'determination'],
  },
  {
    id: 'aff_2',
    text: 'Every breath I take brings me peace and clarity.',
    category: 'mindfulness',
    tags: ['breathing', 'peace', 'clarity'],
  },
  {
    id: 'aff_3',
    text: 'I choose calm over chaos in every moment.',
    category: 'mindfulness',
    tags: ['calm', 'choice', 'mindfulness'],
  },
  {
    id: 'aff_4',
    text: 'My journey to wellness is a gift I give myself.',
    category: 'self_love',
    tags: ['wellness', 'self-care', 'journey'],
  },
  {
    id: 'aff_5',
    text: 'I am grateful for this moment of mindfulness.',
    category: 'gratitude',
    tags: ['gratitude', 'present', 'mindfulness'],
  },
  {
    id: 'aff_6',
    text: 'Each day I grow stronger in my practice.',
    category: 'motivation',
    tags: ['growth', 'practice', 'progress'],
  },
  {
    id: 'aff_7',
    text: 'I release stress and embrace tranquility.',
    category: 'mindfulness',
    tags: ['release', 'stress', 'tranquility'],
  },
  {
    id: 'aff_8',
    text: 'My mind is clear, my heart is open.',
    category: 'mindfulness',
    tags: ['clarity', 'openness', 'heart'],
  },
  {
    id: 'aff_9',
    text: 'I deserve peace and happiness in my life.',
    category: 'self_love',
    tags: ['deserving', 'peace', 'happiness'],
  },
  {
    id: 'aff_10',
    text: 'Today I choose to be present and mindful.',
    category: 'mindfulness',
    tags: ['choice', 'present', 'mindful'],
  },
];

export function useDailyAffirmations() {
  const { user, isDemoMode } = useAuth();
  const [todaysAffirmation, setTodaysAffirmation] = useState<Affirmation>(AFFIRMATIONS[0]);
  const [favoriteAffirmations, setFavoriteAffirmations] = useState<string[]>([]);
  const [affirmationLogs, setAffirmationLogs] = useState<AffirmationLog[]>([]);
  const [affirmationCount, setAffirmationCount] = useState(0);

  // Get today's affirmation (deterministic based on date)
  const getTodaysAffirmation = useCallback((): Affirmation => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % AFFIRMATIONS.length;
    return AFFIRMATIONS[index];
  }, []);

  // Load affirmation data from storage
  const loadAffirmationData = useCallback(async () => {
    if (!user) return;

    // Set today's affirmation
    setTodaysAffirmation(getTodaysAffirmation());

    // In demo mode, start with empty data
    if (isDemoMode) {
      setFavoriteAffirmations([]);
      setAffirmationCount(0);
      return;
    }

    try {
      const favoritesStored = localStorage.getItem(`affirmation_favorites_${user.id}`);
      if (favoritesStored) {
        setFavoriteAffirmations(JSON.parse(favoritesStored));
      }

      const logsStored = localStorage.getItem(`affirmation_logs_${user.id}`);
      if (logsStored) {
        const logs = JSON.parse(logsStored);
        setAffirmationLogs(logs);
        
        // Count affirmations for current month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyCount = logs.filter((log: AffirmationLog) => {
          const logDate = new Date(log.date);
          return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
        }).length;
        setAffirmationCount(monthlyCount);
      }
    } catch (error) {
      console.error('Error loading affirmation data:', error);
    }
  }, [user, isDemoMode, getTodaysAffirmation]);

  // Save favorites to storage
  const saveFavorites = useCallback(async (favorites: string[]) => {
    if (!user || isDemoMode) return;

    try {
      localStorage.setItem(`affirmation_favorites_${user.id}`, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [user, isDemoMode]);

  // Save logs to storage
  const saveLogs = useCallback(async (logs: AffirmationLog[]) => {
    if (!user || isDemoMode) return;

    try {
      localStorage.setItem(`affirmation_logs_${user.id}`, JSON.stringify(logs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }, [user, isDemoMode]);

  // Toggle favorite status of an affirmation
  const toggleFavorite = useCallback(async (affirmationId: string) => {
    const newFavorites = favoriteAffirmations.includes(affirmationId)
      ? favoriteAffirmations.filter(id => id !== affirmationId)
      : [...favoriteAffirmations, affirmationId];
    
    setFavoriteAffirmations(newFavorites);
    await saveFavorites(newFavorites);
  }, [favoriteAffirmations, saveFavorites]);

  // Log an affirmation view/interaction
  const logAffirmation = useCallback(async (affirmationId: string) => {
    if (!user) return;

    const newLog: AffirmationLog = {
      id: `log_${Date.now()}`,
      affirmationId,
      date: new Date().toISOString(),
      isFavorite: favoriteAffirmations.includes(affirmationId),
    };

    const newLogs = [newLog, ...affirmationLogs];
    setAffirmationLogs(newLogs);
    await saveLogs(newLogs);

    // Update monthly count
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = newLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    }).length;
    setAffirmationCount(monthlyCount);
  }, [user, affirmationLogs, favoriteAffirmations, saveLogs]);

  // Refresh today's affirmation (get a random one)
  const refreshAffirmation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    const newAffirmation = AFFIRMATIONS[randomIndex];
    setTodaysAffirmation(newAffirmation);
    
    // Log the interaction
    logAffirmation(newAffirmation.id);
  }, [logAffirmation]);

  // Get affirmations by category
  const getAffirmationsByCategory = useCallback((category: Affirmation['category']): Affirmation[] => {
    return AFFIRMATIONS.filter(aff => aff.category === category);
  }, []);

  // Get favorite affirmations
  const getFavoriteAffirmationObjects = useCallback((): Affirmation[] => {
    return AFFIRMATIONS.filter(aff => favoriteAffirmations.includes(aff.id));
  }, [favoriteAffirmations]);

  useEffect(() => {
    loadAffirmationData();
  }, [loadAffirmationData]);

  // Auto-log today's affirmation on first view
  useEffect(() => {
    if (user && todaysAffirmation) {
      const today = new Date().toDateString();
      const todayLogged = affirmationLogs.some(log => 
        log.affirmationId === todaysAffirmation.id && 
        new Date(log.date).toDateString() === today
      );
      
      if (!todayLogged) {
        logAffirmation(todaysAffirmation.id);
      }
    }
  }, [user, todaysAffirmation, affirmationLogs, logAffirmation]);

  return {
    todaysAffirmation,
    favoriteAffirmations,
    affirmationLogs,
    affirmationCount,
    allAffirmations: AFFIRMATIONS,
    toggleFavorite,
    logAffirmation,
    refreshAffirmation,
    getAffirmationsByCategory,
    getFavoriteAffirmationObjects,
  };
}