import { useState, useCallback, useEffect } from 'react';
import { UploadState, DetectedElement } from '../types/studio';
import { analyzeImage, generateDualSearchQueries } from '../utils/imageAnalysis';
import { ProjectService } from '../services/projectService';
import { combinedSearchService } from '../services/combinedSearch';
import { ApiUsageService } from '../services/apiUsageService';

export const useImageUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({ 
    status: 'idle',
    detectedElements: [] // Always initialize as empty array
  });
  const [expandedElements, setExpandedElements] = useState<string[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [apiLimits, setApiLimits] = useState<{amazon: boolean, etsy: boolean}>({
    amazon: true,
    etsy: true
  });

  // Check API limits on component mount
  useEffect(() => {
    const checkApiLimits = async () => {
      try {
        const amazonLimit = await ApiUsageService.checkApiUsageLimit('amazon');
        const etsyLimit = await ApiUsageService.checkApiUsageLimit('etsy');
        
        setApiLimits({
          amazon: amazonLimit,
          etsy: etsyLimit
        });
      } catch (error) {
        console.error('Error checking API limits:', error);
      }
    };
    
    checkApiLimits();
  }, []);

  const processImage = async (file: File) => {
    try {
      setUploadState({
        status: 'uploading',
        file,
        preview: URL.createObjectURL(file),
        detectedElements: [] // Ensure it's always an array
      });

      setUploadState(prev => ({ ...prev, status: 'analyzing' }));
      const elements = await analyzeImage(file);

      const detectedElements: DetectedElement[] = [];
      
      for (const element of elements) {
        const dualQueries = await generateDualSearchQueries(element);
        detectedElements.push({
          name: element,
          amazonQueries: dualQueries.amazonQueries,
          etsyQueries: dualQueries.etsyQueries,
          status: 'idle' // Initialize with idle status
        });
      }

      setUploadState(prev => ({
        ...prev,
        status: 'complete',
        detectedElements
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadState(prev => ({ 
        ...prev, 
        status: 'error',
        error: 'Failed to analyze image. Please try again.',
        detectedElements: [] // Ensure it's always an array even on error
      }));
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await processImage(file);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImage(file);
    }
  }, []);

  const toggleElement = (elementName: string) => {
    setExpandedElements(prev =>
      prev.includes(elementName)
        ? prev.filter(name => name !== elementName)
        : [...prev, elementName]
    );
  };

  const updateSelectedQuery = (elementName: string, query: string, marketplace: 'amazon' | 'etsy') => {
    setUploadState(prev => ({
      ...prev,
      detectedElements: prev.detectedElements.map(element =>
        element.name === elementName
          ? marketplace === 'amazon'
            ? { ...element, selectedAmazonQuery: query }
            : { ...element, selectedEtsyQuery: query }
          : element
      )
    }));
  };

  const selectAllElements = () => {
    if (!uploadState.detectedElements.length) return;
    
    setUploadState(prev => ({
      ...prev,
      detectedElements: prev.detectedElements.map(element => ({
        ...element,
        selectedAmazonQuery: apiLimits.amazon ? element.amazonQueries[0] : undefined,
        selectedEtsyQuery: apiLimits.etsy ? element.etsyQueries[0] : undefined
      }))
    }));
  };

  const clearImage = () => {
    if (uploadState.preview) {
      URL.revokeObjectURL(uploadState.preview);
    }
    setUploadState({ 
      status: 'idle',
      detectedElements: [] // Always initialize as empty array
    });
    setExpandedElements([]);
  };

  const hasSelectedQueries = uploadState.detectedElements.some(
    element => element.selectedAmazonQuery || element.selectedEtsyQuery
  );

  // Updated to perform individual searches for each element with dual marketplace support
  const createNewProject = async (
    projects: any[], 
    setProjects: (fn: (prev: any[]) => any[]) => void,
    canCreate: boolean = true
  ) => {
    if (!canCreate) {
      return;
    }

    if (!uploadState.preview || !uploadState.detectedElements.length || !uploadState.file) return;

    try {
      setIsCreatingProject(true);
      
      // Store current upload state before clearing
      const currentUploadState = { ...uploadState };
      
      // Update elements to show searching status
      setUploadState(prev => ({
        ...prev,
        detectedElements: prev.detectedElements.map(element => 
          element.selectedAmazonQuery || element.selectedEtsyQuery
            ? { ...element, status: 'searching' } 
            : element
        )
      }));
      
      // Create temporary project for immediate display
      const tempProject = {
        id: `temp-${Date.now()}`,
        name: `Design Project ${projects.length + 1}`,
        status: 'analyzing' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'temp',
        description: null,
        image_url: null,
        image_file_name: currentUploadState.file.name,
        isTemporary: true
      };

      // Add to local state immediately
      setProjects(prev => [tempProject, ...prev]);

      // Process in background
      setTimeout(async () => {
        try {
          // Prepare elements with selected queries
          const elementsToCreate = currentUploadState.detectedElements
            .filter(element => element.selectedAmazonQuery || element.selectedEtsyQuery)
            .map(element => ({
              name: element.name,
              search_queries: {
                amazon: element.amazonQueries,
                etsy: element.etsyQueries
              },
              selected_amazon_query: element.selectedAmazonQuery,
              selected_etsy_query: element.selectedEtsyQuery
            }));

          // Create project with individual searches
          const { project, products } = await ProjectService.createProjectWithSearch(
            {
              name: tempProject.name,
              image_file_name: currentUploadState.file.name,
              status: 'analyzing'
            },
            currentUploadState.file,
            elementsToCreate
          );

          // Replace temporary project with real one
          setProjects(prev => prev.map(p => 
            p.id === tempProject.id ? project : p
          ));
          
          // Clear the upload state after successful creation
          clearImage();
        } catch (error) {
          console.error('Error creating project:', error);
          
          // Update elements to show error status
          setUploadState(prev => ({
            ...prev,
            detectedElements: prev.detectedElements.map(element => 
              element.status === 'searching'
                ? { ...element, status: 'error', errorMessage: 'Failed to search for products' }
                : element
            )
          }));
          
          // Remove temporary project on error
          setProjects(prev => prev.filter(p => p.id !== tempProject.id));
        } finally {
          setIsCreatingProject(false);
        }
      }, 100);

    } catch (error) {
      console.error('Error in createNewProject:', error);
      setIsCreatingProject(false);
    }
  };

  return {
    uploadState,
    expandedElements,
    isCreatingProject,
    apiLimits,
    handleDrop,
    handleFileSelect,
    toggleElement,
    updateSelectedQuery,
    selectAllElements,
    clearImage,
    hasSelectedQueries,
    createNewProject
  };
};