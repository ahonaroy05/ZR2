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

export interface UserPreferences {
  id: string;
  user_id: string;
  theme_preference: 'light' | 'dark' | 'auto';
  notification_enabled: boolean;
  sound_enabled: boolean;
  auto_play_sessions: boolean;
  preferred_session_duration: number;
  stress_reminder_frequency: 'never' | 'daily' | 'twice_daily' | 'hourly';
  language_preference: string;
  privacy_analytics: boolean;
  privacy_location: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteHistory {
  id: string;
  user_id: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  route_name?: string;
  distance_meters: number;
  duration_seconds: number;
  stress_level_before?: number;
  stress_level_after?: number;
  transport_mode: 'driving' | 'walking' | 'bicycling' | 'transit';
  therapy_used?: string;
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface WellnessGoal {
  id: string;
  user_id: string;
  goal_type: 'meditation_minutes' | 'stress_reduction' | 'journal_entries' | 'streak_days' | 'route_mindfulness';
  target_value: number;
  current_value: number;
  target_date?: string;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  meditation_reminders: boolean;
  stress_check_reminders: boolean;
  achievement_notifications: boolean;
  weekly_insights: boolean;
  route_suggestions: boolean;
  journal_prompts: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface MeditationContent {
  id: string;
  title: string;
  description?: string;
  content_type: 'breathing' | 'guided_meditation' | 'mindfulness' | 'body_scan' | 'loving_kindness';
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  audio_url?: string;
  script_content?: string;
  tags: string[];
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SoundPreset {
  id: string;
  user_id: string;
  preset_name: string;
  sound_configuration: any; // JSON object
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface AppFeedback {
  id: string;
  user_id?: string;
  feedback_type: 'bug_report' | 'feature_request' | 'general_feedback' | 'rating';
  rating?: number;
  title?: string;
  description: string;
  app_version?: string;
  device_info?: any;
  is_resolved: boolean;
  admin_response?: string;
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

// User preferences functions
export const getUserPreferences = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, ...preferences })
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

// Route history functions
export const addRouteHistory = async (route: Omit<RouteHistory, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('route_history')
    .insert([route])
    .select()
    .single();
  
  return { data, error };
};

export const getRouteHistory = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return { data, error };
};

export const getFavoriteRoutes = async (userId: string) => {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .gte('rating', 4)
    .order('rating', { ascending: false })
    .limit(10);
  
  return { data, error };
};

// Wellness goals functions
export const addWellnessGoal = async (goal: Omit<WellnessGoal, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('wellness_goals')
    .insert([goal])
    .select()
    .single();
  
  return { data, error };
};

export const getWellnessGoals = async (userId: string, activeOnly = true) => {
  let query = supabase
    .from('wellness_goals')
    .select('*')
    .eq('user_id', userId);
  
  if (activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
};

export const updateWellnessGoal = async (goalId: string, updates: Partial<WellnessGoal>) => {
  const { data, error } = await supabase
    .from('wellness_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
  
  return { data, error };
};

// Meditation content functions
export const getMeditationContent = async (contentType?: string, difficultyLevel?: string) => {
  let query = supabase
    .from('meditation_content')
    .select('*')
    .eq('is_active', true);
  
  if (contentType) {
    query = query.eq('content_type', contentType);
  }
  
  if (difficultyLevel) {
    query = query.eq('difficulty_level', difficultyLevel);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  return { data, error };
};

// Sound presets functions
export const addSoundPreset = async (preset: Omit<SoundPreset, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('sound_presets')
    .insert([preset])
    .select()
    .single();
  
  return { data, error };
};

export const getSoundPresets = async (userId: string) => {
  const { data, error } = await supabase
    .from('sound_presets')
    .select('*')
    .eq('user_id', userId)
    .order('is_favorite', { ascending: false })
    .order('usage_count', { ascending: false });
  
  return { data, error };
};

export const updateSoundPreset = async (presetId: string, updates: Partial<SoundPreset>) => {
  const { data, error } = await supabase
    .from('sound_presets')
    .update(updates)
    .eq('id', presetId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteSoundPreset = async (presetId: string) => {
  const { error } = await supabase
    .from('sound_presets')
    .delete()
    .eq('id', presetId);
  
  return { error };
};

// Notification settings functions
export const getNotificationSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const updateNotificationSettings = async (userId: string, settings: Partial<NotificationSettings>) => {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert({ user_id: userId, ...settings })
    .select()
    .single();
  
  return { data, error };
};

// App feedback functions
export const addAppFeedback = async (feedback: Omit<AppFeedback, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('app_feedback')
    .insert([feedback])
    .select()
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

// Get user insights using the database function
export const getUserInsights = async (userId: string, days = 7) => {
  const { data, error } = await supabase
    .rpc('get_user_insights', { p_user_id: userId, p_days: days });
  
  return { data, error };
};

// Session tracking
export const startUserSession = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert([{ user_id: userId }])
    .select()
    .single();
  
  return { data, error };
};

export const endUserSession = async (sessionId: string, featuresUsed: string[] = []) => {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      session_end: new Date().toISOString(),
      features_used: featuresUsed,
    })
    .eq('id', sessionId)
    .select()
    .single();
  
  return { data, error };
};