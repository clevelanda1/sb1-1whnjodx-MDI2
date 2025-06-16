/*
  # Add creator_subscription_tier to shared_vision_boards table

  1. Changes
    - Add `creator_subscription_tier` column to `shared_vision_boards` table
    - This column will store the subscription tier of the user who created the shared board
    - Used to determine whether to show branding on shared vision boards

  2. Security
    - No changes to RLS policies needed
*/

-- Add creator_subscription_tier column to shared_vision_boards table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shared_vision_boards' AND column_name = 'creator_subscription_tier'
  ) THEN
    ALTER TABLE shared_vision_boards ADD COLUMN creator_subscription_tier text;
  END IF;
END $$;

-- Update existing records to have 'free' as creator_subscription_tier (for backward compatibility)
UPDATE shared_vision_boards SET creator_subscription_tier = 'free' WHERE creator_subscription_tier IS NULL;

-- Add index for faster queries on creator_subscription_tier
CREATE INDEX IF NOT EXISTS idx_shared_vision_boards_creator_tier ON shared_vision_boards(creator_subscription_tier);