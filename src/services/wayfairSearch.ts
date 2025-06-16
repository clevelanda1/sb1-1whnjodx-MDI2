import axios from 'axios';

const RAPIDAPI_KEY_WAYFAIR = import.meta.env.VITE_RAPIDAPI_KEY_WAYFAIR;
const RAPIDAPI_HOST = 'wayfair.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

interface WayfairSearchParams {
  keyword: string;
  itemsPerPage?: number;
  page?: number;
  sortId?: number;
}

interface WayfairProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  sku: string; // Wayfair uses SKU instead of ASIN
  source: 'wayfair'; // To distinguish from Amazon products
}

interface WayfairAPIResponse {
  productCount?: number;
  products?: any[];
  // Handle various possible response formats
  [key: string]: any;
}

class WayfairSearchService {
  private readonly headers = {
    'X-RapidAPI-Key': RAPIDAPI_KEY_WAYFAIR,
    'X-RapidAPI-Host': RAPIDAPI_HOST,
  };

  private readonly defaultParams: Partial<WayfairSearchParams> = {
    itemsPerPage: 48,
    page: 1,
    sortId: 0,
  };

  // Rate limiting properties - Increased delay to match Amazon's conservative approach
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private readonly maxConcurrentRequests = 1; // Keep at 1 for conservative rate limiting
  private readonly requestDelay = 2500; // Increased from 1000ms to 2500ms to match Amazon

  // Retry configuration
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second base delay

  // Check if API key is configured
  private checkApiKey(): void {
    if (!RAPIDAPI_KEY_WAYFAIR || RAPIDAPI_KEY_WAYFAIR === 'your_rapidapi_key_here') {
      console.error('❌ Wayfair API key not configured properly');
      throw new Error('Wayfair RapidAPI key is not configured. Please add VITE_RAPIDAPI_KEY_WAYFAIR to your .env file.');
    }
    console.log('✅ Wayfair API key is configured');
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
        console.log(`🔄 Retrying Wayfair request in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
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
        console.log(`⏳ Wayfair: Waiting ${this.requestDelay}ms before next batch...`);
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

  // Test connection to Wayfair API
  async testConnection(): Promise<boolean> {
    try {
      this.checkApiKey();
      console.log('🧪 Testing Wayfair API connection...');
      const response = await this.searchProducts({ keyword: 'test' });
      const isWorking = Array.isArray(response) || response.length >= 0;
      console.log(`🧪 Wayfair API test result: ${isWorking ? '✅ Working' : '❌ Failed'}`);
      return isWorking;
    } catch (error) {
      console.error('❌ Wayfair API connection test failed:', error);
      return false;
    }
  }

  // Search for products with a single query
  async searchProducts(params: WayfairSearchParams): Promise<WayfairProduct[]> {
    this.checkApiKey();
    
    const searchParams = { ...this.defaultParams, ...params };
    
    return this.queueRequest(async () => {
      return this.retryRequest(async () => {
        console.log('🔍 Searching Wayfair via RapidAPI:', searchParams.keyword);
        
        const response = await axios.get(`${BASE_URL}/products/v2/search`, {
          headers: this.headers,
          params: searchParams,
          timeout: 30000, // 30 seconds
        });

        console.log('📦 Wayfair API response received for:', searchParams.keyword);
        
        // Log the response structure to help debug
        console.log('📊 Wayfair response structure:', Object.keys(response.data));
        if (response.data.data) {
          console.log('📊 data keys:', Object.keys(response.data.data));
          if (response.data.data.keyword) {
            console.log('📊 data.keyword keys:', Object.keys(response.data.data.keyword));
            if (response.data.data.keyword.results) {
              console.log('📊 data.keyword.results keys:', Object.keys(response.data.data.keyword.results));
              if (response.data.data.keyword.results.products) {
                console.log('📊 Found products array with length:', response.data.data.keyword.results.products.length);
              } else {
                console.log('❌ No products array found in data.keyword.results');
              }
            }
          }
        }
        
        return this.processResults(response.data);
      });
    }).catch(error => {
      console.error('❌ Wayfair search API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        query: searchParams.keyword,
      });
      
      // Return empty array instead of throwing to allow other searches to continue
      return [];
    });
  }

  // Search multiple queries with proper rate limiting
  async searchMultipleQueries(queries: string[]): Promise<WayfairProduct[]> {
    if (!queries.length) {
      console.log('⚠️ No Wayfair queries provided');
      return [];
    }

    this.checkApiKey();
    console.log(`🚀 Starting Wayfair search with ${queries.length} queries:`, queries);

    try {
      // Create search promises for all queries
      const searchPromises = queries.map(query =>
        this.searchProducts({ keyword: query }).catch(error => {
          console.warn(`⚠️ Wayfair search failed for query "${query}":`, error.message);
          return []; // Return empty array for failed searches
        })
      );

      // Wait for all searches to complete
      const results = await Promise.all(searchPromises);
      
      // Combine all successful results
      const allProducts: WayfairProduct[] = [];
      let successfulSearches = 0;
      
      results.forEach((products, index) => {
        if (Array.isArray(products) && products.length > 0) {
          allProducts.push(...products);
          successfulSearches++;
          console.log(`✅ Wayfair query "${queries[index]}" returned ${products.length} products`);
        } else {
          console.log(`❌ Wayfair query "${queries[index]}" returned no products`);
        }
      });

      console.log(`🎯 Wayfair search completed: ${successfulSearches}/${queries.length} successful, ${allProducts.length} total products`);

      // Remove duplicates based on SKU
      const uniqueProducts = this.removeDuplicates(allProducts);
      
      console.log(`📋 Returning ${uniqueProducts.length} unique Wayfair products`);
      return uniqueProducts;

    } catch (error) {
      console.error('💥 Wayfair multiple search failed:', error);
      throw new Error('Failed to search Wayfair products. Please try again later.');
    }
  }

  // Process API response to match our WayfairProduct interface
  private processResults(data: WayfairAPIResponse): WayfairProduct[] {
    if (!data) {
      console.warn('⚠️ No data received from Wayfair API');
      return [];
    }

    console.log('🔍 Processing Wayfair API response structure:', Object.keys(data));

    // Try to find the products array in the response
    let products: any[] = [];
    
    if (Array.isArray(data)) {
      products = data;
      console.log('📦 Found products as root array');
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products;
      console.log('📦 Found products in data.products');
    } else if (data.data?.keyword?.results?.products && Array.isArray(data.data.keyword.results.products)) {
      // This is the likely path for the Wayfair API
      products = data.data.keyword.results.products;
      console.log('📦 Found products in data.data.keyword.results.products');
    } else {
      console.warn('⚠️ Could not find products array in Wayfair response. Available keys:', Object.keys(data));
      return [];
    }

    if (!Array.isArray(products)) {
      console.warn('⚠️ Wayfair products is not an array:', typeof products);
      return [];
    }

    console.log(`📊 Processing ${products.length} raw Wayfair products`);

    // Log the first product to understand its structure
    if (products.length > 0) {
      console.log('📦 First product structure:', JSON.stringify(products[0], null, 2));
    }

    const processedProducts = products
      .map((item, index) => {
        const result = this.mapProductData(item);
        if (!result) {
          console.log(`❌ Skipped Wayfair product ${index + 1}`);
        }
        return result;
      })
      .filter(product => product !== null) as WayfairProduct[];

    console.log(`✅ Successfully processed ${processedProducts.length} Wayfair products`);
    return processedProducts;
  }

  // Map individual product data to our interface based on Wayfair API structure
  private mapProductData(item: any): WayfairProduct | null {
    try {
      // Log key fields to help debug
      console.log('🔄 Mapping Wayfair product with keys:', Object.keys(item));
      
      // Name/title extraction
      const name = item.name || item.title || '';
      console.log(`📝 Product name: "${name}"`);
      
      // SKU extraction
      const sku = item.sku || item.id || '';
      console.log(`🔑 Product SKU: "${sku}"`);
      
      if (!name || !sku) {
        console.log(`❌ Missing essential data - name: "${name}", sku: "${sku}"`);
        return null; // Skip products without essential data
      }

      // Price extraction
      let price = 0;
      if (item.pricing) {
        console.log('💰 Pricing structure:', JSON.stringify(item.pricing, null, 2));
        if (item.pricing.customerPrice?.display?.value) {
          price = this.extractPrice(item.pricing.customerPrice.display.value);
        } else if (item.pricing.listPrice?.unitPrice?.value) {
          price = this.extractPrice(item.pricing.listPrice.unitPrice.value);
        }
      } else if (item.price) {
        price = this.extractPrice(item.price);
      }
      console.log(`💰 Extracted price: ${price}`);

      // Rating extraction
      let rating = 0;
      if (item.customerReviews) {
        console.log('⭐ Customer reviews structure:', JSON.stringify(item.customerReviews, null, 2));
        rating = this.extractRating(item.customerReviews.averageRating || 0);
      } else if (item.customer_reviews) {
        rating = this.extractRating(item.customer_reviews.average_rating_value || 0);
      } else if (item.rating) {
        rating = this.extractRating(item.rating);
      }
      console.log(`⭐ Extracted rating: ${rating}`);

      // Review count extraction
      let reviewsCount = 0;
      if (item.customerReviews) {
        reviewsCount = this.extractReviewCount(item.customerReviews.reviewCount || 0);
      } else if (item.customer_reviews) {
        reviewsCount = this.extractReviewCount(item.customer_reviews.rating_count || 0);
      } else if (item.review_count) {
        reviewsCount = this.extractReviewCount(item.review_count);
      }
      console.log(`📊 Extracted reviews count: ${reviewsCount}`);

      // Image URL extraction - Log all possible image fields
      console.log('🖼️ Image fields:');
      if (item.images) console.log('- images:', JSON.stringify(item.images, null, 2));
      if (item.leadImage) console.log('- leadImage:', JSON.stringify(item.leadImage, null, 2));
      if (item.image) console.log('- image:', item.image);
      if (item.image_url) console.log('- image_url:', item.image_url);
      if (item.thumbnail) console.log('- thumbnail:', item.thumbnail);
      
      // Extract image URL with better fallbacks
      let image = '';
      
      // Try to extract from images array first
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        const firstImage = item.images[0];
        if (typeof firstImage === 'string') {
          image = firstImage;
        } else if (firstImage.url) {
          image = firstImage.url;
        } else if (firstImage.src) {
          image = firstImage.src;
        }
      }
      
      // Try leadImage if images array didn't work
      if (!image && item.leadImage) {
        if (item.leadImage.url) {
          image = item.leadImage.url;
        } else if (item.leadImage.id) {
          // Construct Wayfair image URL using the lead image ID
          image = `https://secure.img1-fg.wfcdn.com/im/29272037/resize-h800-w800%5Ecompr-r85/${item.leadImage.id}/default.jpg`;
        }
      }
      
      // Try other image fields as fallbacks
      if (!image) {
        image = item.image || item.image_url || item.thumbnail || '';
      }
      
      // If we still don't have an image, try to construct one from the SKU
      if (!image && sku) {
        // Try a common Wayfair image URL pattern
        image = `https://secure.img1-fg.wfcdn.com/im/47664163/resize-h800%5Ecompr-r85/1388/${sku}.jpg`;
      }
      
      console.log(`🖼️ Final image URL: ${image}`);

      // URL extraction
      let url = '';
      if (item.url) {
        url = item.url;
      } else if (item.product_url) {
        url = item.product_url;
      } else if (sku) {
        // Construct a URL from the SKU
        const slugifiedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        url = `https://www.wayfair.com/furniture/pdp/${slugifiedName}-${sku}.html`;
      }
      console.log(`🔗 Product URL: ${url}`);

      const mappedProduct = {
        title: name.trim(),
        price,
        currency: item.pricing?.customerPrice?.display?.currency || item.currency || 'USD',
        rating,
        reviewsCount,
        image,
        url,
        sku,
        source: 'wayfair' as const
      };

      console.log('✅ Successfully mapped Wayfair product:', mappedProduct);
      return mappedProduct;
    } catch (error) {
      console.warn('❌ Error mapping Wayfair product data:', error);
      return null;
    }
  }

  // Enhanced price extraction
  private extractPrice(price: any): number {
    if (typeof price === 'number') {
      return Math.max(0, price);
    }
    
    if (typeof price === 'string') {
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
  private removeDuplicates(products: WayfairProduct[]): WayfairProduct[] {
    const seen = new Set<string>();
    return products.filter(product => {
      if (seen.has(product.sku)) {
        return false;
      }
      seen.add(product.sku);
      return true;
    });
  }
}

// Export singleton instance
export const wayfairSearchService = new WayfairSearchService();

// Export types for use in other files
export type { WayfairProduct, WayfairSearchParams };