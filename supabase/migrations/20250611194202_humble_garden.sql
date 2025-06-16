/*
  # Add vision board save/load functionality

  1. Updates to existing tables
    - Add `is_saved` column to vision_boards table
    - Add `board_data` jsonb column to store complete board state
    - Add `preview_image_url` column for board thumbnails

  2. New functionality
    - Save complete vision board state including items and layout
    - Load saved vision boards with all items and positioning
    - Generate preview thumbnails for saved boards

  3. Security
    - Maintain existing RLS policies
    - Ensure users can only access their own saved boards
*/

-- Add new columns to vision_boards table
DO $$
BEGIN
  -- Add is_saved column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_boards' AND column_name = 'is_saved'
  ) THEN
    ALTER TABLE vision_boards ADD COLUMN is_saved boolean DEFAULT false;
  END IF;

  -- Add board_data column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_boards' AND column_name = 'board_data'
  ) THEN
    ALTER TABLE vision_boards ADD COLUMN board_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add preview_image_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vision_boards' AND column_name = 'preview_image_url'
  ) THEN
    ALTER TABLE vision_boards ADD COLUMN preview_image_url text;
  END IF;
END $$;

-- Create index for faster queries on saved boards
CREATE INDEX IF NOT EXISTS idx_vision_boards_is_saved ON vision_boards(user_id, is_saved) WHERE is_saved = true;