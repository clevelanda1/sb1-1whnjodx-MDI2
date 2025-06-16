import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useProjectData } from '../hooks/useProjectData';
import { useProductFilters } from '../hooks/useProductFilters';
import { useWishlist } from '../hooks/useWishlist';
import { usePagination } from '../hooks/usePagination';
import CurationHero from '../components/curation/CurationHero';
import CurationControlsBar from '../components/curation/CurationControlsBar';
import FilterSidebar from '../components/curation/FilterSidebar';
import ProductsGrid from '../components/curation/ProductsGrid';
import { ViewSettings } from '../types/curation';

const Curation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewSettings, setViewSettings] = React.useState<ViewSettings>({
    viewMode: 'grid',
    showFilters: true
  });

  // Custom hooks for business logic
  const { projectData, elementsWithProducts, isLoadingProject, isRefreshing, refreshProducts } = useProjectData();
  const { wishlist, toggleWishlist } = useWishlist(projectData.projectId);
  
  // Flatten all products from all elements
  const allProducts = React.useMemo(() => {
    return elementsWithProducts.flatMap(element => element.products);
  }, [elementsWithProducts]);
  
  const {
    filters,
    filteredProducts,
    hasActiveFilters,
    availableMarketplaces,
    updateSearchTerm,
    toggleElement,
    togglePriceRange,
    updateShowFavoritesOnly,
    toggleMarketplace,
    clearAllFilters
  } = useProductFilters(allProducts, projectData.detectedElements, wishlist);

  const {
    paginationState,
    getCurrentPageProducts,
    getPageNumbers,
    handlePageChange
  } = usePagination(filteredProducts.length);

  const currentPageProducts = getCurrentPageProducts(filteredProducts);
  const pageNumbers = getPageNumbers();

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // Mouse tracking logic if needed
    }
  };

  const handleToggleFilters = () => {
    setViewSettings(prev => ({ ...prev, showFilters: !prev.showFilters }));
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewSettings(prev => ({ ...prev, viewMode: mode }));
  };

  const handleRefreshProducts = async () => {
    await refreshProducts();
  };

  const handleRetry = () => {
    // Retry logic for failed searches
    window.location.reload();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (isLoadingProject) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-600">
          <Loader2 className="animate-spin text-violet-600\" size={24} />
          <span className="font-medium text-lg">Loading project...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="pt-16 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white min-h-screen"
      onMouseMove={handleMouseMove}
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-100/40 to-blue-100/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="curation-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#curation-dots)" className="text-slate-600" />
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <CurationHero projectName={projectData.projectName} />

      {/* Controls Bar */}
      <CurationControlsBar
        totalProducts={filteredProducts.length}
        currentPage={paginationState.currentPage}
        totalPages={paginationState.totalPages}
        hasActiveFilters={hasActiveFilters}
        viewSettings={viewSettings}
        isRefreshing={isRefreshing}
        onClearFilters={clearAllFilters}
        onToggleFilters={handleToggleFilters}
        onRefreshProducts={handleRefreshProducts}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Content */}
      <motion.div 
        className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={`grid gap-12 ${viewSettings.showFilters ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          
          {/* Filters Sidebar */}
          <FilterSidebar
            filters={filters}
            detectedElements={projectData.detectedElements}
            wishlistCount={wishlist.length}
            isVisible={viewSettings.showFilters}
            availableMarketplaces={availableMarketplaces}
            onSearchChange={updateSearchTerm}
            onToggleElement={toggleElement}
            onTogglePriceRange={togglePriceRange}
            onToggleFavoritesOnly={updateShowFavoritesOnly}
            onToggleMarketplace={toggleMarketplace}
          />
          
          {/* Products Grid */}
          <ProductsGrid
            products={filteredProducts}
            currentPageProducts={currentPageProducts}
            wishlist={wishlist}
            viewSettings={viewSettings}
            paginationState={paginationState}
            isSearching={false}
            searchError={undefined}
            pageNumbers={pageNumbers}
            onToggleWishlist={toggleWishlist}
            onPageChange={handlePageChange}
            onRetry={handleRetry}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Curation;