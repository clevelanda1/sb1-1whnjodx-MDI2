import { useState, useEffect } from 'react';
import { LikedProductsService } from '../services/likedProductsService';
import { ProductDataState, LikedProductWithProject } from '../types/visionboard';
import { Project } from '../lib/supabase';

export const useVisionBoardData = () => {
  const [productData, setProductData] = useState<ProductDataState>({
    likedProducts: [],
    projects: [],
    isLoading: true
  });

  // Load liked products and projects on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setProductData(prev => ({ ...prev, isLoading: true }));
      
      // Load liked products with project information
      const likedProductsWithProjects = await LikedProductsService.getLikedProductsWithProjects();
      
      // Extract unique projects
      const uniqueProjects = likedProductsWithProjects
        .map(item => item.project)
        .filter((project, index, self) => 
          project && index === self.findIndex(p => p.id === project.id)
        );
      
      setProductData({
        likedProducts: likedProductsWithProjects,
        projects: uniqueProjects,
        isLoading: false
      });
      
      console.log(`Loaded ${likedProductsWithProjects.length} liked products from ${uniqueProjects.length} projects`);
    } catch (error) {
      console.error('Error loading vision board data:', error);
      setProductData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshData = () => {
    loadData();
  };

  return {
    ...productData,
    refreshData
  };
};