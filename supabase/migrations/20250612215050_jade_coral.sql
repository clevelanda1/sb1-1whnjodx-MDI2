/*
  # Fix Vision Board Data Storage and Migration

  1. Changes
    - Ensure vision_boards table has all required columns
    - Create index for faster queries on saved boards
    - Add function to migrate existing vision board data to vision_board_items table
    - Fix handling of floating-point coordinates in JSON data

  2. Security
    - No changes to RLS policies needed
*/

-- Ensure vision_boards table has all required columns
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

-- Create index for faster queries on saved boards if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_vision_boards_is_saved'
  ) THEN
    CREATE INDEX idx_vision_boards_is_saved ON vision_boards(user_id, is_saved) WHERE is_saved = true;
  END IF;
END $$;

-- Add function to migrate existing vision boards to use vision_board_items table
-- This will run once to ensure data consistency
CREATE OR REPLACE FUNCTION migrate_vision_boards_to_items()
RETURNS void AS $$
DECLARE
  board_record RECORD;
  item RECORD;
  liked_product_id UUID;
  x_coord INTEGER;
  y_coord INTEGER;
  width_val INTEGER;
  height_val INTEGER;
  rotation_val INTEGER;
BEGIN
  -- Loop through all vision boards with board_data containing items
  FOR board_record IN 
    SELECT id, user_id, board_data 
    FROM vision_boards 
    WHERE board_data IS NOT NULL 
    AND board_data->'items' IS NOT NULL 
    AND jsonb_array_length(board_data->'items') > 0
  LOOP
    -- For each board, loop through its items
    FOR item IN 
      SELECT jsonb_array_elements(board_record.board_data->'items') AS data
    LOOP
      -- Safely convert coordinates to integers
      BEGIN
        -- Convert floating point values to integers with proper error handling
        x_coord := FLOOR((item.data->>'x')::numeric)::integer;
        y_coord := FLOOR((item.data->>'y')::numeric)::integer;
        width_val := FLOOR((item.data->>'width')::numeric)::integer;
        height_val := FLOOR((item.data->>'height')::numeric)::integer;
        rotation_val := FLOOR((item.data->>'rotation')::numeric)::integer;
      EXCEPTION WHEN OTHERS THEN
        -- Default values if conversion fails
        x_coord := 0;
        y_coord := 0;
        width_val := 200;
        height_val := 200;
        rotation_val := 0;
        RAISE NOTICE 'Error converting coordinates for board % item %: %', 
                     board_record.id, item.data->>'id', SQLERRM;
      END;

      -- Check if this item already exists in vision_board_items
      IF NOT EXISTS (
        SELECT 1 FROM vision_board_items 
        WHERE vision_board_id = board_record.id 
        AND x = x_coord
        AND y = y_coord
      ) THEN
        -- Find the corresponding liked_product
        -- Try both 'id' and 'asin' fields since the JSON structure might vary
        SELECT id INTO liked_product_id 
        FROM liked_products 
        WHERE user_id = board_record.user_id 
        AND (
          asin = item.data->>'id' OR 
          asin = item.data->>'asin'
        )
        LIMIT 1;
        
        -- If liked product exists, create vision_board_item
        IF liked_product_id IS NOT NULL THEN
          INSERT INTO vision_board_items (
            vision_board_id,
            liked_product_id,
            x,
            y,
            width,
            height,
            rotation,
            z_index
          ) VALUES (
            board_record.id,
            liked_product_id,
            x_coord,
            y_coord,
            width_val,
            height_val,
            rotation_val,
            1
          );
          
          RAISE NOTICE 'Migrated item % for board %', liked_product_id, board_record.id;
        ELSE
          RAISE NOTICE 'Could not find liked product for board % item %', 
                       board_record.id, item.data->>'id';
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_vision_boards_to_items();

-- Drop the migration function after use
DROP FUNCTION migrate_vision_boards_to_items();