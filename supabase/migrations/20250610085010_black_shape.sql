/*
  # Add source column to liked_products table

  1. Changes
    - Add `source` column to `liked_products` table to track marketplace origin
    - Set default value to 'amazon' for backward compatibility
    - Update existing records to have 'amazon' as source

  2. Security
    - No changes to RLS policies needed
*/

-- Add source column to liked_products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'liked_products' AND column_name = 'source'
  ) THEN
    ALTER TABLE liked_products ADD COLUMN source text DEFAULT 'amazon' CHECK (source IN ('amazon', 'wayfair'));
  END IF;
END $$;

-- Update existing records to have 'amazon' as source (for backward compatibility)
UPDATE liked_products SET source = 'amazon' WHERE source IS NULL;

-- Make source column NOT NULL after setting defaults
ALTER TABLE liked_products ALTER COLUMN source SET NOT NULL;