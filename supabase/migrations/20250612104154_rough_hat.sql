/*
  # Fix API usage functions with SECURITY DEFINER

  1. Changes
    - Modify `increment_api_usage` function to use SECURITY DEFINER
    - Modify `check_api_usage_limit` function to use SECURITY DEFINER
    - Modify `increment_combined_api_usage` function to use SECURITY DEFINER
    - Grant EXECUTE permission on these functions to authenticated users
    - These changes allow authenticated users to call these functions
      even though they don't have direct UPDATE permissions on the
      amazon_api_usage and etsy_api_usage tables

  2. Security
    - Functions will run with the privileges of the function creator
    - This allows the functions to bypass RLS policies while still
      maintaining security through controlled function interfaces
*/

-- Recreate increment_api_usage function with SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate check_api_usage_limit function with SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate increment_combined_api_usage function with SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE permission on these functions to authenticated users
GRANT EXECUTE ON FUNCTION increment_api_usage(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_api_usage_limit(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_combined_api_usage(TEXT, UUID) TO authenticated;