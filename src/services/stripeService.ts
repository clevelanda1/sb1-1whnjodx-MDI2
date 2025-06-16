import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

export interface StripeCheckoutOptions {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  mode: 'subscription';
}

export interface StripeSubscription {
  status: string;
  tier: 'free' | 'pro' | 'studio';
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  paymentMethod?: {
    brand?: string;
    last4?: string;
  };
}

export class StripeService {
  /**
   * Create a checkout session for a product
   */
  static async createCheckoutSession(options: StripeCheckoutOptions): Promise<{ url: string }> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          price_id: options.priceId,
          success_url: options.successUrl,
          cancel_url: options.cancelUrl,
          mode: options.mode
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL returned');
      }
      
      return { url };
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  }

  /**
   * Get the current user's subscription status
   */
  static async getUserSubscription(): Promise<StripeSubscription> {
    try {
      // Get subscription data from the view
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching subscription:', error);
        return { status: 'inactive', tier: 'free' };
      }
      
      if (!data || !data.subscription_id) {
        return { status: 'inactive', tier: 'free' };
      }
      
      // Determine tier based on price_id
      let tier: 'free' | 'pro' | 'studio' = 'free';
      
      // Check both monthly and yearly price IDs
      if (data.price_id === STRIPE_PRODUCTS.pro.priceId || 
          data.price_id === STRIPE_PRODUCTS.proYearly.priceId) {
        tier = 'pro';
      } else if (data.price_id === STRIPE_PRODUCTS.studio.priceId || 
                 data.price_id === STRIPE_PRODUCTS.studioYearly.priceId) {
        tier = 'studio';
      }
      
      // Only consider active or trialing subscriptions as valid
      const isValidSubscription = ['active', 'trialing'].includes(data.subscription_status);
      
      return {
        status: data.subscription_status,
        tier: isValidSubscription ? tier : 'free',
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
        paymentMethod: {
          brand: data.payment_method_brand,
          last4: data.payment_method_last4
        }
      };
    } catch (error: any) {
      console.error('Error getting user subscription:', error);
      return { status: 'error', tier: 'free' };
    }
  }

  /**
   * Get the customer portal URL for managing subscriptions
   */
  static async getCustomerPortalUrl(returnUrl: string): Promise<string> {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          return_url: returnUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer portal session');
      }
      
      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No customer portal URL returned');
      }
      
      return url;
    } catch (error: any) {
      console.error('Error getting customer portal URL:', error);
      // Fallback to account page if portal creation fails
      return returnUrl;
    }
  }
}