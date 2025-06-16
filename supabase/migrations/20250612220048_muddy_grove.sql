/*
  # Fix API Usage Tables and Vision Board Schema

  1. API Usage Tables
    - Initialize amazon_api_usage table with default values if empty
    - Initialize etsy_api_usage table with default values if empty
    - Ensure only one row exists in each table

  2. Vision Board Items Schema Update
    - Change x, y, width, height, rotation columns from INTEGER to NUMERIC
    - This allows storing decimal values for precise positioning

  3. Data Migration
    - Preserve existing vision board items data during schema change
*/

-- First, let's fix the API usage tables
-- Initialize amazon_api_usage table if it's empty
DO $$
BEGIN
  -- Check if amazon_api_usage table is empty
  IF NOT EXISTS (SELECT 1 FROM amazon_api_usage LIMIT 1) THEN
    INSERT INTO amazon_api_usage (
      total_count,
      monthly_limit,
      subscription_start_date,
      last_reset_date
    ) VALUES (
      0,
      1000,
      '2025-01-01'::date,
      CURRENT_DATE
    );
  END IF;
END $$;

-- Initialize etsy_api_usage table if it's empty
DO $$
BEGIN
  -- Check if etsy_api_usage table is empty
  IF NOT EXISTS (SELECT 1 FROM etsy_api_usage LIMIT 1) THEN
    INSERT INTO etsy_api_usage (
      total_count,
      monthly_limit,
      subscription_start_date,
      last_reset_date
    ) VALUES (
      0,
      1000,
      '2025-01-01'::date,
      CURRENT_DATE
    );
  END IF;
END $$;

-- Ensure only one row exists in amazon_api_usage
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM amazon_api_usage;
  
  IF row_count > 1 THEN
    -- Keep only the most recent row
    DELETE FROM amazon_api_usage 
    WHERE id NOT IN (
      SELECT id FROM amazon_api_usage 
      ORDER BY created_at DESC 
      LIMIT 1
    );
  END IF;
END $$;

-- Ensure only one row exists in etsy_api_usage
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO row_count FROM etsy_api_usage;
  
  IF row_count > 1 THEN
    -- Keep only the most recent row
    DELETE FROM etsy_api_usage 
    WHERE id NOT IN (
      SELECT id FROM etsy_api_usage 
      ORDER BY created_at DESC 
      LIMIT 1
    );
  END IF;
END $$;

-- Now let's fix the vision_board_items table schema
-- Change integer columns to numeric to support decimal values

-- Update x column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vision_board_items' 
    AND column_name = 'x' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE vision_board_items ALTER COLUMN x TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Update y column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vision_board_items' 
    AND column_name = 'y' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE vision_board_items ALTER COLUMN y TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Update width column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vision_board_items' 
    AND column_name = 'width' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE vision_board_items ALTER COLUMN width TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Update height column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vision_board_items' 
    AND column_name = 'height' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE vision_board_items ALTER COLUMN height TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Update rotation column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vision_board_items' 
    AND column_name = 'rotation' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE vision_board_items ALTER COLUMN rotation TYPE NUMERIC(10,2);
  END IF;
END $$;

-- Update default values for the numeric columns
ALTER TABLE vision_board_items ALTER COLUMN x SET DEFAULT 0.0;
ALTER TABLE vision_board_items ALTER COLUMN y SET DEFAULT 0.0;
ALTER TABLE vision_board_items ALTER COLUMN width SET DEFAULT 200.0;
ALTER TABLE vision_board_items ALTER COLUMN height SET DEFAULT 200.0;
ALTER TABLE vision_board_items ALTER COLUMN rotation SET DEFAULT 0.0;