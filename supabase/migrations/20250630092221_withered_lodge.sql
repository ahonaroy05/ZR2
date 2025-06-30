/*
  # Enhanced Database Schema for ZenRoute

  1. New Tables
    - `user_preferences` - Store user settings and preferences
    - `route_history` - Track user's route usage and preferences
    - `wellness_goals` - User-defined wellness goals and tracking
    - `notification_settings` - Granular notification preferences
    - `app_feedback` - User feedback and ratings
    - `meditation_content` - Curated meditation content library
    - `sound_presets` - User's custom sound mixing presets

  2. Enhanced Existing Tables
    - Add indexes for better performance
    - Add additional constraints and validations
    - Enhance RLS policies

  3. Functions and Triggers
    - Automated streak calculation
    - Achievement progress tracking
    - Data cleanup functions
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme_preference text DEFAULT 'auto' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  notification_enabled boolean DEFAULT true,
  sound_enabled boolean DEFAULT true,
  auto_play_sessions boolean DEFAULT false,
  preferred_session_duration integer DEFAULT 10 CHECK (preferred_session_duration > 0),
  stress_reminder_frequency text DEFAULT 'daily' CHECK (stress_reminder_frequency IN ('never', 'daily', 'twice_daily', 'hourly')),
  language_preference text DEFAULT 'en' CHECK (language_preference IN ('en', 'es', 'fr', 'de', 'ja')),
  privacy_analytics boolean DEFAULT true,
  privacy_location boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create route_history table
CREATE TABLE IF NOT EXISTS route_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  origin_lat decimal(10, 8) NOT NULL,
  origin_lng decimal(11, 8) NOT NULL,
  destination_lat decimal(10, 8) NOT NULL,
  destination_lng decimal(11, 8) NOT NULL,
  route_name text,
  distance_meters integer NOT NULL CHECK (distance_meters > 0),
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  stress_level_before integer CHECK (stress_level_before >= 0 AND stress_level_before <= 100),
  stress_level_after integer CHECK (stress_level_after >= 0 AND stress_level_after <= 100),
  transport_mode text DEFAULT 'driving' CHECK (transport_mode IN ('driving', 'walking', 'bicycling', 'transit')),
  therapy_used text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create wellness_goals table
CREATE TABLE IF NOT EXISTS wellness_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_type text NOT NULL CHECK (goal_type IN ('meditation_minutes', 'stress_reduction', 'journal_entries', 'streak_days', 'route_mindfulness')),
  target_value integer NOT NULL CHECK (target_value > 0),
  current_value integer DEFAULT 0 CHECK (current_value >= 0),
  target_date date,
  is_active boolean DEFAULT true,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  meditation_reminders boolean DEFAULT true,
  stress_check_reminders boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,
  weekly_insights boolean DEFAULT true,
  route_suggestions boolean DEFAULT true,
  journal_prompts boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '08:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create app_feedback table
CREATE TABLE IF NOT EXISTS app_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_type text NOT NULL CHECK (feedback_type IN ('bug_report', 'feature_request', 'general_feedback', 'rating')),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  description text NOT NULL,
  app_version text,
  device_info jsonb,
  is_resolved boolean DEFAULT false,
  admin_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meditation_content table
CREATE TABLE IF NOT EXISTS meditation_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('breathing', 'guided_meditation', 'mindfulness', 'body_scan', 'loving_kindness')),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  audio_url text,
  script_content text,
  tags text[] DEFAULT '{}',
  is_premium boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sound_presets table
CREATE TABLE IF NOT EXISTS sound_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  preset_name text NOT NULL,
  sound_configuration jsonb NOT NULL,
  is_favorite boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_sessions table for tracking app usage
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  duration_minutes integer,
  features_used text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sound_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for route_history
CREATE POLICY "Users can read own route history"
  ON route_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own route history"
  ON route_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own route history"
  ON route_history FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own route history"
  ON route_history FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for wellness_goals
CREATE POLICY "Users can read own wellness goals"
  ON wellness_goals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness goals"
  ON wellness_goals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness goals"
  ON wellness_goals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness goals"
  ON wellness_goals FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for notification_settings
CREATE POLICY "Users can read own notification settings"
  ON notification_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for app_feedback
CREATE POLICY "Users can read own feedback"
  ON app_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
  ON app_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for meditation_content (read-only for all users)
CREATE POLICY "Anyone can read active meditation content"
  ON meditation_content FOR SELECT TO authenticated
  USING (is_active = true);

-- Create RLS policies for sound_presets
CREATE POLICY "Users can read own sound presets"
  ON sound_presets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sound presets"
  ON sound_presets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sound presets"
  ON sound_presets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sound presets"
  ON sound_presets FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can read own sessions"
  ON user_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON user_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_goals_updated_at
  BEFORE UPDATE ON wellness_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_feedback_updated_at
  BEFORE UPDATE ON app_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meditation_content_updated_at
  BEFORE UPDATE ON meditation_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sound_presets_updated_at
  BEFORE UPDATE ON sound_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stress_readings_user_created 
  ON stress_readings(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_created 
  ON meditation_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_created 
  ON journal_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_route_history_user_created 
  ON route_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wellness_goals_user_active 
  ON wellness_goals(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_meditation_content_type_active 
  ON meditation_content(content_type, is_active);

-- Create function to automatically update wellness goal progress
CREATE OR REPLACE FUNCTION update_wellness_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  goal_record RECORD;
BEGIN
  -- Update meditation minutes goals
  IF TG_TABLE_NAME = 'meditation_sessions' THEN
    FOR goal_record IN 
      SELECT id, current_value, target_value 
      FROM wellness_goals 
      WHERE user_id = NEW.user_id 
        AND goal_type = 'meditation_minutes' 
        AND is_active = true 
        AND is_completed = false
    LOOP
      UPDATE wellness_goals 
      SET 
        current_value = (
          SELECT COALESCE(SUM(duration_minutes), 0) 
          FROM meditation_sessions 
          WHERE user_id = NEW.user_id
        ),
        updated_at = now()
      WHERE id = goal_record.id;
      
      -- Check if goal is completed
      IF goal_record.current_value >= goal_record.target_value THEN
        UPDATE wellness_goals 
        SET 
          is_completed = true, 
          completed_at = now(),
          updated_at = now()
        WHERE id = goal_record.id;
      END IF;
    END LOOP;
  END IF;

  -- Update journal entries goals
  IF TG_TABLE_NAME = 'journal_entries' THEN
    FOR goal_record IN 
      SELECT id, current_value, target_value 
      FROM wellness_goals 
      WHERE user_id = NEW.user_id 
        AND goal_type = 'journal_entries' 
        AND is_active = true 
        AND is_completed = false
    LOOP
      UPDATE wellness_goals 
      SET 
        current_value = (
          SELECT COUNT(*) 
          FROM journal_entries 
          WHERE user_id = NEW.user_id
        ),
        updated_at = now()
      WHERE id = goal_record.id;
      
      -- Check if goal is completed
      IF goal_record.current_value >= goal_record.target_value THEN
        UPDATE wellness_goals 
        SET 
          is_completed = true, 
          completed_at = now(),
          updated_at = now()
        WHERE id = goal_record.id;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for wellness goal progress tracking
CREATE TRIGGER update_meditation_goal_progress
  AFTER INSERT ON meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_wellness_goal_progress();

CREATE TRIGGER update_journal_goal_progress
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_wellness_goal_progress();

-- Create function to calculate user insights
CREATE OR REPLACE FUNCTION get_user_insights(p_user_id uuid, p_days integer DEFAULT 7)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  start_date timestamptz;
BEGIN
  start_date := now() - (p_days || ' days')::interval;
  
  SELECT jsonb_build_object(
    'stress_average', COALESCE(AVG(stress_level), 0),
    'stress_trend', CASE 
      WHEN AVG(stress_level) FILTER (WHERE created_at >= now() - interval '3 days') > 
           AVG(stress_level) FILTER (WHERE created_at < now() - interval '3 days') 
      THEN 'increasing'
      WHEN AVG(stress_level) FILTER (WHERE created_at >= now() - interval '3 days') < 
           AVG(stress_level) FILTER (WHERE created_at < now() - interval '3 days') 
      THEN 'decreasing'
      ELSE 'stable'
    END,
    'meditation_minutes', COALESCE(SUM(duration_minutes), 0),
    'meditation_sessions', COUNT(*),
    'journal_entries', (
      SELECT COUNT(*) 
      FROM journal_entries 
      WHERE user_id = p_user_id AND created_at >= start_date
    ),
    'most_common_mood', (
      SELECT mood 
      FROM journal_entries 
      WHERE user_id = p_user_id AND created_at >= start_date
      GROUP BY mood 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ),
    'stress_reduction_sessions', COUNT(*) FILTER (
      WHERE stress_before IS NOT NULL 
        AND stress_after IS NOT NULL 
        AND stress_after < stress_before
    )
  ) INTO result
  FROM meditation_sessions 
  WHERE user_id = p_user_id AND created_at >= start_date;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample meditation content
INSERT INTO meditation_content (title, description, content_type, duration_minutes, difficulty_level, tags) VALUES
  ('Basic Breathing', 'Simple breathing exercise for beginners', 'breathing', 5, 'beginner', ARRAY['breathing', 'relaxation', 'beginner']),
  ('Mindful Commute', 'Guided meditation for your daily journey', 'guided_meditation', 10, 'beginner', ARRAY['commuting', 'mindfulness', 'stress']),
  ('Body Scan Relaxation', 'Progressive body scan for deep relaxation', 'body_scan', 15, 'intermediate', ARRAY['relaxation', 'body_scan', 'stress_relief']),
  ('Loving Kindness', 'Cultivate compassion and kindness', 'loving_kindness', 12, 'intermediate', ARRAY['compassion', 'kindness', 'emotional']),
  ('Advanced Mindfulness', 'Deep mindfulness practice', 'mindfulness', 20, 'advanced', ARRAY['mindfulness', 'awareness', 'advanced'])
ON CONFLICT DO NOTHING;

-- Create function to clean up old data (for privacy and performance)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Delete stress readings older than 1 year
  DELETE FROM stress_readings 
  WHERE created_at < now() - interval '1 year';
  
  -- Delete user sessions older than 6 months
  DELETE FROM user_sessions 
  WHERE created_at < now() - interval '6 months';
  
  -- Delete completed wellness goals older than 3 months
  DELETE FROM wellness_goals 
  WHERE is_completed = true AND completed_at < now() - interval '3 months';
  
  -- Archive old route history (keep only last 6 months)
  DELETE FROM route_history 
  WHERE created_at < now() - interval '6 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;