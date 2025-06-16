import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StripeService, StripeSubscription } from '../services/stripeService';
import { SUBSCRIPTION_TIERS } from '../stripe-config';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscription: StripeSubscription;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  limits: {
    projects: number;
    apiCalls: number;
    visionBoards: number;
    etsyCalls: number;
  };
  features: string[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<StripeSubscription>({
    status: 'inactive',
    tier: 'free'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!isAuthenticated) {
      setSubscription({ status: 'inactive', tier: 'free' });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const subscriptionData = await StripeService.getUserSubscription();
      setSubscription(subscriptionData);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message || 'Failed to fetch subscription');
      // Default to free tier on error
      setSubscription({ status: 'inactive', tier: 'free' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isAuthenticated]);

  // Calculate limits based on subscription tier
  const limits = {
    projects: SUBSCRIPTION_TIERS[subscription.tier]?.limits.projects || 4,
    apiCalls: SUBSCRIPTION_TIERS[subscription.tier]?.limits.apiCalls || 40,
    visionBoards: SUBSCRIPTION_TIERS[subscription.tier]?.limits.visionBoards || 1,
    etsyCalls: subscription.tier === 'free' ? 25 : subscription.tier === 'pro' ? 125 : 750
  };

  // Get features for the current tier
  const features = SUBSCRIPTION_TIERS[subscription.tier]?.features || [];

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    refreshSubscription: fetchSubscription,
    limits,
    features
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};