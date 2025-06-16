import { useState, useMemo } from 'react';
import { ProductFilterState } from '../types/visionboard';
import { LikedProduct, Project } from '../lib/supabase';

export const useProductFiltering = (
  likedProducts: LikedProduct[],
  projects: Project[]
) => {
  const [filters, setFilters] = useState<ProductFilterState>({
    searchQuery: '',
    selectedProject: 'all'
  });

  // Filter products based on search and project
  const filteredProducts = useMemo(() => {
    return likedProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesProject = filters.selectedProject === 'all' || 
        (product.project && product.project.id === filters.selectedProject);
      return matchesSearch && matchesProject;
    });
  }, [likedProducts, filters]);

  // Get project options for filter
  const projectOptions = useMemo(() => [
    { id: 'all', name: 'All Projects' },
    ...projects.map(project => ({ id: project.id, name: project.name }))
  ], [projects]);

  const updateSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const updateSelectedProject = (projectId: string) => {
    setFilters(prev => ({ ...prev, selectedProject: projectId }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedProject: 'all'
    });
  };

  return {
    filters,
    filteredProducts,
    projectOptions,
    updateSearchQuery,
    updateSelectedProject,
    clearFilters
  };
};