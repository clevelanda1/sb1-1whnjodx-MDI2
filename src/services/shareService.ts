import { supabase } from '../lib/supabase';
import { UnifiedProduct } from './combinedSearch';

export interface SharedCollection {
  id: string;
  project_id: string;
  project_name: string;
  share_token: string;
  products: UnifiedProduct[];
  created_at: string;
  expires_at: string | null;
  view_count: number;
}

export interface SharedCollectionPublic {
  id: string;
  project_name: string;
  products: UnifiedProduct[];
  created_at: string;
  view_count: number;
}

export class ShareService {
  // Generate a unique share token
  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create a shareable link for a project's products
  static async createSharedCollection(
    projectId: string,
    projectName: string,
    products: UnifiedProduct[],
    expiresInDays?: number
  ): Promise<{ shareUrl: string; shareToken: string }> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const shareToken = this.generateShareToken();
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Store the shared collection in the database
      const { data, error } = await supabase
        .from('shared_collections')
        .insert({
          project_id: projectId,
          project_name: projectName,
          share_token: shareToken,
          user_id: session.user.id,
          products_data: products,
          expires_at: expiresAt,
          view_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shared collection:', error);
        throw new Error(`Failed to create shared collection: ${error.message}`);
      }

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      return {
        shareUrl,
        shareToken
      };
    } catch (error: any) {
      console.error('Error in createSharedCollection:', error);
      throw new Error(error.message || 'Failed to create shareable link');
    }
  }

  // Get a shared collection by token (public access)
  static async getSharedCollection(shareToken: string): Promise<SharedCollectionPublic | null> {
    try {
      const { data, error } = await supabase
        .from('shared_collections')
        .select('*')
        .eq('share_token', shareToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Collection not found
        }
        console.error('Error fetching shared collection:', error);
        throw new Error(`Failed to fetch shared collection: ${error.message}`);
      }

      // Check if collection has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null; // Collection has expired
      }

      // Increment view count
      await supabase
        .from('shared_collections')
        .update({ view_count: data.view_count + 1 })
        .eq('share_token', shareToken);

      return {
        id: data.id,
        project_name: data.project_name,
        products: data.products_data || [],
        created_at: data.created_at,
        view_count: data.view_count + 1
      };
    } catch (error: any) {
      console.error('Error in getSharedCollection:', error);
      throw new Error(error.message || 'Failed to fetch shared collection');
    }
  }

  // Get user's shared collections
  static async getUserSharedCollections(): Promise<SharedCollection[]> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('shared_collections')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user shared collections:', error);
        throw new Error(`Failed to fetch shared collections: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        project_id: item.project_id,
        project_name: item.project_name,
        share_token: item.share_token,
        products: item.products_data || [],
        created_at: item.created_at,
        expires_at: item.expires_at,
        view_count: item.view_count
      }));
    } catch (error: any) {
      console.error('Error in getUserSharedCollections:', error);
      throw new Error(error.message || 'Failed to fetch shared collections');
    }
  }

  // Delete a shared collection
  static async deleteSharedCollection(shareToken: string): Promise<void> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('shared_collections')
        .delete()
        .eq('share_token', shareToken)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting shared collection:', error);
        throw new Error(`Failed to delete shared collection: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deleteSharedCollection:', error);
      throw new Error(error.message || 'Failed to delete shared collection');
    }
  }

  // Copy share URL to clipboard
  static async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }
}