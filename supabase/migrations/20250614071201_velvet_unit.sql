/*
  # Add white label settings for Studio tier users

  1. New Tables
    - `white_label_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `logo_url` (text, optional) - URL to uploaded logo
      - `brand_name` (text, optional) - Custom brand name
      - `primary_color` (text, optional) - Custom primary color
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `creator_id` column to `shared_vision_boards` table
      - This allows fetching white label settings for shared boards

  3. Security
    - Enable RLS on white_label_settings table
    - Add policies for authenticated users to manage their own white label settings
*/

-- Create white_label_settings table
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

-- Create policies for white_label_settings table
CREATE POLICY "Users can view their own white label settings"
  ON white_label_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own white label settings"
  ON white_label_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own white label settings"
  ON white_label_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own white label settings"
  ON white_label_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_white_label_settings_user_id ON white_label_settings(user_id);

-- Create updated_at trigger for white_label_settings
DROP TRIGGER IF EXISTS update_white_label_settings_updated_at ON white_label_settings;
CREATE TRIGGER update_white_label_settings_updated_at
  BEFORE UPDATE ON white_label_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add creator_id column to shared_vision_boards table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shared_vision_boards' AND column_name = 'creator_id'
  ) THEN
    ALTER TABLE shared_vision_boards ADD COLUMN creator_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update existing shared_vision_boards to set creator_id = user_id
UPDATE shared_vision_boards SET creator_id = user_id WHERE creator_id IS NULL;

-- Create index for faster queries on creator_id
CREATE INDEX IF NOT EXISTS idx_shared_vision_boards_creator_id ON shared_vision_boards(creator_id);

-- Add policy to allow public access to white_label_settings for shared boards
CREATE POLICY "Anyone can view white label settings for shared boards"
  ON white_label_settings
  FOR SELECT
  TO anon
  USING (
    user_id IN (
      SELECT creator_id FROM shared_vision_boards
      WHERE share_token IS NOT NULL
      AND (expires_at IS NULL OR expires_at > now())
    )
  );