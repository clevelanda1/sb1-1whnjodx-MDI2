import { LikedProduct, Project } from '../lib/supabase';

// Core vision board item interface
export interface VisionBoardItem extends LikedProduct {
  boardId: string; // Changed from number to string to match UUID format
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

// Product filtering state
export interface ProductFilterState {
  searchQuery: string;
  selectedProject: string;
}

// Drag and drop state
export interface DragAndDropState {
  draggedItem: LikedProduct | null;
  isDragOver: boolean;
  dragCounter: number;
}

// Vision board state
export interface VisionBoardState {
  boardItems: VisionBoardItem[];
  selectedItem: string | null; // Changed from number to string
  showSidebar: boolean;
}

// Product data state
export interface ProductDataState {
  likedProducts: LikedProduct[];
  projects: Project[];
  isLoading: boolean;
}

// Mouse position for drag calculations
export interface MousePosition {
  x: number;
  y: number;
}

// Board bounds for item positioning
export interface BoardBounds {
  width: number;
  height: number;
}

// Product with project information
export interface LikedProductWithProject extends LikedProduct {
  project?: Project;
}

// White label branding settings
export interface WhiteLabelSettings {
  logoUrl: string | null;
  brandName: string | null;
  primaryColor: string | null;
}