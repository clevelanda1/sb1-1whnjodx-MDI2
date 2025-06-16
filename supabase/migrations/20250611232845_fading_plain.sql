/*
  # Add source column to project_products table

  1. Changes
    - Add `source` column to `project_products` table to track marketplace origin
    - Set default value to 'amazon' for backward compatibility
    - Update existing records to have 'amazon' as source
    - Drop existing unique index and create new one that includes source column

  2. Security
    - No changes to RLS policies needed
*/

-- Add source column to project_products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_products' AND column_name = 'source'
  ) THEN
    ALTER TABLE project_products ADD COLUMN source text DEFAULT 'amazon' CHECK (source IN ('amazon', 'wayfair'));
  END IF;
END $$;

-- Update existing records to have 'amazon' as source (for backward compatibility)
UPDATE project_products SET source = 'amazon' WHERE source IS NULL;

-- Make source column NOT NULL after setting defaults
ALTER TABLE project_products ALTER COLUMN source SET NOT NULL;

-- Drop existing unique index
DROP INDEX IF EXISTS idx_project_products_unique;

-- Create new unique index that includes source column
CREATE UNIQUE INDEX idx_project_products_unique ON project_products(project_id, asin, source);