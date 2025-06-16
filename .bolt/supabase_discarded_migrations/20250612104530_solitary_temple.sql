/*
  # Insert initial records into API usage tables

  1. Changes
    - Insert initial record into amazon_api_usage table with monthly limit of 10000
    - Insert initial record into etsy_api_usage table with monthly limit of 2800
    - Update policies to allow authenticated users to view API usage

  2. Security
    - Update policies to allow all authenticated users to view API usage
    - Service role can update API usage
*/

-- Insert initial record for Amazon API usage if it doesn't exist
INSERT INTO amazon_api_usage (total_count, monthly_limit, subscription_start_date, last_reset_date)
VALUES (0, 10000, '2025-06-11', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert initial record for Etsy API usage if it doesn't exist
INSERT INTO etsy_api_usage (total_count, monthly_limit, subscription_start_date, last_reset_date)
VALUES (0, 2800, '2025-06-12', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view amazon API usage" ON amazon_api_usage;
DROP POLICY IF EXISTS "Admins can update amazon API usage" ON amazon_api_usage;
DROP POLICY IF EXISTS "Admins can view etsy API usage" ON etsy_api_usage;
DROP POLICY IF EXISTS "Admins can update etsy API usage" ON etsy_api_usage;

-- Create new policies for amazon_api_usage table
CREATE POLICY "Authenticated users can view amazon API usage"
  ON amazon_api_usage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can update amazon API usage"
  ON amazon_api_usage
  FOR UPDATE
  TO service_role
  USING (true);

-- Create new policies for etsy_api_usage table
CREATE POLICY "Authenticated users can view etsy API usage"
  ON etsy_api_usage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can update etsy API usage"
  ON etsy_api_usage
  FOR UPDATE
  TO service_role
  USING (true);

-- Create combined_api_usage table for per-user tracking
CREATE TABLE IF NOT EXISTS combined_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amazon_total_count integer NOT NULL DEFAULT 0,
  etsy_total_count integer NOT NULL DEFAULT 0,
  combined_total_count integer NOT NULL DEFAULT 0,
  amazon_lifetime_total integer NOT NULL DEFAULT 0,
  etsy_lifetime_total integer NOT NULL DEFAULT 0,
  combined_lifetime_total integer NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE combined_api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for combined_api_usage table
CREATE POLICY "Users can view their own combined API usage"
  ON combined_api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own combined API usage records"
  ON combined_api_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own combined API usage records"
  ON combined_api_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_combined_api_usage_user_id ON combined_api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_combined_api_usage_last_reset_date ON combined_api_usage(last_reset_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_combined_api_usage_unique ON combined_api_usage(user_id);

-- Create updated_at trigger for combined_api_usage
CREATE TRIGGER update_combined_api_usage_updated_at
  BEFORE UPDATE ON combined_api_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();