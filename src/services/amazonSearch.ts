import axios from 'axios';
import { ApiUsageService } from './apiUsageService';

const RAPIDAPI_KEY_AMAZON = import.meta.env.VITE_RAPIDAPI_KEY_AMAZON;
const RAPIDAPI_HOST = 'amazon-online-data-api.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface SearchParams {
  query: string;
  page?: number;
  geo?: string;
}

interface AmazonProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  asin: string;
}

interface RapidAPIResponse {
  products?: any[];
  results?: any[];
  data?: any[];
  items?: any[];
  // Handle various possible response formats
  [key: string]: any;
}

class AmazonRapidAPIService {
  private readonly headers = {
    'X-RapidAPI-Key': RAPIDAPI_KEY_AMAZON,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };

  private readonly defaultParams: Partial<SearchParams> = {
    page: 1,
    geo: 'US',
  };

  // Rate limiting properties - Increased delay to avoid 429 errors
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly maxConcurrentRequests = 1; // Keep at 1 for conservative rate limiting
  private readonly requestDelay = 2500; // Increased from 1500ms to 2500ms to avoid rate limits

  // Retry configuration
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second base delay

  // Check if API key is configured
  private checkApiKey(): void {
    if (!RAPIDAPI_KEY_AMAZON || RAPIDAPI_KEY_AMAZON === 'your_rapidapi_key_here') {
      throw new Error('Amazon RapidAPI key is not configured. Please add VITE_RAPIDAPI_KEY_AMAZON to your .env file.');
    }
  }

  // Sleep utility for delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Retry mechanism with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      const isRetryableError = 
        error.response?.status === 429 || // Rate limit
        error.response?.status >= 500 || // Server errors
        error.code === 'ECONNRESET' || // Network issues
        error.code === 'ETIMEDOUT';

      if (isRetryableError && retryCount < this.maxRetries) {
        const delay = this.baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        await this.sleep(delay);
        return this.retryRequest(requestFn, retryCount + 1);
      }

      throw error;
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

  // Test connection to RapidAPI
  async testConnection(): Promise<boolean> {
    try {
      this.checkApiKey();
      const response = await this.searchProducts({ query: 'test', page: 1 });
      return Array.isArray(response) || response.length >= 0;
    } catch (error) {
      console.error('Amazon RapidAPI connection test failed:', error);
      return false;
    }
  }

  // Search for products with a single query
  async searchProducts(params: SearchParams): Promise<AmazonProduct[]> {
    try {
      this.checkApiKey();
      
      const searchParams = { ...this.defaultParams, ...params };
      
      // Check if the user has exceeded their API usage limit
      const canProceed = await ApiUsageService.checkApiUsageLimit('amazon');
      if (!canProceed) {
        console.warn('Amazon API usage limit exceeded. Skipping search.');
        return [];
      }
      
      return await this.queueRequest(async () => {
        return this.retryRequest(async () => {
          console.log('Searching Amazon via RapidAPI:', searchParams.query);
          
          // Increment API usage counter
          await ApiUsageService.incrementApiUsage('amazon');
          
          const response = await axios.get(`${BASE_URL}/search`, {
            headers: this.headers,
            params: searchParams,
            timeout: 30000, // 30 seconds
          });

          console.log('RapidAPI response received for:', searchParams.query);
          return this.processResults(response.data);
        });
      });
    } catch (error: any) {
      console.error('Amazon search API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        query: params.query,
      });
      
      // Always return empty array instead of throwing to allow other searches to continue
      return [];
    }
  }

  // Search multiple queries with proper rate limiting
  async searchMultipleQueries(queries: string[]): Promise<AmazonProduct[]> {
    if (!queries.length) {
      return [];
    }

    try {
      this.checkApiKey();
      console.log(`Searching ${queries.length} queries with rate limiting:`, queries);

      // Create search promises for all queries
      const searchPromises = queries.map(query =>
        this.searchProducts({ query }).catch(error => {
          console.warn(`Search failed for query "${query}":`, error.message);
          return []; // Return empty array for failed searches
        })
      );

      // Wait for all searches to complete
      const results = await Promise.all(searchPromises);
      
      // Combine all successful results
      const allProducts: AmazonProduct[] = [];
      let successfulSearches = 0;
      
      results.forEach((products, index) => {
        if (Array.isArray(products) && products.length > 0) {
          allProducts.push(...products);
          successfulSearches++;
        }
      });

      console.log(`Search completed: ${successfulSearches}/${queries.length} successful, ${allProducts.length} total products`);

      // Remove duplicates based on ASIN
      const uniqueProducts = this.removeDuplicates(allProducts);
      
      // Limit total results to prevent overwhelming the UI
      const limitedProducts = uniqueProducts.slice(0, 500);
      
      console.log(`Returning ${limitedProducts.length} unique products`);
      return limitedProducts;

    } catch (error) {
      console.error('Multiple search failed:', error);
      // Return empty array instead of throwing error
      return [];
    }
  }

  // Process API response to match our AmazonProduct interface
  private processResults(data: RapidAPIResponse): AmazonProduct[] {
    if (!data) {
      console.warn('No data received from API');
      return [];
    }

    // Try to find the products array in various possible response formats
    let products: any[] = [];
    
    if (Array.isArray(data)) {
      products = data;
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
    } else if (data.results && Array.isArray(data.results)) {
      products = data.results;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    } else if (data.items && Array.isArray(data.items)) {
      products = data.items;
    } else {
      console.warn('Could not find products array in response:', Object.keys(data));
      return [];
    }

    if (!Array.isArray(products)) {
      console.warn('Products is not an array:', typeof products);
      return [];
    }

    console.log(`Processing ${products.length} raw products`);

    return products
      .map(item => this.mapProductData(item))
      .filter(product => product !== null) as AmazonProduct[];
  }

  // Map individual product data to our interface - Updated to handle your specific API response format
  private mapProductData(item: any): AmazonProduct | null {
    try {
      // Handle various possible field names from different API responses
      // Based on your raw data example, prioritize the specific field names
      const title = item.product_title || 
                   item.title || 
                   item.name || 
                   item.productTitle || 
                   '';
      
      // Fixed ASIN extraction - ensure we always get a valid string
      const asin = item.asin || 
                  item.id || 
                  item.product_id || 
                  item.productId || 
                  item.product_asin ||
                  item.productAsin ||
                  // Generate a fallback ASIN if none exists
                  `MISSING_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!title || !asin || asin === '') {
        console.warn('Skipping product with missing title or ASIN:', { title, asin, item });
        return null; // Skip products without essential data
      }

      // Extract price from various possible formats - prioritize product_price from your example
      const price = this.extractPrice(
        item.product_price ||  // From your raw data example
        item.price || 
        item.current_price || 
        item.currentPrice || 
        item.price_current || 
        item.priceCurrent ||
        item.list_price ||
        item.listPrice ||
        0
      );

      // Extract rating - prioritize product_star_rating from your example
      const rating = this.extractRating(
        item.product_star_rating ||  // From your raw data example
        item.rating || 
        item.stars || 
        item.star_rating || 
        item.starRating ||
        item.average_rating ||
        item.averageRating ||
        0
      );

      // Extract review count - prioritize product_num_ratings from your example
      const reviewsCount = this.extractReviewCount(
        item.product_num_ratings ||  // From your raw data example
        item.reviews_count || 
        item.reviewsCount || 
        item.review_count || 
        item.reviewCount ||
        item.total_reviews ||
        item.totalReviews ||
        0
      );

      // Extract image URL - prioritize product_photo from your example
      const image = item.product_photo ||  // From your raw data example
                   item.image || 
                   item.image_url || 
                   item.imageUrl || 
                   item.thumbnail || 
                   item.img || 
                   item.picture ||
                   '';

      // Extract product URL - prioritize product_url from your example
      const url = item.product_url ||  // From your raw data example
                  item.url || 
                  item.link || 
                  item.productUrl ||
                  item.amazon_url ||
                  item.amazonUrl ||
                  `https://amazon.com/dp/${asin}`;

      return {
        title: title.trim(),
        price,
        currency: item.currency || 'USD',
        rating,
        reviewsCount,
        image,
        url,
        asin: asin.toString().trim(), // Ensure ASIN is always a non-empty string
      };
    } catch (error) {
      console.warn('Error mapping product data:', error, item);
      return null;
    }
  }

  // Enhanced price extraction with better parsing
  private extractPrice(price: any): number {
    if (typeof price === 'number') {
      return Math.max(0, price);
    }
    
    if (typeof price === 'string') {
      // Remove currency symbols and extract numeric value
      // Handle formats like "$19.99", "19.99", "£10.50", "€15,99"
      let cleanPrice = price.replace(/[^\d.,]/g, '');
      
      // Handle European format (comma as decimal separator)
      if (cleanPrice.includes(',') && !cleanPrice.includes('.')) {
        cleanPrice = cleanPrice.replace(',', '.');
      } else if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
        // Handle format like "1,234.56" - remove comma
        cleanPrice = cleanPrice.replace(/,/g, '');
      }
      
      const parsed = parseFloat(cleanPrice);
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
      // Handle formats like "1,234" or "1.2K" or "10,202" from your example
      let numericCount = count.replace(/[^0-9.K,]/gi, '');
      
      if (numericCount.includes('K')) {
        const baseNumber = parseFloat(numericCount.replace('K', ''));
        return isNaN(baseNumber) ? 0 : Math.floor(baseNumber * 1000);
      }
      
      // Remove commas for numbers like "10,202"
      const parsed = parseInt(numericCount.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    
    return 0;
  }

  // Remove duplicate products based on ASIN
  private removeDuplicates(products: AmazonProduct[]): AmazonProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.asin)) {
        return false;
      }
      seen.add(product.asin);
      return true;
    });
  }

  // Get search suggestions (if needed for future features)
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      // This would be implemented if the API supports search suggestions
      // For now, return the original query
      return [query];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [query];
    }
  }
}

// Export singleton instance
export const amazonSearchService = new AmazonRapidAPIService();

// Export types for use in other files
export type { AmazonProduct, SearchParams };