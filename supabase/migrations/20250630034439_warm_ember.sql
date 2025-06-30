/*
  # Add achievements and streak tracking tables

  1. New Tables
    - `achievements`
      - `id` (text, primary key)
      - `title` (text)
      - `description` (text)
      - `icon` (text)
      - `colors` (text array)
      - `category` (text)
      - `requirement_type` (text)
      - `requirement_target` (integer)
      - `requirement_timeframe` (text)
      - `created_at` (timestamp)
    
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `achievement_id` (text, references achievements)
      - `unlocked_at` (timestamp)
      - `created_at` (timestamp)
    
    - `streak_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `last_check_in` (timestamp)
      - `streak_history` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `daily_affirmations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `affirmation_id` (text)
      - `date` (date)
      - `is_favorite` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create achievements table (static data)
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  colors text[] NOT NULL,
  category text NOT NULL,
  requirement_type text NOT NULL,
  requirement_target integer NOT NULL,
  requirement_timeframe text,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create streak_data table
CREATE TABLE IF NOT EXISTS streak_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_check_in timestamptz,
  streak_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_affirmations table
CREATE TABLE IF NOT EXISTS daily_affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  affirmation_id text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, affirmation_id, date)
);

-- Enable Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_affirmations ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements (read-only for all authenticated users)
CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_achievements
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
  ON user_achievements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for streak_data
CREATE POLICY "Users can read own streak data"
  ON streak_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data"
  ON streak_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data"
  ON streak_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streak data"
  ON streak_data
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for daily_affirmations
CREATE POLICY "Users can read own affirmations"
  ON daily_affirmations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affirmations"
  ON daily_affirmations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affirmations"
  ON daily_affirmations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own affirmations"
  ON daily_affirmations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for streak_data updated_at
CREATE TRIGGER update_streak_data_updated_at
  BEFORE UPDATE ON streak_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default achievements
INSERT INTO achievements (id, title, description, icon, colors, category, requirement_type, requirement_target, requirement_timeframe) VALUES
  ('zen_sprout', 'Zen Sprout', 'Complete your first mindful session', 'sprout', ARRAY['#A8E6CF', '#7FCDCD'], 'meditation', 'meditation_count', 1, 'all_time'),
  ('lavender_loop', 'Lavender Loop', 'Maintain a 7-day streak', 'loop', ARRAY['#DDA0DD', '#BA68C8'], 'streak', 'streak', 7, NULL),
  ('mind_magnet', 'Mind Magnet', 'Complete 10 meditation sessions', 'magnet', ARRAY['#87CEEB', '#5DADE2'], 'meditation', 'meditation_count', 10, 'all_time'),
  ('calm_commuter', 'Calm Commuter', 'Reduce stress by 30% in a session', 'sun', ARRAY['#FFD93D', '#FFC107'], 'stress', 'stress_reduction', 30, NULL),
  ('mood_alchemist', 'Mood Alchemist', 'Write 5 journal entries', 'palette', ARRAY['#FFB6C1', '#F48FB1'], 'journal', 'journal_count', 5, 'all_time'),
  ('focus_forcefield', 'Focus Forcefield', 'Complete 20 meditation sessions', 'shield', ARRAY['#98E4D6', '#4DB6AC'], 'meditation', 'meditation_count', 20, 'all_time'),
  ('sound_surfer', 'Sound Surfer', 'Use soundscapes for 5 sessions', 'headphones', ARRAY['#B6D0E2', '#81C784'], 'special', 'meditation_count', 5, 'all_time'),
  ('stillness_master', 'Stillness Master', 'Maintain a 30-day streak', 'meditation', ARRAY['#E1BEE7', '#CE93D8'], 'streak', 'streak', 30, NULL)
ON CONFLICT (id) DO NOTHING;