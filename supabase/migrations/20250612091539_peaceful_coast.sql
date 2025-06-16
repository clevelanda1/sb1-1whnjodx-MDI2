/*
  # Update source constraints to include etsy and remove wayfair

  1. Changes
    - Update CHECK constraints on project_products.source and liked_products.source
    - Change 'wayfair' to 'etsy' in the allowed values
*/

-- Update CHECK constraint on project_products.source
ALTER TABLE project_products DROP CONSTRAINT IF EXISTS project_products_source_check;
ALTER TABLE project_products ADD CONSTRAINT project_products_source_check 
  CHECK (source IN ('amazon', 'etsy'));

-- Update CHECK constraint on liked_products.source
ALTER TABLE liked_products DROP CONSTRAINT IF EXISTS liked_products_source_check;
ALTER TABLE liked_products ADD CONSTRAINT liked_products_source_check 
  CHECK (source IN ('amazon', 'etsy'));