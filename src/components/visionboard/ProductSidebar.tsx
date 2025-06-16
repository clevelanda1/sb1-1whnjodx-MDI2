import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Filter } from 'lucide-react';
import { ProductFilterState } from '../../types/visionboard';
import { LikedProduct, Project } from '../../lib/supabase';
import ProductGrid from './ProductGrid';

interface ProductSidebarProps {
  isVisible: boolean;
  isLoading: boolean;
  likedProducts: LikedProduct[];
  filteredProducts: LikedProduct[];
  filters: ProductFilterState;
  projectOptions: { id: string; name: string }[];
  onSearchChange: (query: string) => void;
  onProjectChange: (projectId: string) => void;
  onDragStart: (e: React.DragEvent, product: LikedProduct) => void;
  onDoubleClick: (product: LikedProduct) => void;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  isVisible,
  isLoading,
  likedProducts,
  filteredProducts,
  filters,
  projectOptions,
  onSearchChange,
  onProjectChange,
  onDragStart,
  onDoubleClick
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-500">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-red-500" />
              <h2 className="font-semibold text-lg text-slate-900">Liked Products</h2>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50/80 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Drag & Drop:</strong> Drag items to the board<br/>
                <strong>Double-Click:</strong> Add to center of board
              </p>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={filters.searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 bg-white/60 backdrop-blur-sm transition-all duration-300 text-xs"
              />
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            </div>

            {/* Project Filter */}
            <div className="relative mb-4">
              <select 
                value={filters.selectedProject}
                onChange={(e) => onProjectChange(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 bg-white/60 backdrop-blur-sm transition-all duration-300 text-xs appearance-none"
              >
                {projectOptions.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={14} />
            </div>
            
            <ProductGrid
              isLoading={isLoading}
              likedProducts={likedProducts}
              filteredProducts={filteredProducts}
              onDragStart={onDragStart}
              onDoubleClick={onDoubleClick}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductSidebar;