import { amazonSearchService, AmazonProduct } from './amazonSearch';
import { etsySearchService, EtsyProduct } from './etsySearch';

// Unified product interface that can represent both Amazon and Etsy products
export interface UnifiedProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  id: string; // ASIN for Amazon, listingId for Etsy
  asin: string; // Explicitly include ASIN for database compatibility
  source: 'amazon' | 'etsy';
  originalData: AmazonProduct | EtsyProduct; // Keep original data for specific operations
  elementId?: string; // Added to track which element this product came from
}

export interface DualSearchQueries {
  amazon: string[];
  etsy: string[];
}

class CombinedSearchService {
  // Search a single marketplace with a single query
  async searchSingleMarketplace(
    marketplace: 'amazon' | 'etsy',
    query: string,
    elementId?: string
  ): Promise<UnifiedProduct[]> {
    console.log(`Searching ${marketplace} for query: "${query}"`);
    
    try {
      let products: UnifiedProduct[] = [];
      
      if (marketplace === 'amazon') {
        // Search Amazon with single query
        const amazonProducts = await amazonSearchService.searchMultipleQueries([query]);
        products = amazonProducts.map(product => this.convertAmazonProduct(product, elementId));
      } else {
        // Search Etsy with single query
        const etsyProducts = await etsySearchService.searchMultipleQueries([query]);
        products = etsyProducts.map(product => this.convertEtsyProduct(product, elementId));
      }
      
      console.log(`Found ${products.length} products from ${marketplace} for query "${query}"`);
      return products;
    } catch (error) {
      console.error(`Error searching ${marketplace} for query "${query}":`, error);
      return [];
    }
  }

  // Convert Amazon product to unified format
  private convertAmazonProduct(product: AmazonProduct, elementId?: string): UnifiedProduct {
    return {
      title: product.title,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      image: product.image,
      url: product.url,
      id: product.asin,
      asin: product.asin,
      source: 'amazon',
      originalData: product,
      elementId
    };
  }

  // Convert Etsy product to unified format
  private convertEtsyProduct(product: EtsyProduct, elementId?: string): UnifiedProduct {
    return {
      title: product.title,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      image: product.image,
      url: product.url,
      id: product.listingId,
      asin: product.listingId, // Use listingId as asin for compatibility
      source: 'etsy',
      originalData: product,
      elementId
    };
  }

  // Shuffle array for variety in results
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Balance results to ensure good mix from both platforms
  balanceResults(products: UnifiedProduct[], maxResults: number): UnifiedProduct[] {
    if (products.length <= maxResults) return products;
    
    const amazonProducts = products.filter(p => p.source === 'amazon');
    const etsyProducts = products.filter(p => p.source === 'etsy');
    
    // Aim for roughly 60% Amazon, 40% Etsy (since Amazon typically has more variety)
    const targetAmazon = Math.ceil(maxResults * 0.6);
    const targetEtsy = maxResults - targetAmazon;
    
    const selectedAmazon = amazonProducts.slice(0, targetAmazon);
    const selectedEtsy = etsyProducts.slice(0, targetEtsy);
    
    // If one platform has fewer results, fill with the other
    const totalSelected = selectedAmazon.length + selectedEtsy.length;
    if (totalSelected < maxResults) {
      const remaining = maxResults - totalSelected;
      if (selectedAmazon.length < targetAmazon) {
        selectedAmazon.push(...etsyProducts.slice(selectedEtsy.length, selectedEtsy.length + remaining));
      } else {
        selectedEtsy.push(...amazonProducts.slice(selectedAmazon.length, selectedAmazon.length + remaining));
      }
    }
    
    // Shuffle the final results for variety
    return this.shuffleArray([...selectedAmazon, ...selectedEtsy]);
  }

  // Search both platforms with their respective queries
  async searchBothPlatforms(queries: DualSearchQueries): Promise<UnifiedProduct[]> {
    try {
      console.log('Searching both Amazon and Etsy with platform-specific queries');
      
      // Run searches in parallel
      const [amazonResults, etsyResults] = await Promise.all([
        amazonSearchService.searchMultipleQueries(queries.amazon)
          .then(products => products.map(p => this.convertAmazonProduct(p)))
          .catch(error => {
            console.error('Amazon search failed:', error);
            return [];
          }),
        etsySearchService.searchMultipleQueries(queries.etsy)
          .then(products => products.map(p => this.convertEtsyProduct(p)))
          .catch(error => {
            console.error('Etsy search failed:', error);
            return [];
          })
      ]);
      
      console.log(`Found ${amazonResults.length} Amazon products and ${etsyResults.length} Etsy products`);
      
      // Combine and balance results
      const combinedResults = [...amazonResults, ...etsyResults];
      return this.balanceResults(combinedResults, 1000); // Limit to 300 total products
    } catch (error) {
      console.error('Error searching both platforms:', error);
      return [];
    }
  }

  // Test both API connections
  async testConnections(): Promise<{ amazon: boolean; etsy: boolean }> {
    const [amazonTest, etsyTest] = await Promise.allSettled([
      amazonSearchService.testConnection(),
      etsySearchService.testConnection()
    ]);

    return {
      amazon: amazonTest.status === 'fulfilled' ? amazonTest.value : false,
      etsy: etsyTest.status === 'fulfilled' ? etsyTest.value : false
    };
  }

  // Amazon-only search for backward compatibility
  async searchAmazonOnly(queries: string[]): Promise<UnifiedProduct[]> {
    try {
      const amazonProducts = await amazonSearchService.searchMultipleQueries(queries);
      return amazonProducts.map(product => this.convertAmazonProduct(product));
    } catch (error) {
      console.error('Error in Amazon-only search:', error);
      return [];
    }
  }
}

// Export singleton instance
export const combinedSearchService = new CombinedSearchService();

// Export types
export type { UnifiedProduct, DualSearchQueries };