import { DualSearchQueries, ProjectElement } from '../lib/supabase';
import { UnifiedProduct } from '../services/combinedSearch';

export interface CurationFilters {
  selectedElements: string[];
  selectedPriceRange: number[];
  searchTerm: string;
  showFavoritesOnly: boolean;
  marketplaces?: string[]; // Added to filter by marketplace
}

export interface ProjectData {
  projectId: string;
  projectName: string;
  detectedElements: string[];
  searchQueries: DualSearchQueries; // Updated to use DualSearchQueries type
  preLoadedProducts: UnifiedProduct[];
}

export interface ElementWithProducts extends ProjectElement {
  products: UnifiedProduct[];
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  productsPerPage: number;
}

export interface ViewSettings {
  viewMode: 'grid' | 'list';
  showFilters: boolean;
}

export interface WishlistState {
  wishlist: string[];
  isLoading: boolean;
}

// Re-export types from services for convenience
export type { UnifiedProduct } from '../services/combinedSearch';
export type { Project } from '../lib/supabase';