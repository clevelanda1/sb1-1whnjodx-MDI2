import { supabase } from '../lib/supabase';
import { Project, ProjectInsert, ProjectUpdate, ProjectElement, ProjectElementInsert, ProjectElementUpdate, ProjectProduct, ProjectProductInsert, DualSearchQueries } from '../lib/supabase';
import { combinedSearchService, UnifiedProduct } from './combinedSearch';
import { DetectedElement } from '../types/studio';
import { ElementWithProducts } from '../types/curation';

export class ProjectService {
  // Helper method to check authentication
  private static async ensureAuthenticated() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth session error:', error);
        throw new Error('Authentication error. Please sign in again.');
      }
      
      if (!session?.user) {
        throw new Error('User not authenticated. Please sign in.');
      }
      
      return session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      throw new Error('Authentication check failed. Please sign in again.');
    }
  }

  // Project CRUD operations
  static async createProject(projectData: Omit<ProjectInsert, 'user_id'>): Promise<Project> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw new Error(`Failed to create project: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from project creation');
      }

      return data;
    } catch (error: any) {
      console.error('Error in createProject:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  // Create project with individual searches for each element
  static async createProjectWithSearch(
    projectData: Omit<ProjectInsert, 'user_id'>,
    imageFile: File,
    elements: Omit<ProjectElementInsert, 'project_id'>[]
  ): Promise<{ project: Project; products: UnifiedProduct[] }> {
    try {
      console.log('Starting project creation with individual element searches...');

      // 1. Get or create project (if it already exists, update it)
      let project: Project;
      
      // Check if this is an update to an existing project
      const session = await this.ensureAuthenticated();
      const { data: existingProject, error: existingProjectError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('name', projectData.name)
        .eq('status', 'analyzing')
        .maybeSingle();

      if (existingProjectError) {
        console.error('Error checking for existing project:', existingProjectError);
        throw new Error(`Failed to check for existing project: ${existingProjectError.message}`);
      }

      if (existingProject) {
        // Update existing project
        project = existingProject;
        console.log('Using existing project:', project.id);
      } else {
        // Create new project
        project = await this.createProject({
          ...projectData,
          status: 'analyzing'
        });
        console.log('Project created:', project.id);
      }

      // 2. Try to upload image (but don't fail if it doesn't work)
      let imageUrl: string | null = null;
      try {
        console.log('Attempting to upload image...');
        imageUrl = await this.uploadProjectImage(imageFile, project.id);
        console.log('Image uploaded successfully:', imageUrl);
      } catch (imageError) {
        console.warn('Image upload failed, continuing without image:', imageError);
        // Continue with project creation even if image upload fails
      }

      // 3. Update project with image URL (if we have one)
      const updatedProject = await this.updateProject(project.id, {
        image_url: imageUrl,
        status: 'analyzing'
      });

      // 4. Create project elements
      let createdElements: ProjectElement[] = [];
      if (elements.length > 0) {
        console.log('Creating project elements...');
        createdElements = await this.createProjectElements(project.id, elements);
        console.log('Elements created:', createdElements.length);
      }

      // 5. Perform individual searches for each element with a selected query
      let allProducts: UnifiedProduct[] = [];
      
      // Process each element that has a selected query
      for (const element of createdElements) {
        if (!element.selected_amazon_query && !element.selected_etsy_query) {
          console.log(`Element ${element.name} has no selected queries, skipping search`);
          continue;
        }
        
        try {
          console.log(`Processing element: ${element.name}`);
          let elementProducts: UnifiedProduct[] = [];
          
          // Perform Amazon search if a query is selected
          if (element.selected_amazon_query) {
            console.log(`Searching Amazon for element ${element.name} with query: ${element.selected_amazon_query}`);
            const amazonProducts = await combinedSearchService.searchSingleMarketplace(
              'amazon',
              element.selected_amazon_query,
              element.id
            );
            elementProducts = [...elementProducts, ...amazonProducts];
            console.log(`Found ${amazonProducts.length} Amazon products for element ${element.name}`);
          }
          
          // Perform Etsy search if a query is selected
          if (element.selected_etsy_query) {
            console.log(`Searching Etsy for element ${element.name} with query: ${element.selected_etsy_query}`);
            const etsyProducts = await combinedSearchService.searchSingleMarketplace(
              'etsy',
              element.selected_etsy_query,
              element.id
            );
            elementProducts = [...elementProducts, ...etsyProducts];
            console.log(`Found ${etsyProducts.length} Etsy products for element ${element.name}`);
          }
          
          // Store products in database with element ID
          if (elementProducts.length > 0) {
            await this.storeProductsForElement(project.id, element.id, elementProducts);
            
            // Add products to the combined results
            allProducts = [...allProducts, ...elementProducts];
          }
        } catch (searchError) {
          console.error(`Error searching for element ${element.name}:`, searchError);
          // Continue with other elements even if one fails
        }
      }

      // 6. Update project status to complete
      const finalProject = await this.updateProject(project.id, { 
        status: 'complete' 
      });

      console.log('Project creation completed successfully');

      return {
        project: finalProject,
        products: allProducts
      };

    } catch (error: any) {
      console.error('Error creating project with search:', error);
      throw new Error(error.message || 'Failed to create project. Please try again.');
    }
  }

  // Store products for a specific element
  static async storeProductsForElement(
    projectId: string, 
    elementId: string, 
    products: UnifiedProduct[]
  ): Promise<ProjectProduct[]> {
    try {
      console.log(`Storing ${products.length} products for element ${elementId}`);
      
      // Filter out products with missing or invalid ASIN
      const validProducts = products.filter(product => 
        product.asin && product.asin.trim() !== '' && 
        product.title && product.title.trim() !== ''
      );
      
      if (validProducts.length === 0) {
        console.warn('No valid products to store (all products missing required ASIN or title)');
        return [];
      }
      
      const productInserts: ProjectProductInsert[] = validProducts.map(product => ({
        project_id: projectId,
        project_element_id: elementId,
        asin: product.asin,
        title: product.title,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        reviews_count: product.reviews_count,
        image: product.image,
        url: product.url,
        source: product.source
      }));

      const { data, error } = await supabase
        .from('project_products')
        .insert(productInserts)
        .select();

      if (error) {
        console.error('Error storing products for element:', error);
        throw new Error(`Failed to store products for element: ${error.message}`);
      }

      console.log(`Successfully stored ${data?.length || 0} products for element ${elementId}`);
      return data || [];
    } catch (error: any) {
      console.error('Error in storeProductsForElement:', error);
      throw new Error(error.message || 'Failed to store products for element');
    }
  }

  // Get products for a specific element
  static async getProductsForElement(elementId: string): Promise<UnifiedProduct[]> {
    try {
      const { data, error } = await supabase
        .from('project_products')
        .select('*')
        .eq('project_element_id', elementId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching products for element:', error);
        throw new Error(`Failed to fetch products for element: ${error.message}`);
      }

      // Convert stored products to UnifiedProduct format
      return (data || []).map(product => ({
        title: product.title,
        price: product.price || 0,
        currency: product.currency || 'USD',
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        image: product.image || '',
        url: product.url || '',
        id: product.asin,
        asin: product.asin, // Ensure asin is explicitly set
        source: product.source as 'amazon' | 'etsy',
        elementId: product.project_element_id || undefined,
        originalData: {
          title: product.title,
          price: product.price || 0,
          currency: product.currency || 'USD',
          rating: product.rating || 0,
          reviewsCount: product.reviews_count || 0,
          image: product.image || '',
          url: product.url || '',
          asin: product.asin,
        }
      }));
    } catch (error: any) {
      console.error('Error in getProductsForElement:', error);
      throw new Error(error.message || 'Failed to fetch products for element');
    }
  }

  // Get all products for a project
  static async getProjectProducts(projectId: string): Promise<UnifiedProduct[]> {
    try {
      const { data, error } = await supabase
        .from('project_products')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching project products:', error);
        throw new Error(`Failed to fetch project products: ${error.message}`);
      }

      // Convert stored products to UnifiedProduct format
      return (data || []).map(product => ({
        title: product.title,
        price: product.price || 0,
        currency: product.currency || 'USD',
        rating: product.rating || 0,
        reviews_count: product.reviews_count || 0,
        image: product.image || '',
        url: product.url || '',
        id: product.asin,
        asin: product.asin, // Ensure asin is explicitly set
        source: product.source as 'amazon' | 'etsy',
        elementId: product.project_element_id || undefined,
        originalData: {
          title: product.title,
          price: product.price || 0,
          currency: product.currency || 'USD',
          rating: product.rating || 0,
          reviewsCount: product.reviews_count || 0,
          image: product.image || '',
          url: product.url || '',
          asin: product.asin,
        }
      }));
    } catch (error: any) {
      console.error('Error in getProjectProducts:', error);
      throw new Error(error.message || 'Failed to fetch project products');
    }
  }

  // Get project with elements and their products
  static async getProjectWithProductsData(projectId: string): Promise<{
    project: Project;
    elements: ProjectElement[];
    products: UnifiedProduct[];
    searchQueries: DualSearchQueries;
  } | null> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        return null;
      }

      // Get all elements for the project
      const elements = await this.getProjectElements(projectId);
      console.log(`Found ${elements.length} elements for project ${projectId}`);
      
      // Initialize combined search queries
      const searchQueries: DualSearchQueries = { amazon: [], etsy: [] };
      
      // Get products for each element and aggregate them
      let allProducts: UnifiedProduct[] = [];
      
      for (const element of elements) {
        try {
          // Get products specifically for this element
          const elementProducts = await this.getProductsForElement(element.id);
          console.log(`Found ${elementProducts.length} products for element ${element.name}`);
          
          // Add products to the combined results
          allProducts = [...allProducts, ...elementProducts];
          
          // Aggregate search queries
          if (element.search_queries) {
            if (element.search_queries.amazon && Array.isArray(element.search_queries.amazon)) {
              searchQueries.amazon.push(...element.search_queries.amazon);
            }
            if (element.search_queries.etsy && Array.isArray(element.search_queries.etsy)) {
              searchQueries.etsy.push(...element.search_queries.etsy);
            }
          }
        } catch (elementError) {
          console.warn(`Error getting products for element ${element.name}:`, elementError);
          // Continue with other elements even if one fails
        }
      }
      
      console.log(`Total products found for project: ${allProducts.length}`);

      return {
        project,
        elements,
        products: allProducts,
        searchQueries,
      };
    } catch (error: any) {
      console.error('Error getting project with products data:', error);
      throw new Error(error.message || 'Failed to get project data');
    }
  }

  // Get elements with their products
  static async getElementsWithProducts(projectId: string): Promise<ElementWithProducts[]> {
    try {
      // Get project elements
      const { data: elements, error: elementsError } = await supabase
        .from('project_elements')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (elementsError) {
        console.error('Error fetching project elements:', elementsError);
        throw new Error(`Failed to fetch project elements: ${elementsError.message}`);
      }

      if (!elements || elements.length === 0) {
        return [];
      }

      // Get products for each element
      const elementsWithProducts: ElementWithProducts[] = [];
      
      for (const element of elements) {
        try {
          const products = await this.getProductsForElement(element.id);
          elementsWithProducts.push({
            ...element,
            products
          });
        } catch (error) {
          console.error(`Error getting products for element ${element.id}:`, error);
          // Add element with empty products array
          elementsWithProducts.push({
            ...element,
            products: []
          });
        }
      }
      
      return elementsWithProducts;
    } catch (error: any) {
      console.error('Error in getElementsWithProducts:', error);
      throw new Error(error.message || 'Failed to get elements with products');
    }
  }

  // Refresh products for a specific element
  static async refreshElementProducts(elementId: string): Promise<UnifiedProduct[]> {
    try {
      const element = await this.getProjectElement(elementId);
      if (!element || (!element.selected_amazon_query && !element.selected_etsy_query)) {
        console.log(`Element ${elementId} not found or has no selected queries`);
        return [];
      }
      
      // Delete existing products for this element
      await supabase
        .from('project_products')
        .delete()
        .eq('project_element_id', elementId);
      
      let elementProducts: UnifiedProduct[] = [];
      
      // Perform Amazon search if a query is selected
      if (element.selected_amazon_query) {
        console.log(`Searching Amazon for element ${element.name} with query: ${element.selected_amazon_query}`);
        const amazonProducts = await combinedSearchService.searchSingleMarketplace(
          'amazon',
          element.selected_amazon_query,
          element.id
        );
        elementProducts = [...elementProducts, ...amazonProducts];
        console.log(`Found ${amazonProducts.length} Amazon products for element ${element.name}`);
      }
      
      // Perform Etsy search if a query is selected
      if (element.selected_etsy_query) {
        console.log(`Searching Etsy for element ${element.name} with query: ${element.selected_etsy_query}`);
        const etsyProducts = await combinedSearchService.searchSingleMarketplace(
          'etsy',
          element.selected_etsy_query,
          element.id
        );
        elementProducts = [...elementProducts, ...etsyProducts];
        console.log(`Found ${etsyProducts.length} Etsy products for element ${element.name}`);
      }
      
      // Store products in database with element ID
      if (elementProducts.length > 0) {
        await this.storeProductsForElement(element.project_id, element.id, elementProducts);
      }
      
      return elementProducts;
    } catch (error: any) {
      console.error(`Error refreshing products for element ${elementId}:`, error);
      throw new Error(error.message || 'Failed to refresh products for element');
    }
  }

  // Refresh all products for a project
  static async refreshProjectProducts(projectId: string): Promise<UnifiedProduct[]> {
    try {
      const elements = await this.getProjectElements(projectId);
      console.log(`Refreshing products for ${elements.length} elements in project ${projectId}`);
      
      // Process each element with a selected query
      let allProducts: UnifiedProduct[] = [];
      
      for (const element of elements) {
        if (!element.selected_amazon_query && !element.selected_etsy_query) {
          console.log(`Element ${element.name} has no selected queries, skipping refresh`);
          continue;
        }
        
        try {
          const products = await this.refreshElementProducts(element.id);
          allProducts = [...allProducts, ...products];
        } catch (elementError) {
          console.warn(`Error refreshing products for element ${element.name}:`, elementError);
          // Continue with other elements even if one fails
        }
      }
      
      console.log(`Refreshed a total of ${allProducts.length} products for project ${projectId}`);
      return allProducts;
    } catch (error: any) {
      console.error('Error refreshing project products:', error);
      throw new Error(error.message || 'Failed to refresh products for project');
    }
  }

  static async getProjects(): Promise<Project[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getProjects:', error);
      throw new Error(error.message || 'Failed to fetch projects');
    }
  }

  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Project not found
        }
        console.error('Error fetching project:', error);
        throw new Error(`Failed to fetch project: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getProject:', error);
      if (error.message.includes('not authenticated')) {
        throw error;
      }
      throw new Error(error.message || 'Failed to fetch project');
    }
  }

  static async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw new Error(`Failed to update project: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from project update');
      }

      return data;
    } catch (error: any) {
      console.error('Error in updateProject:', error);
      throw new Error(error.message || 'Failed to update project');
    }
  }

  static async deleteProject(projectId: string): Promise<void> {
    try {
      const session = await this.ensureAuthenticated();

      // First, try to delete the associated image from storage
      try {
        const project = await this.getProject(projectId);
        if (project?.image_url) {
          // Extract filename from URL and delete from storage
          const urlParts = project.image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          if (fileName) {
            await supabase.storage
              .from('project-images')
              .remove([fileName]);
          }
        }
      } catch (storageError) {
        console.warn('Failed to delete project image from storage:', storageError);
        // Continue with project deletion even if image deletion fails
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting project:', error);
        throw new Error(`Failed to delete project: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      throw new Error(error.message || 'Failed to delete project');
    }
  }

  // Project Elements CRUD operations
  static async createProjectElements(projectId: string, elements: Omit<ProjectElementInsert, 'project_id'>[]): Promise<ProjectElement[]> {
    try {
      const elementsWithProjectId = elements.map(element => ({
        ...element,
        project_id: projectId,
      }));

      const { data, error } = await supabase
        .from('project_elements')
        .insert(elementsWithProjectId)
        .select();

      if (error) {
        console.error('Error creating project elements:', error);
        throw new Error(`Failed to create project elements: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in createProjectElements:', error);
      throw new Error(error.message || 'Failed to create project elements');
    }
  }

  static async getProjectElements(projectId: string): Promise<ProjectElement[]> {
    try {
      const { data, error } = await supabase
        .from('project_elements')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching project elements:', error);
        throw new Error(`Failed to fetch project elements: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getProjectElements:', error);
      throw new Error(error.message || 'Failed to fetch project elements');
    }
  }

  static async getProjectElement(elementId: string): Promise<ProjectElement | null> {
    try {
      const { data, error } = await supabase
        .from('project_elements')
        .select('*')
        .eq('id', elementId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Element not found
        }
        console.error('Error fetching project element:', error);
        throw new Error(`Failed to fetch project element: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in getProjectElement:', error);
      throw new Error(error.message || 'Failed to fetch project element');
    }
  }

  static async updateProjectElement(elementId: string, updates: ProjectElementUpdate): Promise<ProjectElement> {
    try {
      const { data, error } = await supabase
        .from('project_elements')
        .update(updates)
        .eq('id', elementId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project element:', error);
        throw new Error(`Failed to update project element: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from project element update');
      }

      return data;
    } catch (error: any) {
      console.error('Error in updateProjectElement:', error);
      throw new Error(error.message || 'Failed to update project element');
    }
  }

  static async deleteProjectElement(elementId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_elements')
        .delete()
        .eq('id', elementId);

      if (error) {
        console.error('Error deleting project element:', error);
        throw new Error(`Failed to delete project element: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deleteProjectElement:', error);
      throw new Error(error.message || 'Failed to delete project element');
    }
  }

  // Enhanced image upload functionality with better error handling
  static async uploadProjectImage(file: File, projectId: string): Promise<string> {
    try {
      console.log('Starting image upload for project:', projectId);
      
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image smaller than 10MB.');
      }

      // Create simple filename without nested folders
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const fileName = `${projectId}-${timestamp}.${fileExt}`;

      console.log('Uploading file:', fileName);

      // Upload to storage with proper options
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        
        // Handle specific error cases
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket not configured. Please contact support.');
        } else if (uploadError.message?.includes('Duplicate')) {
          // If duplicate, try with a different timestamp
          const newFileName = `${projectId}-${timestamp}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('project-images')
            .upload(newFileName, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (retryError) {
            throw new Error(`Upload failed: ${retryError.message}`);
          }
          
          uploadData.path = retryData.path;
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      if (!uploadData?.path) {
        throw new Error('Upload succeeded but no file path returned');
      }

      console.log('File uploaded successfully:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL for uploaded image');
      }

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error: any) {
      console.error('Image upload failed:', error);
      
      // Re-throw with user-friendly message
      if (error.message?.includes('Storage bucket not configured')) {
        throw error;
      } else if (error.message?.includes('Invalid file type')) {
        throw error;
      } else if (error.message?.includes('File too large')) {
        throw error;
      } else {
        throw new Error(error.message || 'Failed to upload image. Please try again.');
      }
    }
  }

  // Get project with elements (for detailed view)
  static async getProjectWithElements(projectId: string): Promise<{
    project: Project;
    elements: ProjectElement[];
  } | null> {
    try {
      const project = await this.getProject(projectId);
      if (!project) {
        return null;
      }

      const elements = await this.getProjectElements(projectId);

      return {
        project,
        elements,
      };
    } catch (error: any) {
      console.error('Error in getProjectWithElements:', error);
      throw new Error(error.message || 'Failed to get project with elements');
    }
  }

  // Bulk update selected queries for elements
  static async updateSelectedQueries(updates: { elementId: string; selectedAmazonQuery?: string | null; selectedEtsyQuery?: string | null }[]): Promise<void> {
    try {
      const promises = updates.map(({ elementId, selectedAmazonQuery, selectedEtsyQuery }) =>
        this.updateProjectElement(elementId, { 
          selected_amazon_query: selectedAmazonQuery,
          selected_etsy_query: selectedEtsyQuery
        })
      );

      await Promise.all(promises);
    } catch (error: any) {
      console.error('Error in updateSelectedQueries:', error);
      throw new Error(error.message || 'Failed to update selected queries');
    }
  }
}