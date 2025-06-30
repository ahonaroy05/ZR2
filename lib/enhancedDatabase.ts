import { supabase } from './supabase';

// Enhanced database interfaces
export interface WellnessInsight {
  id: string;
  user_id: string;
  insight_type: 'stress_pattern' | 'mood_trend' | 'habit_suggestion' | 'goal_recommendation' | 'achievement_celebration';
  title: string;
  description: string;
  data_points: any;
  confidence_score: number;
  is_read: boolean;
  is_dismissed: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitTracking {
  id: string;
  user_id: string;
  habit_name: string;
  habit_category: 'mindfulness' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'learning' | 'creativity';
  target_frequency: number;
  frequency_unit: 'daily' | 'weekly' | 'monthly';
  current_streak: number;
  longest_streak: number;
  is_active: boolean;
  reminder_time?: string;
  reminder_enabled: boolean;
  habit_color: string;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  completion_time: string;
  notes?: string;
  mood_rating?: number;
  created_at: string;
}

export interface MoodPattern {
  id: string;
  user_id: string;
  mood_primary: string;
  mood_secondary?: string;
  intensity: number;
  context_location?: string;
  context_activity?: string;
  context_social?: string;
  weather_condition?: string;
  sleep_quality?: number;
  energy_level?: number;
  notes?: string;
  created_at: string;
}

export interface StressTrigger {
  id: string;
  user_id: string;
  trigger_name: string;
  trigger_category: string;
  severity_level: number;
  frequency: string;
  coping_strategies: string[];
  effectiveness_rating?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  duration_days: number;
  target_metric: string;
  target_value: number;
  difficulty_level: string;
  reward_points: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UserChallengeParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_at: string;
  current_progress: number;
  is_completed: boolean;
  completed_at?: string;
  final_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Wellness Insights functions
export const getWellnessInsights = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('wellness_insights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const markInsightAsRead = async (insightId: string) => {
  const { data, error } = await supabase
    .from('wellness_insights')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', insightId)
    .select()
    .single();
  
  return { data, error };
};

export const dismissInsight = async (insightId: string) => {
  const { data, error } = await supabase
    .from('wellness_insights')
    .update({ is_dismissed: true, updated_at: new Date().toISOString() })
    .eq('id', insightId)
    .select()
    .single();
  
  return { data, error };
};

// Habit Tracking functions
export const createHabit = async (habit: Omit<HabitTracking, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('habit_tracking')
    .insert([habit])
    .select()
    .single();
  
  return { data, error };
};

export const getUserHabits = async (userId: string, activeOnly = true) => {
  let query = supabase
    .from('habit_tracking')
    .select('*')
    .eq('user_id', userId);
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
};

export const completeHabit = async (habitCompletion: Omit<HabitCompletion, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('habit_completions')
    .insert([habitCompletion])
    .select()
    .single();
  
  return { data, error };
};

export const getHabitCompletions = async (habitId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('habit_id', habitId)
    .gte('completion_date', startDate.toISOString().split('T')[0])
    .order('completion_date', { ascending: false });
  
  return { data, error };
};

// Mood Pattern functions
export const recordMoodPattern = async (moodPattern: Omit<MoodPattern, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('mood_patterns')
    .insert([moodPattern])
    .select()
    .single();
  
  return { data, error };
};

export const getMoodPatterns = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('mood_patterns')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Stress Trigger functions
export const createStressTrigger = async (trigger: Omit<StressTrigger, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('stress_triggers')
    .insert([trigger])
    .select()
    .single();
  
  return { data, error };
};

export const getStressTriggers = async (userId: string, activeOnly = true) => {
  let query = supabase
    .from('stress_triggers')
    .select('*')
    .eq('user_id', userId);
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('severity_level', { ascending: false });
  
  return { data, error };
};

export const recordStressTriggerIncident = async (incident: any) => {
  const { data, error } = await supabase
    .from('stress_trigger_incidents')
    .insert([incident])
    .select()
    .single();
  
  return { data, error };
};

// Wellness Challenge functions
export const getActiveWellnessChallenges = async () => {
  const { data, error } = await supabase
    .from('wellness_challenges')
    .select('*')
    .eq('is_active', true)
    .order('difficulty_level', { ascending: true });
  
  return { data, error };
};

export const joinWellnessChallenge = async (userId: string, challengeId: string) => {
  const { data, error } = await supabase
    .from('user_challenge_participation')
    .insert([{ user_id: userId, challenge_id: challengeId }])
    .select()
    .single();
  
  return { data, error };
};

export const getUserChallengeParticipation = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_challenge_participation')
    .select(`
      *,
      wellness_challenges (
        title,
        description,
        challenge_type,
        duration_days,
        target_metric,
        target_value,
        difficulty_level,
        reward_points
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });
  
  return { data, error };
};

// Advanced Analytics functions
export const getWellnessAnalytics = async (userId: string, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get comprehensive wellness data
  const [
    stressData,
    moodData,
    meditationData,
    journalData,
    habitData
  ] = await Promise.all([
    supabase
      .from('stress_readings')
      .select('stress_level, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('mood_patterns')
      .select('mood_primary, intensity, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('meditation_sessions')
      .select('duration_minutes, stress_before, stress_after, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('journal_entries')
      .select('mood, stress_level, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString()),
    
    supabase
      .from('habit_completions')
      .select('completion_date, mood_rating')
      .eq('user_id', userId)
      .gte('completion_date', startDate.toISOString().split('T')[0])
  ]);
  
  return {
    stressReadings: stressData.data || [],
    moodPatterns: moodData.data || [],
    meditationSessions: meditationData.data || [],
    journalEntries: journalData.data || [],
    habitCompletions: habitData.data || [],
  };
};

// Generate personalized recommendations
export const generatePersonalizedRecommendations = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('generate_wellness_insights');
  
  return { data, error };
};