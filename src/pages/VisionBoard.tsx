import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

// Custom hooks
import { useVisionBoardData } from '../hooks/useVisionBoardData';
import { useVisionBoardState } from '../hooks/useVisionBoardState';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { useProductFiltering } from '../hooks/useProductFiltering';

// Components
import VisionBoardHero from '../components/visionboard/VisionBoardHero';
import VisionBoardControlsBar from '../components/visionboard/VisionBoardControlsBar';
import ProductSidebar from '../components/visionboard/ProductSidebar';
import VisionBoardCanvas from '../components/visionboard/VisionBoardCanvas';

const VisionBoard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Custom hooks for business logic
  const { likedProducts, projects, isLoading, refreshData } = useVisionBoardData();
  
  const {
    boardItems,
    selectedItem,
    showSidebar,
    totalBudget,
    savedBoards,
    isLoadingSavedBoards,
    isSaving,
    currentBoardId,
    currentBoardName,
    addItemToBoard,
    moveItem,
    resizeItem,
    removeItem,
    selectItem,
    clearBoard,
    toggleSidebar,
    saveBoard,
    updateBoardName,
    loadBoard,
    deleteBoard,
    loadSavedBoards
  } = useVisionBoardState();

  const {
    isDragOver,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDoubleClick
  } = useDragAndDrop(addItemToBoard, boardRef);

  const {
    filters,
    filteredProducts,
    projectOptions,
    updateSearchQuery,
    updateSelectedProject
  } = useProductFiltering(likedProducts, projects);

  // Handle loading a board
  const handleLoadBoard = async (boardId: string) => {
    try {
      await loadBoard(boardId);
      // Refresh liked products data after loading a board
      refreshData();
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  // Handle saving a board
  const handleSaveBoard = async (boardName: string) => {
    try {
      await saveBoard(boardName);
      // Refresh liked products data after saving a board
      refreshData();
    } catch (error) {
      console.error('Error saving board:', error);
    }
  };

  // Handle updating a board name
  const handleUpdateBoardName = async (boardId: string, newName: string) => {
    try {
      await updateBoardName(boardId, newName);
      // Refresh liked products data after updating board name
      refreshData();
    } catch (error) {
      console.error('Error updating board name:', error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // Mouse tracking logic if needed for future features
    }
  };

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
              <pattern id="vision-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#vision-dots)" className="text-slate-600" />
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <VisionBoardHero />

      {/* Controls Bar */}
      <VisionBoardControlsBar
        itemCount={boardItems.length}
        totalBudget={totalBudget}
        showSidebar={showSidebar}
        savedBoards={savedBoards}
        isLoadingSavedBoards={isLoadingSavedBoards}
        isSaving={isSaving}
        boardItems={boardItems}
        currentBoardId={currentBoardId}
        currentBoardName={currentBoardName}
        onToggleSidebar={toggleSidebar}
        onClearBoard={clearBoard}
        onSaveBoard={handleSaveBoard}
        onLoadBoard={handleLoadBoard}
        onDeleteBoard={deleteBoard}
        onLoadSavedBoards={loadSavedBoards}
        onUpdateBoardName={handleUpdateBoardName}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Product Sidebar */}
          <ProductSidebar
            isVisible={showSidebar}
            isLoading={isLoading}
            likedProducts={likedProducts}
            filteredProducts={filteredProducts}
            filters={filters}
            projectOptions={projectOptions}
            onSearchChange={updateSearchQuery}
            onProjectChange={updateSelectedProject}
            onDragStart={handleDragStart}
            onDoubleClick={handleDoubleClick}
          />

          {/* Vision Board Canvas */}
          <div className={`${showSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <VisionBoardCanvas
              boardRef={boardRef}
              boardItems={boardItems}
              selectedItem={selectedItem}
              isDragOver={isDragOver}
              hasLikedProducts={likedProducts.length > 0}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onItemSelect={selectItem}
              onItemMove={moveItem}
              onItemRemove={removeItem}
              onItemResize={resizeItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionBoard;