/*
  # Create vision boards schema

  1. New Tables
    - `vision_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text, optional)
      - `thumbnail_url` (text, optional) - Generated thumbnail of the board
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `vision_board_items`
      - `id` (uuid, primary key)
      - `vision_board_id` (uuid, references vision_boards)
      - `liked_product_id` (uuid, references liked_products)
      - `x` (integer) - X position on board
      - `y` (integer) - Y position on board
      - `width` (integer) - Item width
      - `height` (integer) - Item height
      - `rotation` (integer) - Item rotation in degrees
      - `z_index` (integer) - Layer order
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create vision_boards table
CREATE TABLE IF NOT EXISTS vision_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vision_board_items table
CREATE TABLE IF NOT EXISTS vision_board_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vision_board_id uuid REFERENCES vision_boards(id) ON DELETE CASCADE NOT NULL,
  liked_product_id uuid REFERENCES liked_products(id) ON DELETE CASCADE NOT NULL,
  x integer NOT NULL DEFAULT 0,
  y integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 200,
  height integer NOT NULL DEFAULT 200,
  rotation integer NOT NULL DEFAULT 0,
  z_index integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE vision_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_board_items ENABLE ROW LEVEL SECURITY;

-- Create policies for vision_boards table
CREATE POLICY "Users can view their own vision boards"
  ON vision_boards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vision boards"
  ON vision_boards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision boards"
  ON vision_boards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision boards"
  ON vision_boards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for vision_board_items table
CREATE POLICY "Users can view items of their own vision boards"
  ON vision_board_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_boards 
      WHERE vision_boards.id = vision_board_items.vision_board_id 
      AND vision_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their own vision boards"
  ON vision_board_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vision_boards 
      WHERE vision_boards.id = vision_board_items.vision_board_id 
      AND vision_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their own vision boards"
  ON vision_board_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_boards 
      WHERE vision_boards.id = vision_board_items.vision_board_id 
      AND vision_boards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vision_boards 
      WHERE vision_boards.id = vision_board_items.vision_board_id 
      AND vision_boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their own vision boards"
  ON vision_board_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vision_boards 
      WHERE vision_boards.id = vision_board_items.vision_board_id 
      AND vision_boards.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vision_boards_user_id ON vision_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_vision_boards_created_at ON vision_boards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vision_board_items_vision_board_id ON vision_board_items(vision_board_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_items_liked_product_id ON vision_board_items(liked_product_id);

-- Create updated_at trigger for vision_boards
DROP TRIGGER IF EXISTS update_vision_boards_updated_at ON vision_boards;
CREATE TRIGGER update_vision_boards_updated_at
  BEFORE UPDATE ON vision_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();