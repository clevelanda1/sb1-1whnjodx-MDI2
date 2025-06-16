import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  image_file_name: string | null;
  status: 'analyzing' | 'complete' | 'error';
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  image_file_name?: string | null;
  status?: 'analyzing' | 'complete' | 'error';
  created_at?: string;
  updated_at?: string;
}

export interface ProjectUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  image_file_name?: string | null;
  status?: 'analyzing' | 'complete' | 'error';
  created_at?: string;
  updated_at?: string;
}

export interface DualSearchQueries {
  amazon: string[];
  etsy: string[];
}

export interface ProjectElement {
  id: string;
  project_id: string;
  name: string;
  search_queries: DualSearchQueries;
  selected_amazon_query: string | null;
  selected_etsy_query: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface ProjectElementInsert {
  id?: string;
  project_id: string;
  name: string;
  search_queries: DualSearchQueries;
  selected_amazon_query?: string | null;
  selected_etsy_query?: string | null;
  confidence_score?: number | null;
  created_at?: string;
}

export interface ProjectElementUpdate {
  id?: string;
  project_id?: string;
  name?: string;
  search_queries?: DualSearchQueries;
  selected_amazon_query?: string | null;
  selected_etsy_query?: string | null;
  confidence_score?: string | null;
  created_at?: string;
}

export interface ProjectProduct {
  id: string;
  project_id: string;
  asin: string;
  title: string;
  price: number | null;
  currency: string | null;
  rating: number | null;
  reviews_count: number | null;
  image: string | null;
  url: string | null;
  created_at: string;
  source: 'amazon' | 'etsy';
  project_element_id: string | null;
}

export interface ProjectProductInsert {
  id?: string;
  project_id: string;
  asin: string;
  title: string;
  price?: number | null;
  currency?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  image?: string | null;
  url?: string | null;
  created_at?: string;
  source?: 'amazon' | 'etsy';
  project_element_id?: string | null;
}

export interface LikedProduct {
  id: string;
  user_id: string;
  project_id: string;
  asin: string;
  title: string;
  price: number | null;
  currency: string | null;
  rating: number | null;
  reviews_count: number | null;
  image: string | null;
  url: string | null;
  created_at: string;
  source: 'amazon' | 'etsy';
}

export interface LikedProductInsert {
  id?: string;
  user_id: string;
  project_id: string;
  asin: string;
  title: string;
  price?: number | null;
  currency?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  image?: string | null;
  url?: string | null;
  created_at?: string;
  source?: 'amazon' | 'etsy';
}

export interface VisionBoard {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  is_saved: boolean | null;
  board_data: any;
  preview_image_url: string | null;
}

export interface VisionBoardInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
  is_saved?: boolean | null;
  board_data?: any;
  preview_image_url?: string | null;
}

export interface VisionBoardUpdate {
  id?: string;
  user_id?: string;
  name?: string;
  description?: string | null;
  thumbnail_url?: string | null;
  created_at?: string;
  updated_at?: string;
  is_saved?: boolean | null;
  board_data?: any;
  preview_image_url?: string | null;
}

export interface VisionBoardItem {
  id: string;
  vision_board_id: string;
  liked_product_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  created_at: string;
}

export interface VisionBoardItemInsert {
  id?: string;
  vision_board_id: string;
  liked_product_id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index?: number;
  created_at?: string;
}

export interface VisionBoardItemUpdate {
  id?: string;
  vision_board_id?: string;
  liked_product_id?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  z_index?: number;
  created_at?: string;
}

export interface SharedVisionBoard {
  id: string;
  user_id: string;
  share_token: string;
  board_name: string;
  board_data: any;
  total_budget: number | null;
  expires_at: string | null;
  view_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface SharedVisionBoardInsert {
  id?: string;
  user_id: string;
  share_token: string;
  board_name: string;
  board_data: any;
  total_budget?: number | null;
  expires_at?: string | null;
  view_count?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CombinedApiUsage {
  id: string;
  user_id: string;
  amazon_total_count: number;
  etsy_total_count: number;
  combined_total_count: number;
  amazon_lifetime_total: number;
  etsy_lifetime_total: number;
  combined_lifetime_total: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface CombinedApiUsageInsert {
  id?: string;
  user_id: string;
  amazon_total_count?: number;
  etsy_total_count?: number;
  combined_total_count?: number;
  amazon_lifetime_total?: number;
  etsy_lifetime_total?: number;
  combined_lifetime_total?: number;
  last_reset_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CombinedApiUsageUpdate {
  id?: string;
  user_id?: string;
  amazon_total_count?: number;
  etsy_total_count?: number;
  combined_total_count?: number;
  amazon_lifetime_total?: number;
  etsy_lifetime_total?: number;
  combined_lifetime_total?: number;
  last_reset_date?: string;
  created_at?: string;
  updated_at?: string;
}