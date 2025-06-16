/*
  # Add project_element_id to project_products table

  1. Changes
    - Add `project_element_id` column to `project_products` table
    - This establishes a direct link between each product and the specific detected element
    - Add foreign key constraint referencing project_elements(id)
    - Update existing unique index to include project_element_id

  2. Security
    - No changes to RLS policies needed
*/

-- Add project_element_id column to project_products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_products' AND column_name = 'project_element_id'
  ) THEN
    ALTER TABLE project_products ADD COLUMN project_element_id uuid REFERENCES project_elements(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Drop existing unique index
DROP INDEX IF EXISTS idx_project_products_unique;

-- Create new unique index that includes project_element_id
CREATE UNIQUE INDEX idx_project_products_unique ON project_products(project_id, asin, source, COALESCE(project_element_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Create index for faster queries on project_element_id
CREATE INDEX IF NOT EXISTS idx_project_products_element_id ON project_products(project_element_id);