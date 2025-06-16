export interface UploadState {
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  file?: File;
  preview?: string;
  detectedElements: DetectedElement[]; // Made non-optional to ensure it's always an array
  error?: string;
}

export interface DetectedElement {
  name: string;
  amazonQueries: string[];
  etsyQueries: string[]; // Changed from wayfairQueries to etsyQueries
  selectedAmazonQuery?: string; // Added for Amazon query selection
  selectedEtsyQuery?: string; // Added for Etsy query selection
  status?: 'idle' | 'searching' | 'complete' | 'error'; // Added for tracking individual search status
  errorMessage?: string; // Added for tracking individual search errors
  products?: any[]; // Added to temporarily hold results during upload process
  elementId?: string; // Added to store the database ID once created
}

export interface DeleteModalState {
  isOpen: boolean;
  projectId: string | null;
  projectName: string;
  isDeleting: boolean;
}

export interface ProjectFilters {
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

export interface MousePosition {
  x: number;
  y: number;
}

// Re-export types from lib/supabase for convenience
export type { Project } from '../lib/supabase';