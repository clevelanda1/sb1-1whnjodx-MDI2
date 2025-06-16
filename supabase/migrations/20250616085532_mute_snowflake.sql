/*
  # Update Etsy API limits for subscription tiers

  1. Changes
    - Update the features list in SUBSCRIPTION_TIERS to reflect new Etsy API limits
    - Free tier: 25 Etsy searches/month (down from 40)
    - Pro tier: 125 Etsy searches/month (down from 200)
    - Studio tier: 750 Etsy searches/month (down from 1,200)

  2. Database Updates
    - No direct database schema changes needed
    - The limits are enforced in application code via the subscription context
*/

-- This migration doesn't require any direct database changes
-- The API limits are enforced in the application code through the subscription context
-- and the stripe-config.ts file which has been updated separately

-- For documentation purposes, here are the new limits:
-- Free tier: 25 Etsy searches/month (down from 40)
-- Pro tier: 125 Etsy searches/month (down from 200)
-- Studio tier: 750 Etsy searches/month (down from 1,200)

-- The actual implementation of these limits is handled by:
-- 1. The SUBSCRIPTION_TIERS object in src/stripe-config.ts
-- 2. The useSubscription hook in src/contexts/SubscriptionContext.tsx
-- 3. The ApiUsageService in src/services/apiUsageService.ts