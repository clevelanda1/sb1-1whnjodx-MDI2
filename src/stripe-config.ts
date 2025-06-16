// Stripe product configuration
export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription';
}

// Define the products available for purchase
export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  pro: {
    priceId: 'price_1RaBGpPTeQKREzCAPRFjvCuT',
    name: 'Pro Monthly',
    description: 'Everything you need to bring your vision to life',
    mode: 'subscription'
  },
  proYearly: {
    priceId: 'price_1RaBOIPTeQKREzCAkf4yjm6x',
    name: 'Pro Annual',
    description: 'A full year of unlimited creativity',
    mode: 'subscription'
  },
  studio: {
    priceId: 'price_1RaH9rPTeQKREzCApmos4maX',
    name: 'Studio Monthly',
    description: 'Built for teams that create without compromise',
    mode: 'subscription'
  },
  studioYearly: {
    priceId: 'price_1RaBRkPTeQKREzCAyhIL2vW7',
    name: 'Studio Annual',
    description: 'The complete creative toolkit for ambitious teams',
    mode: 'subscription'
  }
};

// Subscription tiers and their features
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    limits: {
      projects: 4,
      apiCalls: 40,
      visionBoards: 1
    },
    features: [
      'AI Image analysis',
      '4 active projects',
      '40 Amazon searches/month',
      '25 Etsy searches/month',
      '1 active vision board'
    ]
  },
  pro: {
    name: 'Pro',
    limits: {
      projects: 25,
      apiCalls: 200,
      visionBoards: 12
    },
    features: [
      'Everything in Free',
      '25 active projects',
      '200 Amazon searches/month',
      '125 Etsy searches/month',
      '12 active vision boards',
      'Vision board sharing',
      'Ad-free experience'
    ]
  },
  studio: {
    name: 'Studio',
    limits: {
      projects: Infinity,
      apiCalls: 1200,
      visionBoards: Infinity
    },
    features: [
      'Everything in Pro',
      'Unlimited projects',
      '1,200 monthly Amazon search credits',
      '750 monthly Etsy search credits',
      'Unlimited vision boards',
      'White label branding'
    ]
  }
};