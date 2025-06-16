import { useState, useEffect, useMemo } from 'react';
import { CurationFilters } from '../types/curation';
import { UnifiedProduct } from '../services/combinedSearch';
import { PRICE_RANGES } from '../utils/constants';

export const useProductFilters = (
  products: UnifiedProduct[],
  detectedElements: string[],
  wishlist: string[]
) => {
  const [filters, setFilters] = useState<CurationFilters>({
    selectedElements: [],
    selectedPriceRange: [],
    searchTerm: '',
    showFavoritesOnly: false,
    marketplaces: undefined // Start with undefined to show all marketplaces
  });

  // Initialize selected elements when detected elements change
  useEffect(() => {
    if (detectedElements.length > 0 && filters.selectedElements.length === 0) {
      setFilters(prev => ({
        ...prev,
        selectedElements: detectedElements
      }));
    }
  }, [detectedElements]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Improved element matching logic that checks for partial matches in product titles
      const elementMatch = filters.selectedElements.length === 0 || 
        filters.selectedElements.some(element => {
          // Convert both to lowercase for case-insensitive matching
          const elementLower = element.toLowerCase();
          const titleLower = product.title.toLowerCase();
          
          // Check if the element name appears in the product title
          // Also check for singular/plural variations by removing trailing 's'
          const singularElement = elementLower.endsWith('s') ? elementLower.slice(0, -1) : elementLower;
          
          return titleLower.includes(elementLower) || 
                 titleLower.includes(singularElement);
        });

      const priceMatch = filters.selectedPriceRange.length === 0 || 
        filters.selectedPriceRange.some(minPrice => {
          const range = PRICE_RANGES.find(r => r.min === minPrice);
          return range && product.price >= range.min && product.price <= range.max;
        });

      const searchMatch = !filters.searchTerm || 
        product.title.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const favoritesMatch = !filters.showFavoritesOnly || wishlist.includes(product.id);
      
      // Marketplace filter
      const marketplaceMatch = !filters.marketplaces || 
                              filters.marketplaces.length === 0 || 
                              filters.marketplaces.includes(product.source);

      return elementMatch && priceMatch && searchMatch && favoritesMatch && marketplaceMatch;
    });
  }, [products, filters, wishlist]);

  // Get available marketplaces with counts - UPDATED to count from filtered products
  const availableMarketplaces = useMemo(() => {
    // First, apply all filters EXCEPT the marketplace filter to get the base set of products
    const baseFilteredProducts = products.filter(product => {
      // Element match
      const elementMatch = filters.selectedElements.length === 0 || 
        filters.selectedElements.some(element => {
          const elementLower = element.toLowerCase();
          const titleLower = product.title.toLowerCase();
          const singularElement = elementLower.endsWith('s') ? elementLower.slice(0, -1) : elementLower;
          return titleLower.includes(elementLower) || titleLower.includes(singularElement);
        });

      // Price match
      const priceMatch = filters.selectedPriceRange.length === 0 || 
        filters.selectedPriceRange.some(minPrice => {
          const range = PRICE_RANGES.find(r => r.min === minPrice);
          return range && product.price >= range.min && product.price <= range.max;
        });

      // Search match
      const searchMatch = !filters.searchTerm || 
        product.title.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Favorites match
      const favoritesMatch = !filters.showFavoritesOnly || wishlist.includes(product.id);

      return elementMatch && priceMatch && searchMatch && favoritesMatch;
    });
    
    // Count products by marketplace from the base filtered set
    const marketplaceCounts: Record<string, number> = {};
    
    baseFilteredProducts.forEach(product => {
      if (!marketplaceCounts[product.source]) {
        marketplaceCounts[product.source] = 0;
      }
      marketplaceCounts[product.source]++;
    });
    
    return Object.entries(marketplaceCounts)
      .map(([id, count]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
        count
      }))
      .filter(marketplace => marketplace.count > 0) // Only include marketplaces with products
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [products, filters.selectedElements, filters.selectedPriceRange, filters.searchTerm, filters.showFavoritesOnly, wishlist]);

  const updateSearchTerm = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const updateSelectedElements = (elements: string[]) => {
    setFilters(prev => ({ ...prev, selectedElements: elements }));
  };

  const toggleElement = (element: string) => {
    setFilters(prev => ({
      ...prev,
      selectedElements: prev.selectedElements.includes(element)
        ? prev.selectedElements.filter(e => e !== element)
        : [...prev.selectedElements, element]
    }));
  };

  const updatePriceRange = (priceRange: number[]) => {
    setFilters(prev => ({ ...prev, selectedPriceRange: priceRange }));
  };

  const togglePriceRange = (minPrice: number) => {
    setFilters(prev => ({
      ...prev,
      selectedPriceRange: prev.selectedPriceRange.includes(minPrice)
        ? prev.selectedPriceRange.filter(r => r !== minPrice)
        : [...prev.selectedPriceRange, minPrice]
    }));
  };

  const updateShowFavoritesOnly = (showFavoritesOnly: boolean) => {
    setFilters(prev => ({ ...prev, showFavoritesOnly }));
  };
  
  const toggleMarketplace = (marketplace: string) => {
    setFilters(prev => {
      // If marketplaces is undefined, initialize with all available marketplaces except the toggled one
      if (!prev.marketplaces) {
        const allMarketplaces = availableMarketplaces.map(m => m.id);
        return {
          ...prev,
          marketplaces: allMarketplaces.filter(m => m !== marketplace)
        };
      }
      
      // If the marketplace is already in the filter, remove it
      if (prev.marketplaces.includes(marketplace)) {
        // If removing would make the array empty, set to undefined to show all
        const newMarketplaces = prev.marketplaces.filter(m => m !== marketplace);
        return {
          ...prev,
          marketplaces: newMarketplaces.length === 0 ? undefined : newMarketplaces
        };
      }
      
      // Otherwise, add the marketplace to the filter
      return {
        ...prev,
        marketplaces: [...prev.marketplaces, marketplace]
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      selectedElements: [],
      selectedPriceRange: [],
      searchTerm: '',
      showFavoritesOnly: false,
      marketplaces: undefined
    });
  };

  const hasActiveFilters = filters.selectedElements.length > 0 || 
                          filters.selectedPriceRange.length > 0 || 
                          filters.searchTerm || 
                          filters.showFavoritesOnly ||
                          (filters.marketplaces && filters.marketplaces.length > 0);

  return {
    filters,
    filteredProducts,
    hasActiveFilters,
    availableMarketplaces,
    updateSearchTerm,
    updateSelectedElements,
    toggleElement,
    updatePriceRange,
    togglePriceRange,
    updateShowFavoritesOnly,
    toggleMarketplace,
    clearAllFilters
  };
};