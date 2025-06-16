/*
  # Create project_products table for storing Amazon product data

  1. New Tables
    - `project_products`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `asin` (text) - Amazon Standard Identification Number
      - `title` (text)
      - `price` (numeric)
      - `currency` (text)
      - `rating` (numeric)
      - `reviews_count` (integer)
      - `image` (text) - URL to product image
      - `url` (text) - URL to product on Amazon
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on project_products table
    - Add policies for authenticated users to access products for their own projects
*/

-- Create project_products table
CREATE TABLE IF NOT EXISTS project_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  asin text NOT NULL,
  title text NOT NULL,
  price numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  image text,
  url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE project_products ENABLE ROW LEVEL SECURITY;

-- Create policies for project_products table
CREATE POLICY "Users can view products of their own projects"
  ON project_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_products.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create products for their own projects"
  ON project_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_products.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update products of their own projects"
  ON project_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_products.project_id 
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_products.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products of their own projects"
  ON project_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_products.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_products_project_id ON project_products(project_id);
CREATE INDEX IF NOT EXISTS idx_project_products_asin ON project_products(asin);
CREATE INDEX IF NOT EXISTS idx_project_products_created_at ON project_products(created_at DESC);

-- Add unique constraint to prevent duplicate products per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_products_unique 
ON project_products(project_id, asin);