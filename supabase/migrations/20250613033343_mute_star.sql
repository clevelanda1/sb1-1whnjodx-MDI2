/*
  # Add dual search query support to project_elements table

  1. Changes
    - Add `selected_amazon_query` column to `project_elements` table
    - Add `selected_etsy_query` column to `project_elements` table
    - Rename `selected_query` to `selected_amazon_query` for backward compatibility
    - Update existing records to maintain compatibility

  2. Security
    - No changes to RLS policies needed
*/

-- Add selected_amazon_query column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_elements' AND column_name = 'selected_amazon_query'
  ) THEN
    ALTER TABLE project_elements ADD COLUMN selected_amazon_query text;
  END IF;
END $$;

-- Add selected_etsy_query column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_elements' AND column_name = 'selected_etsy_query'
  ) THEN
    ALTER TABLE project_elements ADD COLUMN selected_etsy_query text;
  END IF;
END $$;

-- Migrate data from selected_query to selected_amazon_query for backward compatibility
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_elements' AND column_name = 'selected_query'
  ) THEN
    -- Copy data from selected_query to selected_amazon_query where selected_amazon_query is null
    UPDATE project_elements
    SET selected_amazon_query = selected_query
    WHERE selected_query IS NOT NULL AND selected_amazon_query IS NULL;
  END IF;
END $$;