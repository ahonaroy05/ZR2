/*
  # Create chat history table for AI assistant

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `history` (jsonb, stores conversation messages)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on chat_history table
    - Add policies for authenticated users to manage their own chat history
*/

-- Create chat_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can insert own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can update own chat history" ON chat_history;
  DROP POLICY IF EXISTS "Users can delete own chat history" ON chat_history;

  -- Create policies for chat_history
  CREATE POLICY "Users can read own chat history"
    ON chat_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own chat history"
    ON chat_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own chat history"
    ON chat_history
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own chat history"
    ON chat_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Drop existing trigger if it exists and recreate it
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_chat_history_updated_at ON chat_history;
  
  CREATE TRIGGER update_chat_history_updated_at
    BEFORE UPDATE ON chat_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;