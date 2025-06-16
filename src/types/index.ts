import { ReactNode } from 'react';

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
  title: string;
  image?: string;
}

export interface RoomInspiration {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  featured?: boolean;
}

export interface Brand {
  id: number;
  name: string;
  logo: string;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface Store {
  id: number;
  name: string;
  accent: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  store: Store;
  image: string;
  style: string;
}

export interface DetectedElement {
  name: string;
  searchQueries: string[];
  isSelected?: boolean;
  selectedQuery?: string;
}

// Updated to support both Amazon and Wayfair products
export interface AmazonProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  asin: string;
}

export interface WayfairProduct {
  title: string;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  image: string;
  url: string;
  sku: string;
  source: 'wayfair';
}

export interface SearchState {
  status: 'idle' | 'searching' | 'complete' | 'error';
  products: AmazonProduct[];
  error?: string;
}

// Dual search queries interface
export interface DualSearchQueries {
  amazonQueries: string[];
  wayfairQueries: string[];
}