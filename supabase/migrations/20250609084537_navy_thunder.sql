/*
  # Add liked products functionality

  1. New Tables
    - `liked_products`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project_id` (uuid, references projects)
      - `asin` (text) - Amazon product identifier
      - `title` (text)
      - `price` (numeric)
      - `currency` (text)
      - `rating` (numeric)
      - `reviews_count` (integer)
      - `image` (text)
      - `url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on liked_products table
    - Add policies for authenticated users to manage their own liked products
*/

-- Create liked_products table
CREATE TABLE IF NOT EXISTS liked_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
ALTER TABLE liked_products ENABLE ROW LEVEL SECURITY;

-- Create policies for liked_products table
CREATE POLICY "Users can view their own liked products"
  ON liked_products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own liked products"
  ON liked_products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liked products"
  ON liked_products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked products"
  ON liked_products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_liked_products_user_id ON liked_products(user_id);
CREATE INDEX IF NOT EXISTS idx_liked_products_project_id ON liked_products(project_id);
CREATE INDEX IF NOT EXISTS idx_liked_products_asin ON liked_products(asin);
CREATE INDEX IF NOT EXISTS idx_liked_products_created_at ON liked_products(created_at DESC);

-- Add unique constraint to prevent duplicate likes per user/project/product
CREATE UNIQUE INDEX IF NOT EXISTS idx_liked_products_unique 
ON liked_products(user_id, project_id, asin);