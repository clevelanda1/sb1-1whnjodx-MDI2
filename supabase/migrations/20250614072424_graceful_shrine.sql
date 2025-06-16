/*
  # Add white label settings for Studio plan users

  1. New Tables
    - `white_label_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `logo_url` (text) - URL to logo image
      - `brand_name` (text) - Custom brand name
      - `primary_color` (text) - Brand color in hex format
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `creator_id` to `shared_vision_boards` table
    - This links shared boards to their creator for white labeling

  3. Security
    - Enable RLS on white_label_settings table
    - Add policies for authenticated users to manage their own settings
    - Allow anonymous users to view settings for shared boards
*/

-- Create white_label_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS white_label_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logo_url text,
  brand_name text,
  primary_color text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE white_label_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for white_label_settings table (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'white_label_settings' AND policyname = 'Users can view their own white label settings'
  ) THEN
    CREATE POLICY "Users can view their own white label settings"
      ON white_label_settings
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'white_label_settings' AND policyname = 'Users can create their own white label settings'
  ) THEN
    CREATE POLICY "Users can create their own white label settings"
      ON white_label_settings
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'white_label_settings' AND policyname = 'Users can update their own white label settings'
  ) THEN
    CREATE POLICY "Users can update their own white label settings"
      ON white_label_settings
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'white_label_settings' AND policyname = 'Users can delete their own white label settings'
  ) THEN
    CREATE POLICY "Users can delete their own white label settings"
      ON white_label_settings
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'white_label_settings' AND policyname = 'Anyone can view white label settings for shared boards'
  ) THEN
    CREATE POLICY "Anyone can view white label settings for shared boards"
      ON white_label_settings
      FOR SELECT
      TO anon
      USING (
        user_id IN (
          SELECT creator_id
          FROM shared_vision_boards
          WHERE 
            share_token IS NOT NULL AND
            (expires_at IS NULL OR expires_at > now())
        )
      );
  END IF;
END $$;

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_white_label_settings_user_id ON white_label_settings(user_id);

-- Create updated_at trigger for white_label_settings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_white_label_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_white_label_settings_updated_at
      BEFORE UPDATE ON white_label_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add creator_id to shared_vision_boards if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shared_vision_boards' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE shared_vision_boards ADD COLUMN creator_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index for faster queries on creator_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_shared_vision_boards_creator_id'
  ) THEN
    CREATE INDEX idx_shared_vision_boards_creator_id ON shared_vision_boards(creator_id);
  END IF;
END $$;