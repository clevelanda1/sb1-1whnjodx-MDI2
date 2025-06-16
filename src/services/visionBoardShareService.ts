import { supabase } from '../lib/supabase';
import { VisionBoardItem } from '../types/visionboard';
import { StripeService } from '../services/stripeService';
import { WhiteLabelService } from './whiteLabelService';

export interface SharedVisionBoardData {
  items: VisionBoardItem[];
  totalBudget: number;
  createdAt: string;
}

export interface SharedVisionBoard {
  id: string;
  share_token: string;
  board_name: string;
  board_data: SharedVisionBoardData;
  total_budget: number;
  view_count: number;
  created_at: string;
  expires_at: string | null;
  creator_subscription_tier?: string; // Added field for creator's subscription tier
  creator_id?: string; // Added field to store the creator's user ID
}

export interface PublicSharedVisionBoard {
  id: string;
  board_name: string;
  board_data: SharedVisionBoardData;
  total_budget: number;
  view_count: number;
  created_at: string;
  creator_subscription_tier?: string; // Added field for creator's subscription tier
  creator_id?: string; // Added field to store the creator's user ID
}

export class VisionBoardShareService {
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

  // Generate a unique share token
  private static generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create a shareable link for a saved vision board
  static async createSharedVisionBoard(
    savedBoardId: string,
    expiresInDays?: number
  ): Promise<{ shareUrl: string; shareToken: string }> {
    try {
      const session = await this.ensureAuthenticated();

      // First, get the saved vision board
      const { data: savedBoard, error: fetchError } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('id', savedBoardId)
        .eq('user_id', session.user.id)
        .eq('is_saved', true)
        .single();

      if (fetchError || !savedBoard) {
        throw new Error('Saved vision board not found or you do not have permission to share it');
      }

      // Get the user's subscription tier
      const subscription = await StripeService.getUserSubscription();
      
      const shareToken = this.generateShareToken();
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create the shared vision board record
      const { data, error } = await supabase
        .from('shared_vision_boards')
        .insert({
          user_id: session.user.id,
          share_token: shareToken,
          board_name: savedBoard.name,
          board_data: savedBoard.board_data || {},
          total_budget: savedBoard.board_data?.totalBudget || 0,
          expires_at: expiresAt,
          view_count: 0,
          creator_subscription_tier: subscription.tier, // Store the creator's subscription tier
          creator_id: session.user.id // Store the creator's user ID
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shared vision board:', error);
        throw new Error(`Failed to create shareable link: ${error.message}`);
      }

      const shareUrl = `${window.location.origin}/shared-visionboard/${shareToken}`;
      
      return {
        shareUrl,
        shareToken
      };
    } catch (error: any) {
      console.error('Error in createSharedVisionBoard:', error);
      throw new Error(error.message || 'Failed to create shareable link');
    }
  }

  // Get a shared vision board by token (public access)
  static async getSharedVisionBoard(shareToken: string): Promise<PublicSharedVisionBoard | null> {
    try {
      const { data, error } = await supabase
        .from('shared_vision_boards')
        .select('*, creator_subscription_tier, creator_id') // Include creator_id
        .eq('share_token', shareToken)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Shared board not found
        }
        console.error('Error fetching shared vision board:', error);
        throw new Error(`Failed to fetch shared vision board: ${error.message}`);
      }

      // Check if the share has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null; // Share has expired
      }

      // Increment view count
      await supabase
        .from('shared_vision_boards')
        .update({ view_count: data.view_count + 1 })
        .eq('share_token', shareToken);

      return {
        id: data.id,
        board_name: data.board_name,
        board_data: data.board_data || { items: [], totalBudget: 0, createdAt: data.created_at },
        total_budget: data.total_budget,
        view_count: data.view_count + 1,
        created_at: data.created_at,
        creator_subscription_tier: data.creator_subscription_tier, // Include the creator's subscription tier
        creator_id: data.creator_id // Include the creator's user ID
      };
    } catch (error: any) {
      console.error('Error in getSharedVisionBoard:', error);
      throw new Error(error.message || 'Failed to fetch shared vision board');
    }
  }

  // Get user's shared vision boards
  static async getUserSharedVisionBoards(): Promise<SharedVisionBoard[]> {
    try {
      const session = await this.ensureAuthenticated();

      const { data, error } = await supabase
        .from('shared_vision_boards')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user shared vision boards:', error);
        throw new Error(`Failed to fetch shared vision boards: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getUserSharedVisionBoards:', error);
      throw new Error(error.message || 'Failed to fetch shared vision boards');
    }
  }

  // Delete a shared vision board
  static async deleteSharedVisionBoard(shareToken: string): Promise<void> {
    try {
      const session = await this.ensureAuthenticated();

      const { error } = await supabase
        .from('shared_vision_boards')
        .delete()
        .eq('share_token', shareToken)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting shared vision board:', error);
        throw new Error(`Failed to delete shared vision board: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deleteSharedVisionBoard:', error);
      throw new Error(error.message || 'Failed to delete shared vision board');
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