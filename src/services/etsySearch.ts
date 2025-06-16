import axios from 'axios';
import { ApiUsageService } from './apiUsageService';

const RAPIDAPI_KEY_ETSY = import.meta.env.VITE_RAPIDAPI_KEY_ETSY;
const RAPIDAPI_HOST = 'etsy-api2.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface EtsySearchParams {
  query: string;
  page?: number;
}

export interface EtsyProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  listingId: string; // Using listing_id as unique identifier
  source: 'etsy';
}

interface EtsyAPIResponse {
  response?: Record<string, any>;
  results?: any[];
  count?: number;
  // Handle various possible response formats
  [key: string]: any;
}

class EtsySearchService {
  private readonly headers = {
    'X-RapidAPI-Key': RAPIDAPI_KEY_ETSY,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };

  private readonly defaultParams: Partial<EtsySearchParams> = {
    page: 1,
  };

  // Rate limiting properties
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly maxConcurrentRequests = 1;
  private readonly requestDelay = 2500;

  // Retry configuration
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000;

  // Track API availability to avoid repeated failed requests
  private isApiAvailable = true;
  private lastApiCheck = 0;
  private readonly apiCheckInterval = 300000; // 5 minutes

  // Check if API key is configured
  private checkApiKey(): void {
    if (!RAPIDAPI_KEY_ETSY || RAPIDAPI_KEY_ETSY === 'your_rapidapi_key_here') {
      console.error('❌ Etsy API key not configured properly');
      throw new Error('Etsy RapidAPI key is not configured. Please add VITE_RAPIDAPI_KEY_ETSY to your .env file.');
    }
    console.log('✅ Etsy API key is configured');
  }

  // Sleep utility for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced error handling for API responses
  private handleApiError(error: any, query?: string): Error {
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const responseData = error.response?.data;
    
    console.error('❌ Etsy API Error Details:', {
      status,
      statusText,
      responseData,
      query,
      url: error.config?.url,
      headers: error.config?.headers
    });

    switch (status) {
      case 401:
        this.isApiAvailable = false;
        return new Error('Etsy API authentication failed. Please check your RapidAPI key.');
      case 403:
        this.isApiAvailable = false;
        // Check if it's a subscription issue
        if (responseData?.message?.includes('not subscribed')) {
          return new Error('Etsy API subscription required. Please subscribe to the Etsy API on RapidAPI dashboard to enable Etsy product searches.');
        }
        return new Error('Etsy API access forbidden. Your RapidAPI key may be invalid, expired, or lack permissions for the Etsy API. Please verify your subscription and key in the RapidAPI dashboard.');
      case 429:
        return new Error('Etsy API rate limit exceeded. Please wait before making more requests.');
      case 500:
      case 502:
      case 503:
      case 504:
        return new Error('Etsy API server error. Please try again later.');
      default:
        return new Error(`Etsy API request failed with status ${status}: ${statusText || 'Unknown error'}`);
    }
  }

  // Check if we should skip API calls due to previous failures
  private shouldSkipApiCall(): boolean {
    const now = Date.now();
    
    // If API was marked as unavailable and it's been less than the check interval, skip
    if (!this.isApiAvailable && (now - this.lastApiCheck) < this.apiCheckInterval) {
      console.log('⏭️ Skipping Etsy API call due to previous authentication/subscription issues');
      return true;
    }
    
    // Reset availability check if enough time has passed
    if (!this.isApiAvailable && (now - this.lastApiCheck) >= this.apiCheckInterval) {
      console.log('🔄 Resetting Etsy API availability check');
      this.isApiAvailable = true;
      this.lastApiCheck = now;
    }
    
    return false;
  }

  // Retry mechanism with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Don't retry authentication/authorization errors (401, 403)
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      
      // Mark the time of the last API check for auth errors
      if (isAuthError) {
        this.lastApiCheck = Date.now();
      }
      
      const isRetryableError = 
        error.response?.status === 429 || // Rate limit
        error.response?.status >= 500 || // Server errors
        error.code === 'ECONNRESET' || // Network issues
        error.code === 'ETIMEDOUT';

      if (!isAuthError && isRetryableError && retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        console.log(`🔄 Retrying Etsy request in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.sleep(delay);
        return this.retryRequest(requestFn, retryCount + 1);
      }

      // Throw the enhanced error for better user feedback
      throw this.handleApiError(error);
    }
  }

  // Queue-based request processing to limit concurrency
  private async processRequestQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const batch = this.requestQueue.splice(0, this.maxConcurrentRequests);
      
      // Process batch concurrently
      await Promise.allSettled(batch.map(request => request()));
      
      // Wait before processing next batch
      if (this.requestQueue.length > 0) {
        console.log(`⏳ Etsy: Waiting ${this.requestDelay}ms before next batch...`);
        await this.sleep(this.requestDelay);
      }
    }
    
    this.isProcessingQueue = false;
  }

  // Add request to queue
  private queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      // Start processing queue if not already running
      this.processRequestQueue();
    });
  }

  // Test connection to Etsy API
  async testConnection(): Promise<boolean> {
    try {
      this.checkApiKey();
      
      // Skip if we know the API is unavailable
      if (this.shouldSkipApiCall()) {
        return false;
      }
      
      console.log('🧪 Testing Etsy API connection...');
      const response = await this.searchProducts({ query: 'test' });
      const isWorking = Array.isArray(response) && response.length >= 0;
      console.log(`🧪 Etsy API test result: ${isWorking ? '✅ Working' : '❌ Failed'}`);
      return isWorking;
    } catch (error) {
      console.error('❌ Etsy API connection test failed:', error);
      return false;
    }
  }

  // Search for products with a single query
  async searchProducts(params: EtsySearchParams): Promise<EtsyProduct[]> {
    this.checkApiKey();
    
    // Skip if we know the API is unavailable due to auth/subscription issues
    if (this.shouldSkipApiCall()) {
      console.log('⏭️ Skipping Etsy search due to API unavailability');
      return [];
    }
    
    // Check if the user has exceeded their API usage limit
    const canProceed = await ApiUsageService.checkApiUsageLimit('etsy');
    if (!canProceed) {
      console.warn('Etsy API usage limit exceeded. Skipping search.');
      return [];
    }
    
    const searchParams = { ...this.defaultParams, ...params };
    
    return this.queueRequest(async () => {
      return this.retryRequest(async () => {
        console.log('🔍 Searching Etsy via RapidAPI:', searchParams.query);
        
        // Increment API usage counter
        await ApiUsageService.incrementApiUsage('etsy');
        
        const response = await axios.get(`${BASE_URL}/product/search`, {
          headers: this.headers,
          params: {
            query: searchParams.query,
            page: searchParams.page || 1
          },
          timeout: 30000, // 30 seconds
        });

        console.log('📦 Etsy API response received for:', searchParams.query);
        
        // Log the response structure for debugging
        if (response.data) {
          console.log('📊 Etsy response structure:', Object.keys(response.data));
        }
        
        return this.processResults(response.data);
      });
    }).catch(error => {
      console.error('❌ Etsy search failed for query:', searchParams.query, error.message);
      
      // Return empty array instead of throwing to allow other searches to continue
      return [];
    });
  }

  // Search multiple queries with proper rate limiting
  async searchMultipleQueries(queries: string[]): Promise<EtsyProduct[]> {
    if (!queries.length) {
      console.log('⚠️ No Etsy queries provided');
      return [];
    }

    this.checkApiKey();
    
    // Skip if we know the API is unavailable due to auth/subscription issues
    if (this.shouldSkipApiCall()) {
      console.log('⏭️ Skipping all Etsy searches due to API unavailability (subscription/auth issues)');
      return [];
    }
    
    console.log(`🚀 Starting Etsy search with ${queries.length} queries:`, queries);

    try {
      // Create search promises for all queries
      const searchPromises = queries.map(query =>
        this.searchProducts({ query }).catch(error => {
          console.warn(`⚠️ Etsy search failed for query "${query}":`, error.message);
          return []; // Return empty array for failed searches
        })
      );

      // Wait for all searches to complete
      const results = await Promise.all(searchPromises);
      
      // Combine all successful results
      const allProducts: EtsyProduct[] = [];
      let successfulSearches = 0;
      
      results.forEach((products, index) => {
        if (Array.isArray(products) && products.length > 0) {
          allProducts.push(...products);
          successfulSearches++;
          console.log(`✅ Etsy query "${queries[index]}" returned ${products.length} products`);
        } else {
          console.log(`❌ Etsy query "${queries[index]}" returned no products`);
        }
      });

      console.log(`🎯 Etsy search completed: ${successfulSearches}/${queries.length} successful, ${allProducts.length} total products`);

      // Remove duplicates based on SKU
      const uniqueProducts = this.removeDuplicates(allProducts);
      
      // Limit total results to prevent overwhelming the UI
      const limitedProducts = uniqueProducts.slice(0, 500); // Limit Etsy to 500 products
      
      console.log(`📋 Returning ${limitedProducts.length} unique Etsy products`);
      return limitedProducts;

    } catch (error) {
      console.error('💥 Etsy multiple search failed:', error);
      
      // If it's an authentication error, provide specific guidance
      if (error instanceof Error && (error.message.includes('authentication') || error.message.includes('forbidden') || error.message.includes('403') || error.message.includes('subscription'))) {
        console.error('🔑 Etsy API Key Issue: Please check your RapidAPI subscription and key configuration');
        // Return empty array instead of throwing to allow the app to continue with other marketplaces
        return [];
      }
      
      // For other errors, still return empty array to prevent breaking the entire search flow
      console.error('🔄 Returning empty results to allow other marketplaces to continue');
      return [];
    }
  }

  // Process API response to match our EtsyProduct interface
  private processResults(data: EtsyAPIResponse): EtsyProduct[] {
    if (!data) {
      console.warn('⚠️ No data received from Etsy API');
      return [];
    }

    console.log('🔍 Processing Etsy API response structure:', Object.keys(data));

    // Try to find the results array in the response
    let results: any[] = [];
    
    // Check if the response key exists and contains the products
    if (data.response) {
      console.log('📦 Found response key in data');
      
      // Check if response is an array
      if (Array.isArray(data.response)) {
        results = data.response;
        console.log('📦 Response is an array with length:', results.length);
      } 
      // Check if response is an object with numeric keys (like in the example)
      else if (typeof data.response === 'object') {
        const numericKeys = Object.keys(data.response).filter(key => !isNaN(Number(key)));
        if (numericKeys.length > 0) {
          console.log('📦 Response is an object with numeric keys:', numericKeys.length);
          results = numericKeys.map(key => data.response[key]);
        }
      }
    } 
    // Try other common response formats
    else if (Array.isArray(data)) {
      results = data;
      console.log('📦 Found results as root array');
    } else if (data.results && Array.isArray(data.results)) {
      results = data.results;
      console.log('📦 Found results in data.results');
    } else if (data.data && Array.isArray(data.data)) {
      results = data.data;
      console.log('📦 Found results in data.data');
    } else if (data.products && Array.isArray(data.products)) {
      results = data.products;
      console.log('📦 Found results in data.products');
    } else {
      // Check if the data itself is an object with numeric keys (like the example provided)
      const numericKeys = Object.keys(data).filter(key => !isNaN(Number(key)));
      if (numericKeys.length > 0) {
        console.log('📦 Found results as numeric properties of the root object');
        results = numericKeys.map(key => data[key]);
      } else {
        console.warn('⚠️ Could not find results array in Etsy response. Available keys:', Object.keys(data));
        return [];
      }
    }

    if (!Array.isArray(results)) {
      console.warn('⚠️ Etsy results is not an array:', typeof results);
      return [];
    }

    console.log(`📊 Processing ${results.length} raw Etsy products`);

    // Log the first product to understand its structure
    if (results.length > 0) {
      console.log('📦 First product structure:', JSON.stringify(results[0], null, 2));
    }

    const processedProducts = results
      .map((item, index) => {
        const result = this.mapProductData(item);
        if (!result) {
          console.log(`❌ Skipped Etsy product ${index + 1}`);
        }
        return result;
      })
      .filter(product => product !== null) as EtsyProduct[];

    console.log(`✅ Successfully processed ${processedProducts.length} Etsy products`);
    return processedProducts;
  }

  // Map individual product data to our interface based on Etsy API structure
  private mapProductData(item: any): EtsyProduct | null {
    try {
      // Extract essential fields
      const title = item.title || '';
      const listingId = item.listingId || item.listing_id || item.id || '';
      
      if (!title || !listingId) {
        console.log(`❌ Missing essential data - title: "${title}", listingId: "${listingId}"`);
        return null; // Skip products without essential data
      }

      // Extract price - handle the new structure with salePrice/originalPrice
      let price = 0;
      
      if (item.price && typeof item.price === 'object' && item.price.salePrice) {
        // Price is an object with salePrice property
        price = this.extractPrice(item.price.salePrice);
      } else if (item.salePrice) {
        // Direct salePrice property
        price = this.extractPrice(item.salePrice);
      } else if (item.originalPrice || item.price?.originalPrice) {
        // Use original price as fallback
        price = this.extractPrice(item.originalPrice || item.price?.originalPrice);
      } else if (item.price && typeof item.price === 'number') {
        // Direct price as number
        price = item.price;
      } else if (item.price && typeof item.price === 'string') {
        // Direct price as string
        price = this.extractPrice(item.price);
      }
      
      // Ensure price is reasonable (sanity check)
      if (price <= 0 || price > 100000) {
        console.warn(`⚠️ Suspicious price value: ${price}, using default`);
        price = 99.99;
      }

      // Extract image URL
      let imageUrl = '';
      if (item.imageUrl) {
        // Direct imageUrl property
        imageUrl = item.imageUrl;
      } else if (item.image) {
        // Direct image property
        imageUrl = item.image;
      } else if (item.images && item.images.length > 0) {
        // Images array
        const image = item.images[0];
        imageUrl = image.url_570xN || image.url || '';
      } else if (item.image_url) {
        // Direct image_url property
        imageUrl = item.image_url;
      } else if (item.thumbnail_url) {
        // Thumbnail as fallback
        imageUrl = item.thumbnail_url;
      }

      // Construct product URL
      const url = item.productUrl || item.url || `https://www.etsy.com/listing/${listingId}`;

      // Extract rating and review count
      const rating = this.extractRating(item.rating || 0);
      const reviewsCount = item.reviewsCount || item.reviews_count || 0;

      // Extract currency
      const currency = item.currency || item.price?.currency || 'USD';

      // Create the product object
      const product: EtsyProduct = {
        title: title.trim(),
        price: price,
        currency: currency,
        rating: rating,
        reviewsCount: reviewsCount,
        image: imageUrl,
        url: url,
        listingId: listingId.toString(),
        source: 'etsy'
      };

      return product;
    } catch (error) {
      console.error('❌ Error mapping Etsy product data:', error);
      return null;
    }
  }

  // Enhanced price extraction
  private extractPrice(price: any): number {
    if (typeof price === 'number') {
      return Math.max(0, price);
    }
    
    if (typeof price === 'string') {
      // Remove currency symbols and extract numeric value
      const numericPrice = price.replace(/[^\d.]/g, '');
      const parsed = parseFloat(numericPrice);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    
    return 0;
  }

  // Extract rating from various formats
  private extractRating(rating: any): number {
    if (typeof rating === 'number') {
      return Math.min(5, Math.max(0, rating));
    }
    
    if (typeof rating === 'string') {
      const numericRating = parseFloat(rating.replace(/[^0-9.]/g, ''));
      return isNaN(numericRating) ? 0 : Math.min(5, Math.max(0, numericRating));
    }
    
    return 0;
  }

  // Extract review count from various formats
  private extractReviewCount(count: any): number {
    if (typeof count === 'number') {
      return Math.max(0, Math.floor(count));
    }
    
    if (typeof count === 'string') {
      const numericCount = parseInt(count.replace(/[^0-9]/g, ''));
      return isNaN(numericCount) ? 0 : Math.max(0, numericCount);
    }
    
    return 0;
  }

  // Remove duplicate products based on SKU
  private removeDuplicates(products: EtsyProduct[]): EtsyProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.listingId)) {
        return false;
      }
      seen.add(product.listingId);
      return true;
    });
  }
}

// Export singleton instance
export const etsySearchService = new EtsySearchService();

// Export types for use in other files
export type { EtsyProduct, EtsySearchParams };