import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Filter, X } from 'lucide-react';
import { CurationFilters } from '../../types/curation';
import { PRICE_RANGES } from '../../utils/constants';

interface FilterSidebarProps {
  filters: CurationFilters;
  detectedElements: string[];
  wishlistCount: number;
  isVisible: boolean;
  availableMarketplaces: { id: string; name: string; count: number }[];
  onSearchChange: (searchTerm: string) => void;
  onToggleElement: (element: string) => void;
  onTogglePriceRange: (minPrice: number) => void;
  onToggleFavoritesOnly: (showFavoritesOnly: boolean) => void;
  onToggleMarketplace: (marketplace: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  detectedElements,
  wishlistCount,
  isVisible,
  availableMarketplaces,
  onSearchChange,
  onToggleElement,
  onTogglePriceRange,
  onToggleFavoritesOnly,
  onToggleMarketplace
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // Get marketplace-specific styling
  const getMarketplaceColor = (id: string) => {
    return id === 'amazon' ? 'orange' : 'teal';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="lg:col-span-1"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-semibold text-2xl text-slate-900 flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                Filters
              </h2>
            </div>

            {/* Search Products */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Search Products
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by product name..." 
                  value={filters.searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 bg-white/60 backdrop-blur-sm transition-all duration-300 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                {filters.searchTerm && (
                  <motion.button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Favorites Filter */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Favorites
              </h3>
              <motion.label 
                className="flex items-center group cursor-pointer p-3 rounded-xl hover:bg-slate-50/60 transition-all duration-200"
                whileHover={{ x: 2 }}
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  checked={filters.showFavoritesOnly}
                  onChange={(e) => onToggleFavoritesOnly(e.target.checked)}
                />
                <div className="ml-4 flex items-center gap-2">
                  <Heart 
                    size={16} 
                    className={`${filters.showFavoritesOnly ? 'text-red-500 fill-red-500' : 'text-slate-400'} transition-colors`} 
                  />
                  <span className="text-slate-700 group-hover:text-slate-900 transition-colors font-medium">
                    Show Favorites
                  </span>
                  {wishlistCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </motion.label>
            </div>

            {/* Marketplace Filter - Only show if there are available marketplaces */}
            {availableMarketplaces.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Marketplace
                </h3>
                <div className="space-y-3">
                  {availableMarketplaces.map(marketplace => (
                    <motion.label 
                      key={marketplace.id} 
                      className="flex items-center group cursor-pointer p-3 rounded-lg hover:bg-white/60 transition-all duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <input
                        type="checkbox"
                        className={`form-checkbox h-5 w-5 text-${getMarketplaceColor(marketplace.id)}-600 rounded border-slate-300 focus:ring-${getMarketplaceColor(marketplace.id)}-500`}
                        checked={!filters.marketplaces || filters.marketplaces.includes(marketplace.id)}
                        onChange={() => onToggleMarketplace(marketplace.id)}
                      />
                      <div className="ml-4 flex items-center gap-2">
                        <span className={`text-slate-700 group-hover:text-slate-900 transition-colors font-medium`}>
                          {marketplace.name}
                        </span>
                        <span className={`text-xs bg-${getMarketplaceColor(marketplace.id)}-100 text-${getMarketplaceColor(marketplace.id)}-700 px-2 py-1 rounded-full font-medium`}>
                          {marketplace.count}
                        </span>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Elements */}
            {detectedElements.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Detected Items
                </h3>
                <div className="space-y-3">
                  {detectedElements.map(element => (
                    <motion.label 
                      key={element} 
                      className="flex items-center group cursor-pointer p-3 rounded-xl hover:bg-slate-50/60 transition-all duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                        checked={filters.selectedElements.includes(element)}
                        onChange={() => onToggleElement(element)}
                      />
                      <span className="ml-4 text-slate-700 group-hover:text-slate-900 transition-colors font-medium">
                        {element}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Ranges */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Price Range
              </h3>
              <div className="space-y-3">
                {PRICE_RANGES.map(range => (
                  <motion.label 
                    key={range.min} 
                    className="flex items-center group cursor-pointer p-3 rounded-xl hover:bg-slate-50/60 transition-all duration-200"
                    whileHover={{ x: 2 }}
                  >
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                      checked={filters.selectedPriceRange.includes(range.min)}
                      onChange={() => onTogglePriceRange(range.min)}
                    />
                    <span className="ml-4 text-slate-700 group-hover:text-slate-900 transition-colors font-medium">
                      {range.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;