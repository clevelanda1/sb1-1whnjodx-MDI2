/*
  # Create white-label-logos storage bucket and fix RLS policies

  1. New Storage Bucket
    - `white-label-logos` - For storing user-uploaded brand logos
    - Set file size limit to 2MB
    - Allow common image formats (JPEG, PNG, GIF, WebP)
    - Make bucket public for shared access

  2. Security
    - Create proper RLS policies using storage API functions
    - Allow users to manage their own logos
    - Allow public access to view logos (needed for shared boards)
*/

-- Create the white-label-logos bucket using the storage API
SELECT storage.create_bucket(
  'white-label-logos',
  'Public bucket for white label logos',
  public := true,
  file_size_limit := 2097152, -- 2MB
  allowed_mime_types := ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]
);

-- Create policy to allow users to insert their own logos
SELECT storage.create_policy(
  'white-label-logos',
  'insert_policy',
  'INSERT',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy to allow users to update their own logos
SELECT storage.create_policy(
  'white-label-logos',
  'update_policy',
  'UPDATE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own logos
SELECT storage.create_policy(
  'white-label-logos',
  'delete_policy',
  'DELETE',
  'authenticated',
  storage.foldername(name)[1] = auth.uid()::text
);

-- Create policy to allow anyone to view logos (needed for shared boards)
SELECT storage.create_policy(
  'white-label-logos',
  'select_policy',
  'SELECT',
  'public',
  true
);

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

-- Create policy to allow anyone to view white label settings for shared boards
CREATE POLICY "Anyone can view white label settings for shared boards"
  ON white_label_settings
  FOR SELECT
  TO anon
  USING (
    user_id IN (
      SELECT creator_id 
      FROM shared_vision_boards
      WHERE share_token IS NOT NULL
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_white_label_settings_user_id ON white_label_settings(user_id);

-- Create updated_at trigger for white_label_settings
CREATE TRIGGER update_white_label_settings_updated_at
  BEFORE UPDATE ON white_label_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();