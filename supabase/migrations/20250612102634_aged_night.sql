/*
  # Fix API usage table permissions

  1. Security Updates
    - Update RLS policies for amazon_api_usage table to allow proper access
    - Update RLS policies for etsy_api_usage table to allow proper access
    - Fix the overly restrictive policies that were causing permission denied errors

  2. Changes Made
    - Replace the circular uid() = uid() policies with proper access control
    - Allow authenticated users to read global API usage data
    - Maintain security by only allowing admins to update the data
*/

-- Drop existing problematic policies for amazon_api_usage
DROP POLICY IF EXISTS "Admins can view amazon API usage" ON amazon_api_usage;
DROP POLICY IF EXISTS "Admins can update amazon API usage" ON amazon_api_usage;

-- Create new policies for amazon_api_usage
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

-- Drop existing problematic policies for etsy_api_usage
DROP POLICY IF EXISTS "Admins can view etsy API usage" ON etsy_api_usage;
DROP POLICY IF EXISTS "Admins can update etsy API usage" ON etsy_api_usage;

-- Create new policies for etsy_api_usage
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