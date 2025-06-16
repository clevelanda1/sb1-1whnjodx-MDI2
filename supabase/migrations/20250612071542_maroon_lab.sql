/*
  # Update source column in project_products and liked_products tables

  1. Changes
    - Update CHECK constraint on source column in project_products table to include 'etsy'
    - Update CHECK constraint on source column in liked_products table to include 'etsy'

  2. Security
    - No changes to RLS policies needed
*/

-- Update CHECK constraint on project_products.source
ALTER TABLE project_products DROP CONSTRAINT IF EXISTS project_products_source_check;
ALTER TABLE project_products ADD CONSTRAINT project_products_source_check 
  CHECK (source IN ('amazon', 'wayfair', 'etsy'));

-- Update CHECK constraint on liked_products.source
ALTER TABLE liked_products DROP CONSTRAINT IF EXISTS liked_products_source_check;
ALTER TABLE liked_products ADD CONSTRAINT liked_products_source_check 
  CHECK (source IN ('amazon', 'wayfair', 'etsy'));