/*
  # Add API usage tracking

  1. New Tables
    - `api_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `api_name` (text) - 'amazon' or 'etsy'
      - `call_count` (integer) - Number of API calls made in the current month
      - `monthly_limit` (integer) - Monthly limit for API calls
      - `last_reset_date` (date) - Date when the call count was last reset
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on api_usage table
    - Add policies for authenticated users to manage their own API usage records
*/

-- Create api_usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_name text NOT NULL CHECK (api_name IN ('amazon', 'etsy')),
  call_count integer NOT NULL DEFAULT 0,
  monthly_limit integer NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for api_usage table
CREATE POLICY "Users can view their own API usage"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API usage records"
  ON api_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API usage records"
  ON api_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage(api_name);

-- Add unique constraint to prevent duplicate records per user/API
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_usage_unique 
ON api_usage(user_id, api_name);

-- Create updated_at trigger for api_usage
DROP TRIGGER IF EXISTS update_api_usage_updated_at ON api_usage;
CREATE TRIGGER update_api_usage_updated_at
  BEFORE UPDATE ON api_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();