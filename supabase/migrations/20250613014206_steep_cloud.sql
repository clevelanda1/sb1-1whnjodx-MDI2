/*
  # Create subscription tier functions

  1. New Functions
    - `get_subscription_tier()` - Returns the subscription tier for the authenticated user
    - `get_user_subscription_info()` - Returns detailed subscription information

  2. Security
    - Functions are accessible to authenticated users only
    - Users can only access their own subscription information
*/

-- Function to get subscription tier for the authenticated user
CREATE OR REPLACE FUNCTION public.get_subscription_tier()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- For now, return 'free' as default since we don't have a subscriptions table
  -- This can be updated later when subscription management is implemented
  SELECT 'free' INTO user_tier;
  
  RETURN COALESCE(user_tier, 'free');
END;
$$;

-- Function to get detailed subscription information
CREATE OR REPLACE FUNCTION public.get_user_subscription_info()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_info json;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Return default subscription info for free tier
  -- This can be updated later when subscription management is implemented
  SELECT json_build_object(
    'tier', 'free',
    'limits', json_build_object(
      'projects', 3,
      'apiCalls', json_build_object(
        'amazon', 100,
        'etsy', 100
      )
    ),
    'features', json_build_array(
      'Basic project creation',
      'Limited API calls',
      'Standard support'
    )
  ) INTO subscription_info;
  
  RETURN subscription_info;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_subscription_tier() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription_info() TO authenticated;