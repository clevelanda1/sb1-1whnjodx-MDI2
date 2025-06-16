import { supabase } from '../lib/supabase';

export interface ApiUsage {
  id: string;
  user_id: string;
  amazon_total_count: number;
  etsy_total_count: number;
  combined_total_count: number;
  amazon_lifetime_total: number;
  etsy_lifetime_total: number;
  combined_lifetime_total: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface GlobalApiLimits {
  amazon: {
    total_count: number;
    monthly_limit: number;
    subscription_start_date: string;
    last_reset_date: string;
  };
  etsy: {
    total_count: number;
    monthly_limit: number;
    subscription_start_date: string;
    last_reset_date: string;
  };
}

export class ApiUsageService {
  // Helper method to check authentication
  private static async ensureAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        throw new Error('Authentication error. Please sign in again.');
      }
      
      if (!session?.user) {
        throw new Error('User not authenticated. Please sign in.');
      }
      
      return session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      throw new Error('Authentication check failed. Please sign in again.');
    }
  }

  /**
   * Increment the API usage count for the specified API
   * @param apiName The API name ('amazon' or 'etsy')
   * @returns True if the increment was successful, false if the user has exceeded their limit
   */
  static async incrementApiUsage(apiName: 'amazon' | 'etsy'): Promise<boolean> {
    try {
      const session = await this.ensureAuthenticated();
      const userId = session.user.id;

      // First, check if the user has exceeded their limit
      const { data: limitCheck, error: limitCheckError } = await supabase.rpc(
        'check_api_usage_limit',
        { api_name: apiName, user_id_param: userId }
      );

      if (limitCheckError) {
        console.error('Error checking API usage limit:', limitCheckError);
        return true; // Allow the call if we can't check the limit
      }

      if (!limitCheck) {
        console.warn(`User ${userId} has exceeded their ${apiName} API usage limit`);
        return false; // User has exceeded their limit
      }

      // Increment the global API usage counter
      const { error: globalIncrementError } = await supabase.rpc(
        'increment_api_usage',
        { api_name: apiName }
      );

      if (globalIncrementError) {
        console.error('Error incrementing global API usage:', globalIncrementError);
        // Continue even if global increment fails
      }

      // Increment the user's API usage counter
      const { error: userIncrementError } = await supabase.rpc(
        'increment_combined_api_usage',
        { api_name: apiName, user_id_param: userId }
      );

      if (userIncrementError) {
        console.error('Error incrementing user API usage:', userIncrementError);
        // Continue even if user increment fails
      }

      return true; // Successfully incremented
    } catch (error) {
      console.error('Error in incrementApiUsage:', error);
      return true; // Allow the call if we can't increment the counter
    }
  }

  /**
   * Get the current API usage for the current user
   */
  static async getUserApiUsage(): Promise<ApiUsage | null> {
    try {
      const session = await this.ensureAuthenticated();
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('combined_api_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No usage record found
        }
        console.error('Error fetching user API usage:', error);
        throw new Error(`Failed to fetch API usage: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getUserApiUsage:', error);
      throw new Error(error.message || 'Failed to fetch API usage');
    }
  }

  /**
   * Get the global API limits and usage
   */
  static async getGlobalApiLimits(): Promise<GlobalApiLimits> {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get Amazon API usage
      const { data: amazonData, error: amazonError } = await supabase
        .from('amazon_api_usage')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (amazonError) {
        console.error('Error fetching Amazon API usage:', amazonError);
        throw new Error(`Failed to fetch Amazon API usage: ${amazonError.message}`);
      }

      // Get Etsy API usage
      const { data: etsyData, error: etsyError } = await supabase
        .from('etsy_api_usage')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (etsyError) {
        console.error('Error fetching Etsy API usage:', etsyError);
        throw new Error(`Failed to fetch Etsy API usage: ${etsyError.message}`);
      }

      return {
        amazon: {
          total_count: amazonData?.total_count || 0,
          monthly_limit: amazonData?.monthly_limit || 0,
          subscription_start_date: amazonData?.subscription_start_date || currentDate,
          last_reset_date: amazonData?.last_reset_date || currentDate
        },
        etsy: {
          total_count: etsyData?.total_count || 0,
          monthly_limit: etsyData?.monthly_limit || 0,
          subscription_start_date: etsyData?.subscription_start_date || currentDate,
          last_reset_date: etsyData?.last_reset_date || currentDate
        }
      };
    } catch (error: any) {
      console.error('Error in getGlobalApiLimits:', error);
      throw new Error(error.message || 'Failed to fetch global API limits');
    }
  }

  /**
   * Update the monthly limit for a specific API
   * @param apiName The API name ('amazon' or 'etsy')
   * @param monthlyLimit The new monthly limit
   */
  static async updateMonthlyLimit(apiName: 'amazon' | 'etsy', monthlyLimit: number): Promise<void> {
    try {
      await this.ensureAuthenticated();

      const tableName = `${apiName}_api_usage`;
      
      const { error } = await supabase
        .from(tableName)
        .update({ monthly_limit: monthlyLimit })
        .eq('id', (await supabase.from(tableName).select('id').single()).data?.id);

      if (error) {
        console.error(`Error updating ${apiName} monthly limit:`, error);
        throw new Error(`Failed to update ${apiName} monthly limit: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in updateMonthlyLimit:', error);
      throw new Error(error.message || `Failed to update ${apiName} monthly limit`);
    }
  }

  /**
   * Check if the user has exceeded their API usage limit
   * @param apiName The API name ('amazon' or 'etsy')
   * @returns True if the user has not exceeded their limit, false otherwise
   */
  static async checkApiUsageLimit(apiName: 'amazon' | 'etsy'): Promise<boolean> {
    try {
      const session = await this.ensureAuthenticated();
      const userId = session.user.id;

      const { data, error } = await supabase.rpc(
        'check_api_usage_limit',
        { api_name: apiName, user_id_param: userId }
      );

      if (error) {
        console.error('Error checking API usage limit:', error);
        return true; // Allow the call if we can't check the limit
      }

      return data;
    } catch (error) {
      console.error('Error in checkApiUsageLimit:', error);
      return true; // Allow the call if we can't check the limit
    }
  }
}