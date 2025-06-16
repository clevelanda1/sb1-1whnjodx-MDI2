import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, SlidersHorizontal, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { ViewSettings } from '../../types/curation';

interface CurationControlsBarProps {
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  hasActiveFilters: boolean;
  viewSettings: ViewSettings;
  isRefreshing: boolean;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  onRefreshProducts: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const CurationControlsBar: React.FC<CurationControlsBarProps> = ({
  totalProducts,
  currentPage,
  totalPages,
  hasActiveFilters,
  viewSettings,
  isRefreshing,
  onClearFilters,
  onToggleFilters,
  onRefreshProducts,
  onViewModeChange
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 font-medium">
              {totalProducts} products found{totalProducts > 24 ? ` • Page ${currentPage} of ${totalPages}` : ''}
            </span>
            {hasActiveFilters && (
              <motion.button
                onClick={onClearFilters}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-full hover:bg-slate-100/60 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear filters
              </motion.button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Filter Toggle Button */}
            <motion.button
              onClick={onToggleFilters}
              className="flex items-center space-x-2 px-4 py-2.5 border border-slate-300/60 rounded-2xl text-slate-600 hover:bg-slate-50/80 transition-all duration-300 bg-white/60 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={viewSettings.showFilters ? "Hide filters" : "Show filters"}
            >
              {viewSettings.showFilters ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="text-sm font-medium">
                {viewSettings.showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
            </motion.button>

            {/* Refresh Button - Commented out */}
            {/*
            <motion.button
              onClick={onRefreshProducts}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2.5 border border-slate-300/60 rounded-2xl text-slate-600 hover:bg-slate-50/80 transition-all duration-300 bg-white/60 backdrop-blur-sm disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Refresh products"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="text-sm font-medium">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </motion.button>
            */}

            {/* Mobile Filter Toggle */}
            <motion.button
              onClick={onToggleFilters}
              className="lg:hidden flex items-center space-x-2 px-4 py-2.5 border border-slate-300/60 rounded-2xl text-slate-600 hover:bg-slate-50/80 transition-all duration-300 bg-white/60 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SlidersHorizontal size={16} />
              <span className="text-sm font-medium">Filters</span>
            </motion.button>

            {/* View Mode Toggle */}
            <div className="flex border border-slate-300/60 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm">
              <motion.button
                onClick={() => onViewModeChange('grid')}
                className={`p-2.5 transition-all duration-300 ${viewSettings.viewMode === 'grid' ? 'bg-slate-100/80 text-slate-900' : 'text-slate-600 hover:bg-slate-50/60'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3X3 size={16} />
              </motion.button>
              <motion.button
                onClick={() => onViewModeChange('list')}
                className={`p-2.5 border-l border-slate-300/60 transition-all duration-300 ${viewSettings.viewMode === 'list' ? 'bg-slate-100/80 text-slate-900' : 'text-slate-600 hover:bg-slate-50/60'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={16} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurationControlsBar;