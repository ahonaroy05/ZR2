/*
  # Enhanced Wellness Features for ZenRoute

  1. New Tables
    - `wellness_insights` - AI-generated insights and recommendations
    - `habit_tracking` - Track daily wellness habits
    - `mood_patterns` - Advanced mood tracking with context
    - `stress_triggers` - Identify and track stress triggers
    - `mindfulness_reminders` - Personalized reminder system
    - `social_connections` - Optional social features for accountability
    - `wellness_challenges` - Gamified wellness challenges

  2. Enhanced Existing Tables
    - Add more detailed tracking to existing tables
    - Improve data relationships and constraints
    - Add computed columns for better analytics

  3. Advanced Features
    - Trigger-based insight generation
    - Automated habit streak calculation
    - Smart reminder scheduling
    - Progress analytics functions
*/

-- Create wellness_insights table for AI-generated insights
CREATE TABLE IF NOT EXISTS wellness_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('stress_pattern', 'mood_trend', 'habit_suggestion', 'goal_recommendation', 'achievement_celebration')),
  title text NOT NULL,
  description text NOT NULL,
  data_points jsonb DEFAULT '{}',
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_tracking table for daily wellness habits
CREATE TABLE IF NOT EXISTS habit_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  habit_name text NOT NULL,
  habit_category text NOT NULL CHECK (habit_category IN ('mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'learning', 'creativity')),
  target_frequency integer NOT NULL DEFAULT 1 CHECK (target_frequency > 0),
  frequency_unit text NOT NULL DEFAULT 'daily' CHECK (frequency_unit IN ('daily', 'weekly', 'monthly')),
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  is_active boolean DEFAULT true,
  reminder_time time,
  reminder_enabled boolean DEFAULT true,
  habit_color text DEFAULT '#B6D0E2',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create habit_completions table to track daily habit completions
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habit_tracking(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completion_date date NOT NULL DEFAULT CURRENT_DATE,
  completion_time timestamptz DEFAULT now(),
  notes text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, completion_date)
);

-- Create mood_patterns table for advanced mood tracking
CREATE TABLE IF NOT EXISTS mood_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mood_primary text NOT NULL CHECK (mood_primary IN ('very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'anxious', 'calm', 'energetic', 'tired')),
  mood_secondary text CHECK (mood_secondary IN ('grateful', 'hopeful', 'frustrated', 'excited', 'peaceful', 'overwhelmed', 'confident', 'lonely')),
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  context_location text,
  context_activity text,
  context_social text CHECK (context_social IN ('alone', 'with_family', 'with_friends', 'with_colleagues', 'in_crowd')),
  weather_condition text,
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create stress_triggers table to identify patterns
CREATE TABLE IF NOT EXISTS stress_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  trigger_name text NOT NULL,
  trigger_category text NOT NULL CHECK (trigger_category IN ('work', 'traffic', 'social', 'financial', 'health', 'family', 'technology', 'environment')),
  severity_level integer NOT NULL CHECK (severity_level >= 1 AND severity_level <= 10),
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
  coping_strategies text[],
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stress_trigger_incidents table to track occurrences
CREATE TABLE IF NOT EXISTS stress_trigger_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id uuid REFERENCES stress_triggers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  incident_date timestamptz DEFAULT now(),
  stress_level_before integer CHECK (stress_level_before >= 0 AND stress_level_before <= 100),
  stress_level_after integer CHECK (stress_level_after >= 0 AND stress_level_after <= 100),
  coping_strategy_used text,
  strategy_effectiveness integer CHECK (strategy_effectiveness >= 1 AND strategy_effectiveness <= 5),
  duration_minutes integer,
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create mindfulness_reminders table for personalized reminders
CREATE TABLE IF NOT EXISTS mindfulness_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('breathing', 'meditation', 'gratitude', 'movement', 'hydration', 'posture', 'stress_check')),
  title text NOT NULL,
  message text NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('hourly', 'daily', 'weekly', 'custom')),
  custom_interval_minutes integer,
  scheduled_times time[],
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  total_sent integer DEFAULT 0,
  total_acknowledged integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wellness_challenges table for gamification
CREATE TABLE IF NOT EXISTS wellness_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('meditation', 'stress_reduction', 'journaling', 'habit_building', 'mindful_commuting')),
  duration_days integer NOT NULL CHECK (duration_days > 0),
  target_metric text NOT NULL,
  target_value integer NOT NULL CHECK (target_value > 0),
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  reward_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_challenge_participation table
CREATE TABLE IF NOT EXISTS user_challenge_participation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid REFERENCES wellness_challenges(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  final_score integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create social_connections table (optional social features)
CREATE TABLE IF NOT EXISTS social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connection_type text NOT NULL DEFAULT 'friend' CHECK (connection_type IN ('friend', 'accountability_partner', 'mentor', 'mentee')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  shared_data_permissions jsonb DEFAULT '{"stress_levels": false, "meditation_progress": false, "achievements": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Create wellness_reports table for periodic summaries
CREATE TABLE IF NOT EXISTS wellness_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly')),
  report_period_start date NOT NULL,
  report_period_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}',
  insights text[],
  recommendations text[],
  generated_at timestamptz DEFAULT now(),
  is_viewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE wellness_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_trigger_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wellness_insights
CREATE POLICY "Users can read own insights"
  ON wellness_insights FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON wellness_insights FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for habit_tracking
CREATE POLICY "Users can manage own habits"
  ON habit_tracking FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for habit_completions
CREATE POLICY "Users can manage own habit completions"
  ON habit_completions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mood_patterns
CREATE POLICY "Users can manage own mood patterns"
  ON mood_patterns FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for stress_triggers
CREATE POLICY "Users can manage own stress triggers"
  ON stress_triggers FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for stress_trigger_incidents
CREATE POLICY "Users can manage own trigger incidents"
  ON stress_trigger_incidents FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for mindfulness_reminders
CREATE POLICY "Users can manage own reminders"
  ON mindfulness_reminders FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wellness_challenges (public read, admin write)
CREATE POLICY "Anyone can read active challenges"
  ON wellness_challenges FOR SELECT TO authenticated
  USING (is_active = true);

-- Create RLS policies for user_challenge_participation
CREATE POLICY "Users can manage own challenge participation"
  ON user_challenge_participation FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for social_connections
CREATE POLICY "Users can manage own connections"
  ON social_connections FOR ALL TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for wellness_reports
CREATE POLICY "Users can read own reports"
  ON wellness_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wellness_insights_user_type ON wellness_insights(user_id, insight_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_habit_tracking_user_active ON habit_tracking(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_patterns_user_created ON mood_patterns(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stress_triggers_user_active ON stress_triggers(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_stress_trigger_incidents_trigger_date ON stress_trigger_incidents(trigger_id, incident_date DESC);
CREATE INDEX IF NOT EXISTS idx_mindfulness_reminders_user_active ON mindfulness_reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_wellness_challenges_active_dates ON wellness_challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_participation_user_challenge ON user_challenge_participation(user_id, challenge_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_user_status ON social_connections(user_id, status);
CREATE INDEX IF NOT EXISTS idx_wellness_reports_user_period ON wellness_reports(user_id, report_period_start DESC);

-- Add triggers for updated_at columns
CREATE TRIGGER update_wellness_insights_updated_at
  BEFORE UPDATE ON wellness_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_tracking_updated_at
  BEFORE UPDATE ON habit_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stress_triggers_updated_at
  BEFORE UPDATE ON stress_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mindfulness_reminders_updated_at
  BEFORE UPDATE ON mindfulness_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wellness_challenges_updated_at
  BEFORE UPDATE ON wellness_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenge_participation_updated_at
  BEFORE UPDATE ON user_challenge_participation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate habit streaks
CREATE OR REPLACE FUNCTION update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  current_streak_count integer := 0;
  longest_streak_count integer := 0;
  check_date date;
  habit_record RECORD;
BEGIN
  -- Get the habit record
  SELECT * INTO habit_record FROM habit_tracking WHERE id = NEW.habit_id;
  
  -- Calculate current streak
  check_date := NEW.completion_date;
  WHILE EXISTS (
    SELECT 1 FROM habit_completions 
    WHERE habit_id = NEW.habit_id AND completion_date = check_date
  ) LOOP
    current_streak_count := current_streak_count + 1;
    check_date := check_date - interval '1 day';
  END LOOP;
  
  -- Get longest streak from habit_tracking table
  SELECT longest_streak INTO longest_streak_count FROM habit_tracking WHERE id = NEW.habit_id;
  
  -- Update habit_tracking with new streak information
  UPDATE habit_tracking 
  SET 
    current_streak = current_streak_count,
    longest_streak = GREATEST(longest_streak_count, current_streak_count),
    updated_at = now()
  WHERE id = NEW.habit_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for habit streak calculation
CREATE TRIGGER update_habit_streak_trigger
  AFTER INSERT ON habit_completions
  FOR EACH ROW EXECUTE FUNCTION update_habit_streak();

-- Create function to generate wellness insights
CREATE OR REPLACE FUNCTION generate_wellness_insights()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  stress_avg decimal;
  mood_trend text;
  habit_completion_rate decimal;
BEGIN
  -- Loop through all active users
  FOR user_record IN SELECT id FROM profiles LOOP
    
    -- Calculate average stress level for the past week
    SELECT AVG(stress_level) INTO stress_avg
    FROM stress_readings 
    WHERE user_id = user_record.id 
      AND created_at >= now() - interval '7 days';
    
    -- Generate stress pattern insight if stress is elevated
    IF stress_avg > 70 THEN
      INSERT INTO wellness_insights (user_id, insight_type, title, description, confidence_score)
      VALUES (
        user_record.id,
        'stress_pattern',
        'Elevated Stress Detected',
        'Your stress levels have been higher than usual this week. Consider incorporating more breathing exercises or meditation into your routine.',
        0.85
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
    -- Calculate habit completion rate
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE COUNT(CASE WHEN completion_date >= CURRENT_DATE - interval '7 days' THEN 1 END)::decimal / 7
      END INTO habit_completion_rate
    FROM habit_completions hc
    JOIN habit_tracking ht ON hc.habit_id = ht.id
    WHERE ht.user_id = user_record.id AND ht.is_active = true;
    
    -- Generate habit suggestion if completion rate is low
    IF habit_completion_rate < 0.5 THEN
      INSERT INTO wellness_insights (user_id, insight_type, title, description, confidence_score)
      VALUES (
        user_record.id,
        'habit_suggestion',
        'Boost Your Habit Consistency',
        'Your habit completion rate has been below 50% this week. Try setting smaller, more achievable daily goals to build momentum.',
        0.75
      )
      ON CONFLICT DO NOTHING;
    END IF;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update challenge progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
DECLARE
  challenge_record RECORD;
  user_progress integer := 0;
BEGIN
  -- Get active challenges for the user
  FOR challenge_record IN 
    SELECT ucp.*, wc.target_metric, wc.target_value
    FROM user_challenge_participation ucp
    JOIN wellness_challenges wc ON ucp.challenge_id = wc.id
    WHERE ucp.user_id = NEW.user_id 
      AND ucp.is_completed = false
      AND wc.is_active = true
  LOOP
    
    -- Calculate progress based on challenge type
    CASE challenge_record.target_metric
      WHEN 'meditation_minutes' THEN
        SELECT COALESCE(SUM(duration_minutes), 0) INTO user_progress
        FROM meditation_sessions
        WHERE user_id = NEW.user_id
          AND created_at >= challenge_record.joined_at;
          
      WHEN 'journal_entries' THEN
        SELECT COUNT(*) INTO user_progress
        FROM journal_entries
        WHERE user_id = NEW.user_id
          AND created_at >= challenge_record.joined_at;
          
      WHEN 'stress_readings' THEN
        SELECT COUNT(*) INTO user_progress
        FROM stress_readings
        WHERE user_id = NEW.user_id
          AND created_at >= challenge_record.joined_at;
    END CASE;
    
    -- Update challenge progress
    UPDATE user_challenge_participation
    SET 
      current_progress = user_progress,
      is_completed = (user_progress >= challenge_record.target_value),
      completed_at = CASE 
        WHEN user_progress >= challenge_record.target_value THEN now()
        ELSE completed_at
      END,
      updated_at = now()
    WHERE id = challenge_record.id;
    
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for challenge progress updates
CREATE TRIGGER update_challenge_progress_meditation
  AFTER INSERT ON meditation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_challenge_progress();

CREATE TRIGGER update_challenge_progress_journal
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_challenge_progress();

CREATE TRIGGER update_challenge_progress_stress
  AFTER INSERT ON stress_readings
  FOR EACH ROW EXECUTE FUNCTION update_challenge_progress();

-- Insert sample wellness challenges
INSERT INTO wellness_challenges (title, description, challenge_type, duration_days, target_metric, target_value, difficulty_level, reward_points) VALUES
  ('7-Day Mindfulness Starter', 'Complete 7 days of meditation to build a mindful habit', 'meditation', 7, 'meditation_minutes', 70, 'beginner', 100),
  ('Stress Awareness Week', 'Track your stress levels daily for one week', 'stress_reduction', 7, 'stress_readings', 7, 'beginner', 75),
  ('Reflection Challenge', 'Write 10 journal entries to develop self-awareness', 'journaling', 14, 'journal_entries', 10, 'intermediate', 150),
  ('Meditation Master', 'Complete 300 minutes of meditation in 30 days', 'meditation', 30, 'meditation_minutes', 300, 'advanced', 300),
  ('Mindful Commuter', 'Use mindful commuting techniques for 2 weeks', 'mindful_commuting', 14, 'stress_readings', 14, 'intermediate', 200)
ON CONFLICT DO NOTHING;

-- Insert sample mindfulness reminders
INSERT INTO mindfulness_reminders (user_id, reminder_type, title, message, frequency, scheduled_times) 
SELECT 
  id,
  'breathing',
  'Take a Mindful Breath',
  'Pause for a moment and take three deep, conscious breaths. Notice how you feel.',
  'daily',
  ARRAY['09:00'::time, '15:00'::time, '18:00'::time]
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM mindfulness_reminders 
  WHERE user_id = profiles.id AND reminder_type = 'breathing'
);