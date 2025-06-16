import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { UnifiedProduct } from '../../types/curation';
import Button from '../common/Button';

interface ProductCardProps {
  product: UnifiedProduct;
  isLiked: boolean;
  viewMode: 'grid' | 'list';
  index: number;
  onToggleWishlist: (product: UnifiedProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLiked,
  viewMode,
  index,
  onToggleWishlist
}) => {
  // Get source-specific styling
  const getSourceColor = (source: 'amazon' | 'etsy') => {
    return source === 'amazon' ? 'orange' : 'teal';
  };

  return (
    <motion.div
      key={product.id}
      className={`bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 group ${
        viewMode === 'list' ? 'flex' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <motion.img
          src={product.image}
          alt={product.title}
          className={`object-cover p-6 transition-transform duration-700 group-hover:scale-105 ${
            viewMode === 'list' ? 'w-full h-40' : 'w-full h-64'
          }`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://via.placeholder.com/400x400/f1f5f9/64748b?text=${encodeURIComponent(product.title.slice(0, 20))}`;
          }}
        />
        <motion.button
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300"
          onClick={() => onToggleWishlist(product)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Heart
            size={16}
            className={isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}
          />
        </motion.button>
        
        {/* Source Badge */}
        <div className={`absolute top-4 left-4 px-2 py-1 bg-${getSourceColor(product.source)}-100 text-${getSourceColor(product.source)}-700 border border-${getSourceColor(product.source)}-200 rounded-full text-xs font-medium capitalize`}>
          {product.source}
        </div>
      </div>

      <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="mb-4">
          <h3 className={`font-semibold text-slate-900 line-clamp-2 ${
            viewMode === 'list' ? 'text-lg mb-2' : 'text-base'
          }`}>
            {product.title}
          </h3>
          <div className="flex items-center mt-2">
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
                <Star key={i} size={12} className="fill-current" />
              ))}
            </div>
            <span className="text-sm text-slate-500 ml-2 font-medium">({product.reviewsCount})</span>
          </div>
        </div>

        <div className={`flex items-center ${
          viewMode === 'list' ? 'justify-between' : 'justify-between'
        }`}>
          <span className="font-semibold text-xl text-slate-900">
            ${product.price.toFixed(2)}
          </span>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                variant="outline" 
                size="sm"
                className={`border-${getSourceColor(product.source)}-300/60 text-${getSourceColor(product.source)}-700 hover:bg-${getSourceColor(product.source)}-50/80 rounded-2xl font-medium bg-white/60 backdrop-blur-sm`}
              >
                View Product
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;