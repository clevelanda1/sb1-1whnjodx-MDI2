/*
  # Create shared vision boards table for public sharing

  1. New Tables
    - `shared_vision_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `share_token` (text, unique) - Public token for sharing
      - `board_name` (text) - Name of the shared board
      - `board_data` (jsonb) - Complete board state with items
      - `total_budget` (numeric) - Total cost of all items
      - `expires_at` (timestamp, optional) - When the share link expires
      - `view_count` (integer) - Number of times viewed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on shared_vision_boards table
    - Allow public read access via share token
    - Only authenticated users can create/manage their own shared boards
*/

-- Create shared_vision_boards table
CREATE TABLE IF NOT EXISTS shared_vision_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL,
  board_name text NOT NULL,
  board_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  total_budget numeric DEFAULT 0,
  expires_at timestamptz,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE shared_vision_boards ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_vision_boards table
-- Allow public read access via share token (for non-authenticated users)
CREATE POLICY "Anyone can view shared vision boards via token"
  ON shared_vision_boards
  FOR SELECT
  TO anon
  USING (
    share_token IS NOT NULL 
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Allow authenticated users to view their own shared boards
CREATE POLICY "Users can view their own shared vision boards"
  ON shared_vision_boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to create their own shared boards
CREATE POLICY "Users can create their own shared vision boards"
  ON shared_vision_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own shared boards
CREATE POLICY "Users can update their own shared vision boards"
  ON shared_vision_boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own shared boards
CREATE POLICY "Users can delete their own shared vision boards"
  ON shared_vision_boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_vision_boards_user_id ON shared_vision_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_vision_boards_share_token ON shared_vision_boards(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_vision_boards_created_at ON shared_vision_boards(created_at DESC);

-- Create updated_at trigger for shared_vision_boards
DROP TRIGGER IF EXISTS update_shared_vision_boards_updated_at ON shared_vision_boards;
CREATE TRIGGER update_shared_vision_boards_updated_at
  BEFORE UPDATE ON shared_vision_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();