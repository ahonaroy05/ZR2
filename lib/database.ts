import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface StressReading {
  id: string;
  user_id: string;
  stress_level: number;
  location?: string;
  created_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: string;
  stress_before?: number;
  stress_after?: number;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood: string;
  stress_level: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Stress reading functions
export const addStressReading = async (stressReading: Omit<StressReading, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('stress_readings')
    .insert([stressReading])
    .select()
    .single();
  
  return { data, error };
};

export const getStressReadings = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('stress_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const getStressReadingsForPeriod = async (
  userId: string, 
  startDate: string, 
  endDate: string
) => {
  const { data, error } = await supabase
    .from('stress_readings')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });
  
  return { data, error };
};

// Meditation session functions
export const addMeditationSession = async (session: Omit<MeditationSession, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('meditation_sessions')
    .insert([session])
    .select()
    .single();
  
  return { data, error };
};

export const getMeditationSessions = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('meditation_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const getMeditationStats = async (userId: string, days = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('meditation_sessions')
    .select('duration_minutes, stress_before, stress_after, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
  
  return { data, error };
};

// Journal entry functions
export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([entry])
    .select()
    .single();
  
  return { data, error };
};

export const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteJournalEntry = async (entryId: string) => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId);
  
  return { error };
};

export const getJournalEntries = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const getJournalEntry = async (entryId: string) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', entryId)
    .single();
  
  return { data, error };
};

// Analytics functions
export const getWeeklyInsights = async (userId: string) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  // Get stress readings for the week
  const { data: stressData } = await supabase
    .from('stress_readings')
    .select('stress_level, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
  
  // Get meditation sessions for the week
  const { data: meditationData } = await supabase
    .from('meditation_sessions')
    .select('duration_minutes, stress_before, stress_after')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
  
  // Get journal entries for the week
  const { data: journalData } = await supabase
    .from('journal_entries')
    .select('mood, stress_level')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());
  
  return {
    stressReadings: stressData || [],
    meditationSessions: meditationData || [],
    journalEntries: journalData || [],
  };
};