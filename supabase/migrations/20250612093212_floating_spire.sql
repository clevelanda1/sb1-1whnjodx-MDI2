/*
  # Create API usage tracking tables

  1. New Tables
    - `amazon_api_usage`
      - `id` (uuid, primary key)
      - `total_count` (integer) - running total of API calls
      - `monthly_limit` (integer) - manually set monthly limit
      - `subscription_start_date` (date) - when Amazon API subscription began
      - `last_reset_date` (date) - when the counter was last reset
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `etsy_api_usage`
      - `id` (uuid, primary key)
      - `total_count` (integer) - running total of API calls
      - `monthly_limit` (integer) - manually set monthly limit
      - `subscription_start_date` (date) - when Etsy API subscription began
      - `last_reset_date` (date) - when the counter was last reset
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Functions
    - `reset_api_usage_monthly()` - Resets counters at the beginning of each month
    - `increment_api_usage(api_name)` - Increments usage count for specified API

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view and update API usage
*/

-- Create amazon_api_usage table
CREATE TABLE IF NOT EXISTS amazon_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_count integer NOT NULL DEFAULT 0,
  monthly_limit integer NOT NULL DEFAULT 0,
  subscription_start_date date NOT NULL DEFAULT '2025-06-11',
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create etsy_api_usage table
CREATE TABLE IF NOT EXISTS etsy_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_count integer NOT NULL DEFAULT 0,
  monthly_limit integer NOT NULL DEFAULT 0,
  subscription_start_date date NOT NULL DEFAULT '2025-06-12',
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE amazon_api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE etsy_api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for amazon_api_usage table
CREATE POLICY "Admins can view amazon API usage"
  ON amazon_api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() = auth.uid() -- This will be replaced with actual admin check in production
  ));

CREATE POLICY "Admins can update amazon API usage"
  ON amazon_api_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() = auth.uid() -- This will be replaced with actual admin check in production
  ));

-- Create policies for etsy_api_usage table
CREATE POLICY "Admins can view etsy API usage"
  ON etsy_api_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() = auth.uid() -- This will be replaced with actual admin check in production
  ));

CREATE POLICY "Admins can update etsy API usage"
  ON etsy_api_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() FROM auth.users 
    WHERE auth.uid() = auth.uid() -- This will be replaced with actual admin check in production
  ));

-- Create updated_at triggers
CREATE TRIGGER update_amazon_api_usage_updated_at
  BEFORE UPDATE ON amazon_api_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_etsy_api_usage_updated_at
  BEFORE UPDATE ON etsy_api_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial records
INSERT INTO amazon_api_usage (total_count, monthly_limit, subscription_start_date, last_reset_date)
VALUES (0, 0, '2025-06-11', CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO etsy_api_usage (total_count, monthly_limit, subscription_start_date, last_reset_date)
VALUES (0, 0, '2025-06-12', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Create function to reset API usage counters monthly
CREATE OR REPLACE FUNCTION reset_api_usage_monthly()
RETURNS void AS $$
DECLARE
  amazon_record RECORD;
  etsy_record RECORD;
  current_date_val DATE := CURRENT_DATE;
  amazon_reset_day INTEGER;
  etsy_reset_day INTEGER;
  amazon_last_month INTEGER;
  amazon_current_month INTEGER;
  etsy_last_month INTEGER;
  etsy_current_month INTEGER;
BEGIN
  -- Get Amazon API usage record
  SELECT * INTO amazon_record FROM amazon_api_usage LIMIT 1;
  
  -- Get Etsy API usage record
  SELECT * INTO etsy_record FROM etsy_api_usage LIMIT 1;
  
  -- Calculate reset days (day of month from subscription start date)
  amazon_reset_day := EXTRACT(DAY FROM amazon_record.subscription_start_date);
  etsy_reset_day := EXTRACT(DAY FROM etsy_record.subscription_start_date);
  
  -- Get months for comparison
  amazon_last_month := EXTRACT(MONTH FROM amazon_record.last_reset_date);
  amazon_current_month := EXTRACT(MONTH FROM current_date_val);
  etsy_last_month := EXTRACT(MONTH FROM etsy_record.last_reset_date);
  etsy_current_month := EXTRACT(MONTH FROM current_date_val);
  
  -- Reset Amazon counter if it's a new month and we're on or past the reset day
  IF (amazon_last_month <> amazon_current_month AND 
      EXTRACT(DAY FROM current_date_val) >= amazon_reset_day) OR
     (amazon_last_month = amazon_current_month AND 
      EXTRACT(DAY FROM current_date_val) >= amazon_reset_day AND
      EXTRACT(DAY FROM amazon_record.last_reset_date) < amazon_reset_day) THEN
    
    UPDATE amazon_api_usage 
    SET total_count = 0, 
        last_reset_date = current_date_val;
    
    RAISE NOTICE 'Reset Amazon API usage counter';
  END IF;
  
  -- Reset Etsy counter if it's a new month and we're on or past the reset day
  IF (etsy_last_month <> etsy_current_month AND 
      EXTRACT(DAY FROM current_date_val) >= etsy_reset_day) OR
     (etsy_last_month = etsy_current_month AND 
      EXTRACT(DAY FROM current_date_val) >= etsy_reset_day AND
      EXTRACT(DAY FROM etsy_record.last_reset_date) < etsy_reset_day) THEN
    
    UPDATE etsy_api_usage 
    SET total_count = 0, 
        last_reset_date = current_date_val;
    
    RAISE NOTICE 'Reset Etsy API usage counter';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function to increment API usage count
CREATE OR REPLACE FUNCTION increment_api_usage(api_name TEXT)
RETURNS void AS $$
BEGIN
  -- First check if we need to reset counters
  PERFORM reset_api_usage_monthly();
  
  -- Then increment the appropriate counter
  IF api_name = 'amazon' THEN
    UPDATE amazon_api_usage SET total_count = total_count + 1;
  ELSIF api_name = 'etsy' THEN
    UPDATE etsy_api_usage SET total_count = total_count + 1;
  END IF;
END;
$$ LANGUAGE plpgsql;