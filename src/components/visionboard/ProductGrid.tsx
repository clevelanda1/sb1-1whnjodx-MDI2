import React from 'react';
import { Loader2 } from 'lucide-react';
import { LikedProduct } from '../../lib/supabase';
import ProductCard from './ProductCard';
import EmptyStates from './EmptyStates';

interface ProductGridProps {
  isLoading: boolean;
  likedProducts: LikedProduct[];
  filteredProducts: LikedProduct[];
  onDragStart: (e: React.DragEvent, product: LikedProduct) => void;
  onDoubleClick: (product: LikedProduct) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  isLoading,
  likedProducts,
  filteredProducts,
  onDragStart,
  onDoubleClick
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2 text-slate-600">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Loading liked products...</span>
        </div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <EmptyStates 
        hasLikedProducts={likedProducts.length > 0}
        type="products"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
      {filteredProducts.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onDragStart={onDragStart}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </div>
  );
};

export default ProductGrid;