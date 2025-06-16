import { supabase, LikedProduct, LikedProductInsert, Project } from '../lib/supabase';
import { UnifiedProduct } from '../services/combinedSearch';

export class LikedProductsService {
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

  // Add product to liked products - Updated to accept UnifiedProduct and track source
  static async likeProduct(projectId: string, product: UnifiedProduct): Promise<LikedProduct> {
    try {
      const session = await this.ensureAuthenticated();

      // Ensure product has a valid asin/id
      if (!product.id || product.id.trim() === '') {
        console.error('Cannot like product with empty ID:', product);
        throw new Error('Product ID is missing or invalid');
      }

      const likedProduct: LikedProductInsert = {
        user_id: session.user.id,
        project_id: projectId,
        asin: product.id, // Use unified ID as ASIN for storage
        title: product.title,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        reviews_count: product.reviews_count,
        image: product.image,
        url: product.url,
        source: product.source, // Track the marketplace source
      };

      const { data, error } = await supabase
        .from('liked_products')
        .insert(likedProduct)
        .select()
        .single();

      if (error) {
        console.error('Error liking product:', error);
        throw new Error(`Failed to like product: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in likeProduct:', error);
      throw new Error(error.message || 'Failed to like product');
    }
  }

  // Remove product from liked products
  static async unlikeProduct(projectId: string, productId: string): Promise<void> {
    try {
      const session = await this.ensureAuthenticated();

      const { error } = await supabase
        .from('liked_products')
        .delete()
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .eq('asin', productId); // Use productId as ASIN

      if (error) {
        console.error('Error unliking product:', error);
        throw new Error(`Failed to unlike product: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in unlikeProduct:', error);
      throw new Error(error.message || 'Failed to unlike product');
    }
  }

  // Check if product is liked
  static async isProductLiked(projectId: string, productId: string): Promise<boolean> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('liked_products')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .eq('asin', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking if product is liked:', error);
        return false;
      }

      return !!data;
    } catch (error: any) {
      console.error('Error in isProductLiked:', error);
      return false;
    }
  }

  // Get all liked products for user
  static async getLikedProducts(): Promise<LikedProduct[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('liked_products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked products:', error);
        throw new Error(`Failed to fetch liked products: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getLikedProducts:', error);
      throw new Error(error.message || 'Failed to fetch liked products');
    }
  }

  // Get liked products for a specific project
  static async getLikedProductsForProject(projectId: string): Promise<LikedProduct[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('liked_products')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked products for project:', error);
        throw new Error(`Failed to fetch liked products: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getLikedProductsForProject:', error);
      throw new Error(error.message || 'Failed to fetch liked products for project');
    }
  }

  // Get liked products with project information
  static async getLikedProductsWithProjects(): Promise<(LikedProduct & { project: Project })[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('liked_products')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked products with projects:', error);
        throw new Error(`Failed to fetch liked products: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getLikedProductsWithProjects:', error);
      throw new Error(error.message || 'Failed to fetch liked products with projects');
    }
  }

  // Get unique projects that have liked products
  static async getProjectsWithLikedProducts(): Promise<Project[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('liked_products')
        .select(`
          project:projects(*)
        `)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching projects with liked products:', error);
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      // Extract unique projects
      const projects = data?.map(item => item.project).filter(Boolean) || [];
      const uniqueProjects = projects.filter((project, index, self) => 
        index === self.findIndex(p => p.id === project.id)
      );

      return uniqueProjects;
    } catch (error: any) {
      console.error('Error in getProjectsWithLikedProducts:', error);
      throw new Error(error.message || 'Failed to fetch projects with liked products');
    }
  }

  // Convert LikedProduct to UnifiedProduct format
  static likedProductToUnifiedProduct(likedProduct: LikedProduct): UnifiedProduct {
    return {
      title: likedProduct.title,
      price: likedProduct.price || 0,
      currency: likedProduct.currency || 'USD',
      rating: likedProduct.rating || 0,
      reviews_count: likedProduct.reviews_count || 0,
      image: likedProduct.image || '',
      url: likedProduct.url || '',
      id: likedProduct.asin,
      asin: likedProduct.asin, // Ensure asin is explicitly set
      source: (likedProduct.source as 'amazon' | 'etsy') || 'amazon', // Use stored source or default to amazon
      originalData: {
        title: likedProduct.title,
        price: likedProduct.price || 0,
        currency: likedProduct.currency || 'USD',
        rating: likedProduct.rating || 0,
        reviewsCount: likedProduct.reviews_count || 0,
        image: likedProduct.image || '',
        url: likedProduct.url || '',
        asin: likedProduct.asin,
      }
    };
  }
}