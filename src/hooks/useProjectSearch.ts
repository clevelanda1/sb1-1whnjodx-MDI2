import { useState, useEffect } from 'react';
import { Project } from '../types/studio';
import { ProjectFilters } from '../types/studio';

export const useProjectSearch = (projects: Project[]) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    searchQuery: '',
    viewMode: 'grid'
  });
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Filter projects based on search query
  useEffect(() => {
    if (!filters.searchQuery.trim()) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        project.status.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projects, filters.searchQuery]);

  const updateSearchQuery = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const updateViewMode = (mode: 'grid' | 'list') => {
    setFilters(prev => ({ ...prev, viewMode: mode }));
  };

  const clearSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: '' }));
  };

  return {
    filters,
    filteredProjects,
    updateSearchQuery,
    updateViewMode,
    clearSearch
  };
};