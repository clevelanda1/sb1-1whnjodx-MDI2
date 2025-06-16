import { useState, useEffect } from 'react';
import { UnifiedProduct, combinedSearchService, DualSearchQueries } from '../services/combinedSearch';

export interface SearchState {
  status: 'idle' | 'searching' | 'complete' | 'error';
  products: UnifiedProduct[];
  error?: string;
}

export function useProductSearch(
  searchQueries: string[] | DualSearchQueries, 
  initialProducts?: UnifiedProduct[]
) {
  const [searchState, setSearchState] = useState<SearchState>({
    status: 'idle',
    products: [],
  });

  useEffect(() => {
    // If we have initial products, use them immediately
    if (initialProducts && initialProducts.length > 0) {
      console.log('Using pre-loaded products:', initialProducts.length);
      setSearchState({
        status: 'complete',
        products: initialProducts,
      });
      return;
    }

    // If no search queries, set to idle
    if (!searchQueries || (Array.isArray(searchQueries) && searchQueries.length === 0)) {
      setSearchState({
        status: 'idle',
        products: [],
      });
      return;
    }

    // Only search if we don't have initial products
    console.log('No pre-loaded products, searching fresh...');
    setSearchState({ status: 'searching', products: [] });

    // Determine if we have dual queries or single queries
    const isDualQueries = !Array.isArray(searchQueries) && 
                         'amazonQueries' in searchQueries && 
                         'wayfairQueries' in searchQueries;

    if (isDualQueries) {
      // Use dual platform search
      combinedSearchService.searchBothPlatforms(searchQueries as DualSearchQueries)
        .then(products => {
          console.log(`Dual platform search completed: ${products.length} products found`);
          setSearchState({
            status: 'complete',
            products,
          });
        })
        .catch(error => {
          console.error('Dual platform search failed:', error);
          setSearchState({
            status: 'error',
            products: [],
            error: error.message || 'Failed to fetch products. Please try again.',
          });
        });
    } else {
      // Use Amazon-only search for backward compatibility
      combinedSearchService.searchAmazonOnly(searchQueries as string[])
        .then(products => {
          console.log(`Amazon-only search completed: ${products.length} products found`);
          setSearchState({
            status: 'complete',
            products,
          });
        })
        .catch(error => {
          console.error('Amazon search failed:', error);
          setSearchState({
            status: 'error',
            products: [],
            error: error.message || 'Failed to fetch products. Please try again.',
          });
        });
    }
  }, [searchQueries, initialProducts]);

  return searchState;
}