import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UnifiedProduct, ViewSettings, PaginationState } from '../../types/curation';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

interface ProductsGridProps {
  products: UnifiedProduct[];
  currentPageProducts: UnifiedProduct[];
  wishlist: string[];
  viewSettings: ViewSettings;
  paginationState: PaginationState;
  isSearching: boolean;
  searchError?: string;
  pageNumbers: (number | string)[];
  onToggleWishlist: (product: UnifiedProduct) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({
  products,
  currentPageProducts,
  wishlist,
  viewSettings,
  paginationState,
  isSearching,
  searchError,
  pageNumbers,
  onToggleWishlist,
  onPageChange,
  onRetry
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div 
      className={viewSettings.showFilters ? "lg:col-span-2" : "lg:col-span-1"}
      variants={itemVariants}
      layout
      transition={{ duration: 0.3 }}
      data-products-section
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
        <h2 className="font-light text-3xl text-slate-900">Product <span className="font-semibold">Selections</span></h2>
        
        {/* Pagination Info */}
        {paginationState.totalProducts > 24 && (
          <div className="text-sm text-slate-600">
            Showing {((paginationState.currentPage - 1) * 24) + 1}-{Math.min(paginationState.currentPage * 24, paginationState.totalProducts)} of {paginationState.totalProducts} products
          </div>
        )}
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3 text-slate-600">
            <Loader2 className="animate-spin text-violet-600" size={20} />
            <span className="font-medium">Searching for products...</span>
          </div>
        </div>
      ) : searchError ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <p className="font-medium">Unable to load products</p>
            <p className="text-sm mt-1 font-light">{searchError}</p>
            <motion.button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Try Again
            </motion.button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className={`grid gap-8 ${
            viewSettings.viewMode === 'grid' 
              ? viewSettings.showFilters 
                ? 'grid-cols-1 md:grid-cols-2' // 2 columns when filters shown
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' // 3 columns when filters hidden
              : 'grid-cols-1'
          }`}>
            <AnimatePresence>
              {currentPageProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isLiked={wishlist.includes(product.id)}
                  viewMode={viewSettings.viewMode}
                  index={index}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {paginationState.totalPages > 1 && (
            <motion.div 
              className="flex items-center justify-center mt-12 gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Previous Button */}
              <motion.button
                onClick={() => onPageChange(paginationState.currentPage - 1)}
                disabled={paginationState.currentPage === 1}
                className="p-3 rounded-2xl border border-slate-300/60 text-slate-600 hover:bg-slate-50/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/60 backdrop-blur-sm"
                whileHover={{ scale: paginationState.currentPage > 1 ? 1.05 : 1 }}
                whileTap={{ scale: paginationState.currentPage > 1 ? 0.95 : 1 }}
              >
                <ChevronLeft size={18} />
              </motion.button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {pageNumbers.map((page, index) => (
                  <motion.button
                    key={index}
                    onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
                    disabled={page === '...'}
                    className={`min-w-[44px] h-11 rounded-2xl font-medium transition-all duration-300 ${
                      page === paginationState.currentPage
                        ? 'bg-slate-900 text-white shadow-lg'
                        : page === '...'
                        ? 'text-slate-400 cursor-default'
                        : 'border border-slate-300/60 text-slate-600 hover:bg-slate-50/80 bg-white/60 backdrop-blur-sm'
                    }`}
                    whileHover={{ scale: page !== '...' && page !== paginationState.currentPage ? 1.05 : 1 }}
                    whileTap={{ scale: page !== '...' && page !== paginationState.currentPage ? 0.95 : 1 }}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              {/* Next Button */}
              <motion.button
                onClick={() => onPageChange(paginationState.currentPage + 1)}
                disabled={paginationState.currentPage === paginationState.totalPages}
                className="p-3 rounded-2xl border border-slate-300/60 text-slate-600 hover:bg-slate-50/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-white/60 backdrop-blur-sm"
                whileHover={{ scale: paginationState.currentPage < paginationState.totalPages ? 1.05 : 1 }}
                whileTap={{ scale: paginationState.currentPage < paginationState.totalPages ? 0.95 : 1 }}
              >
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ProductsGrid;