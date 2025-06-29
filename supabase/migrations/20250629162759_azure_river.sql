/*
  # ZenRoute Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `stress_readings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `stress_level` (integer, 0-100)
      - `location` (text)
      - `created_at` (timestamp)
    - `meditation_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `duration_minutes` (integer)
      - `session_type` (text)
      - `stress_before` (integer, 0-100)
      - `stress_after` (integer, 0-100)
      - `created_at` (timestamp)
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `mood` (text)
      - `stress_level` (integer, 1-10)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records

  3. Functions
    - Auto-update timestamp function for updated_at columns
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stress_readings table
CREATE TABLE IF NOT EXISTS stress_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stress_level integer NOT NULL CHECK (stress_level >= 0 AND stress_level <= 100),
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create meditation_sessions table
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 0,
  session_type text NOT NULL DEFAULT 'breathing',
  stress_before integer CHECK (stress_before >= 0 AND stress_before <= 100),
  stress_after integer CHECK (stress_after >= 0 AND stress_after <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL DEFAULT '',
  mood text NOT NULL DEFAULT 'neutral',
  stress_level integer NOT NULL DEFAULT 5 CHECK (stress_level >= 1 AND stress_level <= 10),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stress_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop and recreate policies for profiles
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

  CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Drop and recreate policies for stress_readings
  DROP POLICY IF EXISTS "Users can read own stress readings" ON stress_readings;
  DROP POLICY IF EXISTS "Users can insert own stress readings" ON stress_readings;
  DROP POLICY IF EXISTS "Users can update own stress readings" ON stress_readings;
  DROP POLICY IF EXISTS "Users can delete own stress readings" ON stress_readings;

  CREATE POLICY "Users can read own stress readings"
    ON stress_readings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own stress readings"
    ON stress_readings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own stress readings"
    ON stress_readings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own stress readings"
    ON stress_readings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Drop and recreate policies for meditation_sessions
  DROP POLICY IF EXISTS "Users can read own meditation sessions" ON meditation_sessions;
  DROP POLICY IF EXISTS "Users can insert own meditation sessions" ON meditation_sessions;
  DROP POLICY IF EXISTS "Users can update own meditation sessions" ON meditation_sessions;
  DROP POLICY IF EXISTS "Users can delete own meditation sessions" ON meditation_sessions;

  CREATE POLICY "Users can read own meditation sessions"
    ON meditation_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own meditation sessions"
    ON meditation_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own meditation sessions"
    ON meditation_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own meditation sessions"
    ON meditation_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Drop and recreate policies for journal_entries
  DROP POLICY IF EXISTS "Users can read own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can insert own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can update own journal entries" ON journal_entries;
  DROP POLICY IF EXISTS "Users can delete own journal entries" ON journal_entries;

  CREATE POLICY "Users can read own journal entries"
    ON journal_entries
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own journal entries"
    ON journal_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own journal entries"
    ON journal_entries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own journal entries"
    ON journal_entries
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate them
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;

  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;