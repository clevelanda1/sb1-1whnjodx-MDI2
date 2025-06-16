import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { LikedProduct } from '../../lib/supabase';

interface ProductCardProps {
  product: LikedProduct;
  index: number;
  onDragStart: (e: React.DragEvent, product: LikedProduct) => void;
  onDoubleClick: (product: LikedProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  onDragStart,
  onDoubleClick
}) => {
  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e, product)}
      onDoubleClick={() => onDoubleClick(product)}
      className="group bg-white/60 rounded-xl p-3 border border-slate-200/60 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-violet-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="aspect-square bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
        <img 
          src={product.image || ''}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/150x150/f1f5f9/64748b?text=${encodeURIComponent(product.title.slice(0, 10))}`;
          }}
        />
        {/* Drag indicator */}
        <div className="absolute inset-0 bg-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-1">
            <Plus size={12} className="text-violet-600" />
          </div>
        </div>
      </div>
      
      <h3 className="font-medium text-slate-900 text-xs line-clamp-2 mb-1">
        {product.title}
      </h3>
      
      <p className="text-xs text-slate-400 mb-2">
        {product.project?.name || 'Unknown Project'}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900 text-xs">${product.price}</span>
        {/*<span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Drag or Double-Click
        </span>*/}
      </div>
    </motion.div>
  );
};

export default ProductCard;