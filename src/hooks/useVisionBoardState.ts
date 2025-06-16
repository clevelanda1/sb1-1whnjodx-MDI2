import { useState, useMemo, useEffect } from 'react';
import { VisionBoardState, VisionBoardItem, BoardBounds } from '../types/visionboard';
import { LikedProduct } from '../lib/supabase';
import { VisionBoardService, SavedVisionBoard } from '../services/visionBoardService';
import { useSubscription } from '../contexts/SubscriptionContext';

export const useVisionBoardState = () => {
  const { subscription, limits } = useSubscription();
  const [visionBoardState, setVisionBoardState] = useState<VisionBoardState>({
    boardItems: [],
    selectedItem: null,
    showSidebar: true
  });

  const [savedBoards, setSavedBoards] = useState<SavedVisionBoard[]>([]);
  const [isLoadingSavedBoards, setIsLoadingSavedBoards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBoardId, setCurrentBoardId] = useState<string | undefined>(undefined);
  const [currentBoardName, setCurrentBoardName] = useState<string>("My Vision Board");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check if user can save vision boards based on subscription
  const canSaveVisionBoards = true; // All users can save at least one board
  
  // Check if user can share vision boards based on subscription
  const canShareVisionBoards = subscription.tier !== 'free';
  
  // Check if user has reached their saved boards limit
  const hasReachedSavedBoardsLimit = 
    (subscription.tier === 'free' && savedBoards.length >= limits.visionBoards && !currentBoardId) ||
    (subscription.tier === 'pro' && savedBoards.length >= limits.visionBoards && !currentBoardId);

  // Load saved boards when the hook is initialized
  useEffect(() => {
    loadSavedBoards();
  }, []);

  // Calculate total budget
  const totalBudget = useMemo(() => {
    return visionBoardState.boardItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [visionBoardState.boardItems]);

  // Add item to board at specified position
  const addItemToBoard = (product: LikedProduct, x?: number, y?: number, boardBounds?: BoardBounds) => {
    let finalX = x ?? 300; // Default center X
    let finalY = y ?? 300; // Default center Y

    // If board bounds provided, ensure item stays within bounds
    if (boardBounds) {
      finalX = Math.max(10, Math.min(finalX, boardBounds.width - 210));
      finalY = Math.max(10, Math.min(finalY, boardBounds.height - 210));
    }

    // Generate a unique string ID for the board item
    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newItem: VisionBoardItem = {
      ...product,
      boardId: uniqueId, // Use string UUID instead of number
      x: finalX,
      y: finalY,
      width: 200,
      height: 200,
      rotation: 0
    };
    
    setVisionBoardState(prev => ({
      ...prev,
      boardItems: [...prev.boardItems, newItem]
    }));

    // Clear current board ID when items are added to a loaded board
    setCurrentBoardId(undefined);

    return newItem;
  };

  // Handle moving items on the board
  const moveItem = (boardId: string, newX: number, newY: number) => {
    setVisionBoardState(prev => ({
      ...prev,
      boardItems: prev.boardItems.map(item => 
        item.boardId === boardId 
          ? { ...item, x: newX, y: newY }
          : item
      )
    }));
    
    // Clear current board ID when items are moved
    setCurrentBoardId(undefined);
  };

  // Handle resizing items
  const resizeItem = (boardId: string, newWidth: number, newHeight: number) => {
    setVisionBoardState(prev => ({
      ...prev,
      boardItems: prev.boardItems.map(item => 
        item.boardId === boardId 
          ? { ...item, width: newWidth, height: newHeight }
          : item
      )
    }));
    
    // Clear current board ID when items are resized
    setCurrentBoardId(undefined);
  };

  // Handle removing items
  const removeItem = (boardId: string) => {
    setVisionBoardState(prev => ({
      ...prev,
      boardItems: prev.boardItems.filter(item => item.boardId !== boardId),
      selectedItem: prev.selectedItem === boardId ? null : prev.selectedItem
    }));
    
    // Clear current board ID when items are removed
    setCurrentBoardId(undefined);
  };

  // Handle item selection
  const selectItem = (boardId: string | null) => {
    setVisionBoardState(prev => ({
      ...prev,
      selectedItem: boardId === prev.selectedItem ? null : boardId
    }));
  };

  // Clear all items from board
  const clearBoard = () => {
    setVisionBoardState(prev => ({
      ...prev,
      boardItems: [],
      selectedItem: null
    }));
    
    // Clear current board ID and name when board is cleared
    setCurrentBoardId(undefined);
    setCurrentBoardName("My Vision Board");
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setVisionBoardState(prev => ({
      ...prev,
      showSidebar: !prev.showSidebar
    }));
  };

  // Save current board state
  const saveBoard = async (boardName: string): Promise<SavedVisionBoard> => {
    try {
      // Check if user has reached their saved boards limit
      if (hasReachedSavedBoardsLimit && !currentBoardId) {
        throw new Error(`You've reached the limit of ${limits.visionBoards} saved board${limits.visionBoards !== 1 ? 's' : ''} for your subscription tier. Please upgrade or delete some boards.`);
      }
      
      setSaveError(null);
      setIsSaving(true);
      setCurrentBoardName(boardName);
      
      // Generate preview image (placeholder for now)
      const previewImageUrl = await VisionBoardService.generatePreviewImage(visionBoardState.boardItems);
      
      // Save the board
      const savedBoard = await VisionBoardService.saveVisionBoard(
        boardName,
        visionBoardState.boardItems,
        totalBudget,
        previewImageUrl || undefined
      );

      // Update local saved boards list
      setSavedBoards(prev => {
        // Remove any existing board with the same ID
        const filteredBoards = prev.filter(board => board.id !== savedBoard.id);
        // Add the new/updated board at the beginning
        return [savedBoard, ...filteredBoards];
      });
      
      // Set current board ID to the saved board ID
      setCurrentBoardId(savedBoard.id);
      
      console.log('Board saved successfully:', savedBoard.name);
      return savedBoard;
    } catch (error: any) {
      console.error('Error saving board:', error);
      setSaveError(error.message || 'Failed to save vision board');
      throw new Error(error.message || 'Failed to save vision board');
    } finally {
      setIsSaving(false);
    }
  };

  // Update board name
  const updateBoardName = async (boardId: string, newName: string): Promise<void> => {
    try {
      if (!boardId) {
        throw new Error('No board ID provided');
      }
      
      setIsSaving(true);
      
      // Update the board using the existing service method
      await VisionBoardService.updateVisionBoardName(
        boardId,
        newName
      );
      
      // Update local state
      setCurrentBoardName(newName);
      
      // Update the board in the saved boards list
      setSavedBoards(prev => 
        prev.map(board => 
          board.id === boardId 
            ? { ...board, name: newName } 
            : board
        )
      );
      
      console.log('Board name updated successfully:', newName);
    } catch (error: any) {
      console.error('Error updating board name:', error);
      throw new Error(error.message || 'Failed to update board name');
    } finally {
      setIsSaving(false);
    }
  };

  // Load a saved board
  const loadBoard = async (boardId: string): Promise<void> => {
    try {
      const savedBoard = await VisionBoardService.getVisionBoard(boardId);
      
      if (!savedBoard || !savedBoard.board_data) {
        throw new Error('Vision board not found or has no data');
      }

      // Load the board items from saved data
      const boardItems = savedBoard.board_data.items || [];
      
      setVisionBoardState(prev => ({
        ...prev,
        boardItems,
        selectedItem: null
      }));
      
      // Set current board ID and name to the loaded board
      setCurrentBoardId(boardId);
      setCurrentBoardName(savedBoard.name);

      console.log('Board loaded successfully:', savedBoard.name);
    } catch (error: any) {
      console.error('Error loading board:', error);
      throw new Error(error.message || 'Failed to load vision board');
    }
  };

  // Delete a saved board
  const deleteBoard = async (boardId: string): Promise<void> => {
    try {
      await VisionBoardService.deleteVisionBoard(boardId);
      
      // Remove from local saved boards list
      setSavedBoards(prev => prev.filter(board => board.id !== boardId));
      
      // If the deleted board is the current board, clear the current board ID and state
      if (currentBoardId === boardId) {
        setCurrentBoardId(undefined);
        setCurrentBoardName("My Vision Board");
        setVisionBoardState(prev => ({
          ...prev,
          boardItems: [],
          selectedItem: null
        }));
      }
      
      console.log('Board deleted successfully');
    } catch (error: any) {
      console.error('Error deleting board:', error);
      throw new Error(error.message || 'Failed to delete vision board');
    }
  };

  // Load saved boards list
  const loadSavedBoards = async (): Promise<void> => {
    try {
      console.log('🔍 Starting to load saved vision boards...');
      setIsLoadingSavedBoards(true);
      const boards = await VisionBoardService.getSavedVisionBoards();
      console.log('✅ Loaded saved vision boards:', boards.length, boards);
      setSavedBoards(boards);
    } catch (error: any) {
      console.error('❌ Error loading saved boards:', error);
      throw new Error(error.message || 'Failed to load saved boards');
    } finally {
      setIsLoadingSavedBoards(false);
    }
  };

  return {
    ...visionBoardState,
    totalBudget,
    savedBoards,
    isLoadingSavedBoards,
    isSaving,
    currentBoardId,
    currentBoardName,
    saveError,
    canSaveVisionBoards,
    canShareVisionBoards,
    hasReachedSavedBoardsLimit,
    addItemToBoard,
    moveItem,
    resizeItem,
    removeItem,
    selectItem,
    clearBoard,
    toggleSidebar,
    saveBoard,
    updateBoardName,
    loadBoard,
    deleteBoard,
    loadSavedBoards
  };
};