/*
  # Create combined API usage tracking table

  1. Verify existing tables
    - Verify amazon_api_usage table exists and has correct structure
    - Verify etsy_api_usage table exists and has correct structure

  2. New Table
    - `combined_api_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `amazon_total_count` (integer) - running total of Amazon API calls for the month
      - `etsy_total_count` (integer) - running total of Etsy API calls for the month
      - `combined_total_count` (integer) - sum of both API calls for the month
      - `amazon_lifetime_total` (integer) - lifetime total of Amazon API calls
      - `etsy_lifetime_total` (integer) - lifetime total of Etsy API calls
      - `combined_lifetime_total` (integer) - lifetime total of all API calls
      - `last_reset_date` (date) - when the counters were last reset
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Functions
    - `reset_combined_api_usage_monthly()` - Resets monthly counters at the beginning of each month
    - `increment_combined_api_usage(api_name)` - Increments usage count for specified API

  4. Security
    - Enable RLS on combined_api_usage table
    - Add policies for authenticated users to manage their own API usage records
*/

-- Verify amazon_api_usage table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'amazon_api_usage') THEN
    RAISE EXCEPTION 'amazon_api_usage table does not exist';
  END IF;
END $$;

-- Verify etsy_api_usage table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'etsy_api_usage') THEN
    RAISE EXCEPTION 'etsy_api_usage table does not exist';
  END IF;
END $$;

-- Create combined_api_usage table
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

-- Add unique constraint to prevent duplicate records per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_combined_api_usage_unique 
ON combined_api_usage(user_id);

-- Create updated_at trigger for combined_api_usage
DROP TRIGGER IF EXISTS update_combined_api_usage_updated_at ON combined_api_usage;
CREATE TRIGGER update_combined_api_usage_updated_at
  BEFORE UPDATE ON combined_api_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to reset combined API usage counters monthly
CREATE OR REPLACE FUNCTION reset_combined_api_usage_monthly()
RETURNS void AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  current_month INTEGER := EXTRACT(MONTH FROM current_date_val);
  current_year INTEGER := EXTRACT(YEAR FROM current_date_val);
BEGIN
  -- Reset counters for users whose last reset was in a different month
  UPDATE combined_api_usage
  SET 
    amazon_total_count = 0,
    etsy_total_count = 0,
    combined_total_count = 0,
    last_reset_date = current_date_val
  WHERE 
    EXTRACT(MONTH FROM last_reset_date) <> current_month OR
    EXTRACT(YEAR FROM last_reset_date) <> current_year;
    
  RAISE NOTICE 'Reset combined API usage counters for users with outdated reset dates';
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment combined API usage count
CREATE OR REPLACE FUNCTION increment_combined_api_usage(api_name TEXT, user_id_param UUID)
RETURNS void AS $$
DECLARE
  user_record RECORD;
  current_date_val DATE := CURRENT_DATE;
  current_month INTEGER := EXTRACT(MONTH FROM current_date_val);
  current_year INTEGER := EXTRACT(YEAR FROM current_date_val);
BEGIN
  -- First check if we need to reset counters
  PERFORM reset_combined_api_usage_monthly();
  
  -- Check if user record exists
  SELECT * INTO user_record FROM combined_api_usage WHERE user_id = user_id_param;
  
  IF NOT FOUND THEN
    -- Create new record for user
    INSERT INTO combined_api_usage (
      user_id, 
      amazon_total_count, 
      etsy_total_count, 
      combined_total_count,
      amazon_lifetime_total,
      etsy_lifetime_total,
      combined_lifetime_total,
      last_reset_date
    ) VALUES (
      user_id_param, 
      CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
      CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
      1,
      CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
      CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
      1,
      current_date_val
    );
  ELSE
    -- Check if we need to reset monthly counters
    IF EXTRACT(MONTH FROM user_record.last_reset_date) <> current_month OR
       EXTRACT(YEAR FROM user_record.last_reset_date) <> current_year THEN
      
      -- Reset monthly counters but keep lifetime totals
      UPDATE combined_api_usage
      SET 
        amazon_total_count = CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
        etsy_total_count = CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
        combined_total_count = 1,
        amazon_lifetime_total = amazon_lifetime_total + CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
        etsy_lifetime_total = etsy_lifetime_total + CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
        combined_lifetime_total = combined_lifetime_total + 1,
        last_reset_date = current_date_val
      WHERE user_id = user_id_param;
    ELSE
      -- Increment the appropriate counter
      UPDATE combined_api_usage
      SET 
        amazon_total_count = amazon_total_count + CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
        etsy_total_count = etsy_total_count + CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
        combined_total_count = combined_total_count + 1,
        amazon_lifetime_total = amazon_lifetime_total + CASE WHEN api_name = 'amazon' THEN 1 ELSE 0 END,
        etsy_lifetime_total = etsy_lifetime_total + CASE WHEN api_name = 'etsy' THEN 1 ELSE 0 END,
        combined_lifetime_total = combined_lifetime_total + 1
      WHERE user_id = user_id_param;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if a user has exceeded their API usage limit
CREATE OR REPLACE FUNCTION check_api_usage_limit(api_name TEXT, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  global_limit INTEGER;
BEGIN
  -- Get user's current usage
  SELECT * INTO user_record FROM combined_api_usage WHERE user_id = user_id_param;
  
  -- If no record exists, user hasn't used any API calls yet
  IF NOT FOUND THEN
    RETURN TRUE; -- Allow the call
  END IF;
  
  -- Get global limit for the specified API
  IF api_name = 'amazon' THEN
    SELECT monthly_limit INTO global_limit FROM amazon_api_usage LIMIT 1;
  ELSIF api_name = 'etsy' THEN
    SELECT monthly_limit INTO global_limit FROM etsy_api_usage LIMIT 1;
  ELSE
    RETURN FALSE; -- Unknown API
  END IF;
  
  -- Check if global limit is set to 0 (unlimited)
  IF global_limit = 0 THEN
    RETURN TRUE; -- Allow the call
  END IF;
  
  -- Check if user has exceeded the limit
  IF api_name = 'amazon' AND user_record.amazon_total_count >= global_limit THEN
    RETURN FALSE; -- Limit exceeded
  ELSIF api_name = 'etsy' AND user_record.etsy_total_count >= global_limit THEN
    RETURN FALSE; -- Limit exceeded
  END IF;
  
  RETURN TRUE; -- Allow the call
END;
$$ LANGUAGE plpgsql;