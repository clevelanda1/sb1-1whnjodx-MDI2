import { supabase } from '../lib/supabase';
import { VisionBoardItem as VisionBoardItemType } from '../types/visionboard';
import { LikedProductsService } from './likedProductsService';

export interface SavedVisionBoard {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  is_saved: boolean | null;
  board_data: {
    items: VisionBoardItemType[];
    totalBudget: number;
    createdAt: string;
  };
  preview_image_url: string | null;
}

export class VisionBoardService {
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

  // Save a vision board with its current state
  static async saveVisionBoard(
    boardName: string, 
    boardItems: VisionBoardItemType[], 
    totalBudget: number,
    previewImageUrl?: string
  ): Promise<SavedVisionBoard> {
    try {
      const session = await this.ensureAuthenticated();

      const boardData = {
        items: boardItems,
        totalBudget,
        createdAt: new Date().toISOString()
      };

      // Check if we're updating an existing board with the same name
      const { data: existingBoard, error: findError } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('name', boardName)
        .eq('is_saved', true)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error checking for existing board:', findError);
        throw new Error(`Failed to check for existing board: ${findError.message}`);
      }

      let result;

      if (existingBoard) {
        // Update existing board
        console.log('Updating existing board:', existingBoard.id);
        
        // First, delete all existing items for this board
        const { error: deleteItemsError } = await supabase
          .from('vision_board_items')
          .delete()
          .eq('vision_board_id', existingBoard.id);
          
        if (deleteItemsError) {
          console.error('Error deleting existing vision board items:', deleteItemsError);
          throw new Error(`Failed to update vision board items: ${deleteItemsError.message}`);
        }
        
        // Then, insert new items
        if (boardItems.length > 0) {
          await this.saveVisionBoardItems(existingBoard.id, boardItems);
        }
        
        // Update the board metadata
        const updates = {
          board_data: boardData, // Keep for backward compatibility
          updated_at: new Date().toISOString()
        };

        if (previewImageUrl) {
          updates.preview_image_url = previewImageUrl;
        }

        const { data, error } = await supabase
          .from('vision_boards')
          .update(updates)
          .eq('id', existingBoard.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating vision board:', error);
          throw new Error(`Failed to update vision board: ${error.message}`);
        }

        result = data;
      } else {
        // Create new board
        console.log('Creating new vision board');
        
        const visionBoardInsert = {
          user_id: session.user.id,
          name: boardName,
          description: `Vision board with ${boardItems.length} items`,
          board_data: boardData, // Keep for backward compatibility
          preview_image_url: previewImageUrl,
          is_saved: true
        };

        const { data, error } = await supabase
          .from('vision_boards')
          .insert(visionBoardInsert)
          .select()
          .single();

        if (error) {
          console.error('Error saving vision board:', error);
          throw new Error(`Failed to save vision board: ${error.message}`);
        }

        result = data;
        
        // Insert items for the new board
        if (boardItems.length > 0) {
          await this.saveVisionBoardItems(result.id, boardItems);
        }
      }

      // Return the saved board with items
      return {
        ...result,
        board_data: boardData
      };
    } catch (error: any) {
      console.error('Error in saveVisionBoard:', error);
      throw new Error(error.message || 'Failed to save vision board');
    }
  }

  // Update a vision board's name
  static async updateVisionBoardName(
    boardId: string,
    newName: string
  ): Promise<SavedVisionBoard> {
    try {
      const session = await this.ensureAuthenticated();

      // Update the board name
      const { data, error } = await supabase
        .from('vision_boards')
        .update({
          name: newName,
          updated_at: new Date().toISOString()
        })
        .eq('id', boardId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vision board name:', error);
        throw new Error(`Failed to update vision board name: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.error('Error in updateVisionBoardName:', error);
      throw new Error(error.message || 'Failed to update vision board name');
    }
  }

  // Save vision board items to the vision_board_items table
  private static async saveVisionBoardItems(
    visionBoardId: string,
    boardItems: VisionBoardItemType[]
  ): Promise<void> {
    try {
      console.log(`Saving ${boardItems.length} items for vision board ${visionBoardId}`);
      
      // For each board item, we need to find the corresponding liked_product_id
      const itemInserts = [];
      
      for (const item of boardItems) {
        // Get the liked product ID for this item
        const { data: likedProduct, error: likedProductError } = await supabase
          .from('liked_products')
          .select('id')
          .eq('asin', item.asin)
          .eq('user_id', (await this.ensureAuthenticated()).user.id)
          .maybeSingle();
          
        if (likedProductError) {
          console.error('Error finding liked product:', likedProductError);
          continue; // Skip this item but continue with others
        }
        
        if (!likedProduct) {
          console.warn(`Liked product not found for asin ${item.asin}, creating it now`);
          
          // If the liked product doesn't exist, create it
          try {
            const unifiedProduct = LikedProductsService.likedProductToUnifiedProduct(item);
            const newLikedProduct = await LikedProductsService.likeProduct(item.project_id, unifiedProduct);
            
            // Now add the item with the new liked product ID
            itemInserts.push({
              vision_board_id: visionBoardId,
              liked_product_id: newLikedProduct.id,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              rotation: item.rotation,
              z_index: 1 // Default z-index
            });
          } catch (createError) {
            console.error('Error creating liked product:', createError);
            continue; // Skip this item but continue with others
          }
        } else {
          // Add the item with the existing liked product ID
          itemInserts.push({
            vision_board_id: visionBoardId,
            liked_product_id: likedProduct.id,
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rotation: item.rotation,
            z_index: 1 // Default z-index
          });
        }
      }
      
      // Insert all items in a single batch
      if (itemInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('vision_board_items')
          .insert(itemInserts);
          
        if (insertError) {
          console.error('Error inserting vision board items:', insertError);
          throw new Error(`Failed to save vision board items: ${insertError.message}`);
        }
        
        console.log(`Successfully saved ${itemInserts.length} vision board items`);
      }
    } catch (error: any) {
      console.error('Error in saveVisionBoardItems:', error);
      throw new Error(error.message || 'Failed to save vision board items');
    }
  }

  // Get all saved vision boards for the current user
  static async getSavedVisionBoards(): Promise<SavedVisionBoard[]> {
    try {
      console.log('🔍 getSavedVisionBoards: Starting to fetch saved vision boards');
      const session = await this.ensureAuthenticated();
      console.log('🔑 getSavedVisionBoards: User authenticated:', session.user.id);

      // Directly fetch vision boards with their board_data
      // This is the key change - we're no longer fetching detailed items for each board
      const { data, error } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_saved', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ getSavedVisionBoards: Error fetching saved vision boards:', error);
        throw new Error(`Failed to fetch saved vision boards: ${error.message}`);
      }

      console.log(`📋 getSavedVisionBoards: Found ${data?.length || 0} saved boards`);
      
      // Return the boards with their board_data, ensuring totalBudget exists
      return (data || []).map(board => {
        // Initialize board_data if it doesn't exist
        if (!board.board_data) {
          board.board_data = { items: [], totalBudget: 0, createdAt: board.created_at };
        } 
        // Ensure board_data is an object
        else if (typeof board.board_data !== 'object') {
          board.board_data = { items: [], totalBudget: 0, createdAt: board.created_at };
        }
        // Ensure items array exists
        if (!board.board_data.items) {
          board.board_data.items = [];
        }
        
        // Calculate totalBudget if it doesn't exist
        if (board.board_data.totalBudget === undefined || board.board_data.totalBudget === null) {
          console.log(`📊 Calculating missing totalBudget for board ${board.id}`);
          // Sum up the prices of all items
          board.board_data.totalBudget = board.board_data.items.reduce((sum, item) => {
            const price = item.price || 0;
            return sum + price;
          }, 0);
        }
        
        // Ensure createdAt exists
        if (!board.board_data.createdAt) {
          board.board_data.createdAt = board.created_at;
        }
        
        return {
          ...board,
          board_data: board.board_data
        };
      });
    } catch (error: any) {
      console.error('❌ getSavedVisionBoards: Error in getSavedVisionBoards:', error);
      throw new Error(error.message || 'Failed to fetch saved vision boards');
    }
  }

  // Get a specific saved vision board by ID with its items
  static async getVisionBoard(boardId: string): Promise<SavedVisionBoard | null> {
    try {
      const boardWithItems = await this.getVisionBoardWithItems(boardId);
      return boardWithItems as SavedVisionBoard;
    } catch (error: any) {
      console.error('Error in getVisionBoard:', error);
      if (error.message.includes('not authenticated')) {
        throw error;
      }
      throw new Error(error.message || 'Failed to fetch vision board');
    }
  }

  // Get a vision board with its items
  private static async getVisionBoardWithItems(boardId: string): Promise<SavedVisionBoard | null> {
    try {
      console.log(`🔍 getVisionBoardWithItems: Starting to fetch board ${boardId} with items`);
      const session = await this.ensureAuthenticated();
      console.log(`🔑 getVisionBoardWithItems: User authenticated for board ${boardId}`);

      // Get the board metadata
      const { data: board, error: boardError } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('id', boardId)
        .eq('user_id', session.user.id)
        .eq('is_saved', true)
        .single();

      if (boardError) {
        if (boardError.code === 'PGRST116') {
          console.log(`❓ getVisionBoardWithItems: Board ${boardId} not found`);
          return null; // Vision board not found
        }
        console.error(`❌ getVisionBoardWithItems: Error fetching board ${boardId}:`, boardError);
        throw new Error(`Failed to fetch vision board: ${boardError.message}`);
      }

      console.log(`📋 getVisionBoardWithItems: Board ${boardId} metadata:`, board);

      // Get the board items
      console.log(`🔍 getVisionBoardWithItems: Fetching items for board ${boardId}`);
      const { data: visionBoardItems, error: itemsError } = await supabase
        .from('vision_board_items')
        .select(`
          *,
          liked_product:liked_products(*)
        `)
        .eq('vision_board_id', boardId)
        .order('z_index', { ascending: true });

      if (itemsError) {
        console.error(`❌ getVisionBoardWithItems: Error fetching items for board ${boardId}:`, itemsError);
        throw new Error(`Failed to fetch vision board items: ${itemsError.message}`);
      }

      console.log(`📋 getVisionBoardWithItems: Found ${visionBoardItems.length} items for board ${boardId}`);

      // Transform the items to match the VisionBoardItem type
      const transformedItems: VisionBoardItemType[] = visionBoardItems.map(item => {
        const likedProduct = item.liked_product;
        return {
          boardId: item.id, // Use the item ID directly as the boardId (string UUID)
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          rotation: item.rotation,
          // Include all the liked product fields
          id: likedProduct.id,
          user_id: likedProduct.user_id,
          project_id: likedProduct.project_id,
          asin: likedProduct.asin,
          title: likedProduct.title,
          price: likedProduct.price,
          currency: likedProduct.currency,
          rating: likedProduct.rating,
          reviews_count: likedProduct.reviews_count,
          image: likedProduct.image,
          url: likedProduct.url,
          created_at: likedProduct.created_at,
          source: likedProduct.source
        };
      });

      console.log(`✅ getVisionBoardWithItems: Transformed ${transformedItems.length} items for board ${boardId}`);

      // Calculate total budget
      const totalBudget = transformedItems.reduce((sum, item) => sum + (item.price || 0), 0);

      // Initialize board_data if it doesn't exist
      if (!board.board_data) {
        board.board_data = {};
      }

      // Return the board with its items
      return {
        ...board,
        board_data: {
          items: transformedItems,
          totalBudget,
          createdAt: board.board_data.createdAt || board.created_at
        }
      } as SavedVisionBoard;
    } catch (error: any) {
      console.error(`❌ getVisionBoardWithItems: Error getting board ${boardId} with items:`, error);
      throw new Error(error.message || 'Failed to fetch vision board with items');
    }
  }

  // Update a saved vision board
  static async updateVisionBoard(
    boardId: string,
    boardName: string,
    boardItems: VisionBoardItemType[],
    totalBudget: number,
    previewImageUrl?: string
  ): Promise<SavedVisionBoard> {
    try {
      const session = await this.ensureAuthenticated();

      // First, delete all existing items for this board
      const { error: deleteItemsError } = await supabase
        .from('vision_board_items')
        .delete()
        .eq('vision_board_id', boardId);
        
      if (deleteItemsError) {
        console.error('Error deleting existing vision board items:', deleteItemsError);
        throw new Error(`Failed to update vision board items: ${deleteItemsError.message}`);
      }
      
      // Then, insert new items
      if (boardItems.length > 0) {
        await this.saveVisionBoardItems(boardId, boardItems);
      }

      // Update the board metadata
      const boardData = {
        items: boardItems,
        totalBudget,
        createdAt: new Date().toISOString()
      };

      const updates = {
        name: boardName,
        board_data: boardData, // Keep for backward compatibility
        updated_at: new Date().toISOString()
      };

      if (previewImageUrl) {
        updates.preview_image_url = previewImageUrl;
      }

      const { data, error } = await supabase
        .from('vision_boards')
        .update(updates)
        .eq('id', boardId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vision board:', error);
        throw new Error(`Failed to update vision board: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from vision board update');
      }

      // Return the updated board with its items
      return {
        ...data,
        board_data: boardData
      };
    } catch (error: any) {
      console.error('Error in updateVisionBoard:', error);
      throw new Error(error.message || 'Failed to update vision board');
    }
  }

  // Delete a saved vision board
  static async deleteVisionBoard(boardId: string): Promise<void> {
    try {
      const session = await this.ensureAuthenticated();

      // Delete the board (cascade will delete items)
      const { error } = await supabase
        .from('vision_boards')
        .delete()
        .eq('id', boardId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting vision board:', error);
        throw new Error(`Failed to delete vision board: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error in deleteVisionBoard:', error);
      throw new Error(error.message || 'Failed to delete vision board');
    }
  }

  // Generate a preview image URL (placeholder implementation)
  static async generatePreviewImage(boardItems: VisionBoardItemType[]): Promise<string | null> {
    try {
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Capture the canvas as an image using html2canvas or similar
      // 2. Upload the image to Supabase Storage
      // 3. Return the public URL
      
      // For now, we'll return null and handle preview generation later
      return null;
    } catch (error) {
      console.error('Error generating preview image:', error);
      return null;
    }
  }
}