import { useState, useEffect } from 'react';
import { ProjectData, ElementWithProducts } from '../types/curation';
import { ProjectService } from '../services/projectService';
import { UnifiedProduct } from '../services/combinedSearch';

export const useProjectData = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectId: '',
    projectName: '',
    detectedElements: [],
    searchQueries: { amazon: [], etsy: [] }, // Initialize with empty DualSearchQueries
    preLoadedProducts: []
  });
  const [elementsWithProducts, setElementsWithProducts] = useState<ElementWithProducts[]>([]);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectIdParam = params.get('project');
    
    if (projectIdParam) {
      loadProjectData(projectIdParam);
    } else {
      setIsLoadingProject(false);
    }
  }, []);

  const loadProjectData = async (projectId: string) => {
    try {
      setIsLoadingProject(true);
      console.log('Loading project data for:', projectId);
      
      const projectDataResponse = await ProjectService.getProjectWithProductsData(projectId);
      
      if (projectDataResponse) {
        const { project, elements, products, searchQueries } = projectDataResponse;
        
        console.log('Project loaded:', project.name);
        console.log('Elements found:', elements.length);
        console.log('Pre-loaded products:', products.length);
        console.log('Search queries:', searchQueries);
        
        const elementNames = elements.map(e => e.name);
        
        setProjectData({
          projectId: project.id,
          projectName: project.name,
          detectedElements: elementNames,
          searchQueries: searchQueries, // Use the dual search queries directly
          preLoadedProducts: products
        });

        // Load elements with their products
        const elementsData = await ProjectService.getElementsWithProducts(projectId);
        setElementsWithProducts(elementsData);
        console.log('Elements with products:', elementsData);
      } else {
        console.error('Project not found:', projectId);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const refreshElementProducts = async (elementId: string): Promise<UnifiedProduct[]> => {
    try {
      console.log('Refreshing products for element:', elementId);
      const products = await ProjectService.refreshElementProducts(elementId);
      
      // Update the elementsWithProducts state
      setElementsWithProducts(prev => prev.map(element => 
        element.id === elementId
          ? { ...element, products }
          : element
      ));
      
      // Also update the preLoadedProducts in projectData
      setProjectData(prev => ({
        ...prev,
        preLoadedProducts: [
          ...prev.preLoadedProducts.filter(p => p.elementId !== elementId),
          ...products
        ]
      }));
      
      return products;
    } catch (error) {
      console.error(`Error refreshing products for element ${elementId}:`, error);
      return [];
    }
  };

  const refreshProducts = async (): Promise<UnifiedProduct[]> => {
    if (!projectData.projectId) return [];

    try {
      setIsRefreshing(true);
      console.log('Refreshing products for project:', projectData.projectId);
      
      const freshProducts = await ProjectService.refreshProjectProducts(projectData.projectId);
      console.log('Products refreshed:', freshProducts.length);
      
      // Reload elements with their products
      const elementsData = await ProjectService.getElementsWithProducts(projectData.projectId);
      setElementsWithProducts(elementsData);
      
      setProjectData(prev => ({
        ...prev,
        preLoadedProducts: freshProducts
      }));
      
      return freshProducts;
    } catch (error) {
      console.error('Error refreshing products:', error);
      return [];
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    projectData,
    elementsWithProducts,
    isLoadingProject,
    isRefreshing,
    refreshProducts,
    refreshElementProducts
  };
};