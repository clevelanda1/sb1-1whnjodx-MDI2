import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, Trash2, Loader2, Eye } from 'lucide-react';
import { SavedVisionBoard } from '../../services/visionBoardService';

interface LoadVisionBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (boardId: string) => Promise<void>;
  onDelete: (boardId: string) => Promise<void>;
  savedBoards: SavedVisionBoard[];
  isLoading?: boolean;
  onLoadSavedBoards: () => Promise<void>;
}

const LoadVisionBoardModal: React.FC<LoadVisionBoardModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  onDelete,
  savedBoards,
  isLoading = false,
  onLoadSavedBoards
}) => {
  const [loadingBoardId, setLoadingBoardId] = useState<string | null>(null);
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);

  // Load saved boards when modal opens
  useEffect(() => {
    if (isOpen && savedBoards.length === 0) {
      onLoadSavedBoards().catch(error => {
        console.error('❌ LoadVisionBoardModal: Error loading saved boards:', error);
      });
    }
  }, [isOpen, onLoadSavedBoards, savedBoards.length]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLoad = async (boardId: string) => {
    try {
      setLoadingBoardId(boardId);
      await onLoad(boardId);
      onClose();
    } catch (error) {
      console.error('❌ LoadVisionBoardModal: Error loading board:', error);
    } finally {
      setLoadingBoardId(null);
    }
  };

  const handleDelete = async (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingBoardId(boardId);
      await onDelete(boardId);
    } catch (error) {
      console.error('❌ LoadVisionBoardModal: Error deleting board:', error);
    } finally {
      setDeletingBoardId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('❌ Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  // Override isLoading if we have boards - this prevents timing issues
  const effectiveIsLoading = isLoading && savedBoards.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop - matching SaveVisionBoardModal */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal - larger than save modal to accommodate grid */}
          <motion.div
            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {/* Close Button - matching SaveVisionBoardModal */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-full transition-all duration-200 z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={18} />
            </motion.button>

            {/* Content */}
            <div className="p-8">
              {/* Icon - matching SaveVisionBoardModal style */}
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <FolderOpen size={24} className="text-white" />
              </motion.div>

              {/* Title - matching SaveVisionBoardModal */}
              <motion.h2
                className="text-2xl font-semibold text-slate-900 text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Load Vision Board
              </motion.h2>

              {/* Description - matching SaveVisionBoardModal */}
              <motion.p
                className="text-slate-600 text-center leading-relaxed mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Choose a saved vision board to continue working
              </motion.p>

              {/* Content Area - Fixed height with scrolling */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="h-96 overflow-y-auto rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4">
                  <AnimatePresence mode="wait">
                    {effectiveIsLoading ? (
                      // Loading State
                      <motion.div
                        key="loading-state"
                        className="flex flex-col items-center justify-center py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                          <Loader2 className="animate-spin text-violet-600" size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Loading your boards...</h3>
                        <p className="text-slate-600 text-sm">This will just take a moment</p>
                      </motion.div>
                    ) : savedBoards.length === 0 ? (
                      // Empty State
                      <motion.div
                        key="empty-state"
                        className="flex flex-col items-center justify-center py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6">
                          <FolderOpen className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No saved boards yet</h3>
                        <p className="text-slate-600 text-center text-sm leading-relaxed">
                          Create your first vision board and save it to see it here
                        </p>
                      </motion.div>
                    ) : (
                      // Boards Grid
                      <motion.div
                        key="boards-grid"
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {savedBoards.map((board, index) => (
                          <motion.div
                            key={board.id}
                            className="group relative bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => handleLoad(board.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Board Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 text-sm mb-1 truncate group-hover:text-violet-700 transition-colors">
                                  {board.name || `Vision Board ${index + 1}`}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {board.description || 'Custom vision board'}
                                </p>
                              </div>
                              
                              {/* Action Buttons */}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLoad(board.id);
                                  }}
                                  className="p-1.5 bg-violet-100 hover:bg-violet-200 text-violet-600 rounded-lg transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Eye size={12} />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => handleDelete(board.id, e)}
                                  disabled={deletingBoardId === board.id}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {deletingBoardId === board.id ? (
                                    <Loader2 className="animate-spin" size={12} />
                                  ) : (
                                    <Trash2 size={12} />
                                  )}
                                </motion.button>
                              </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-slate-500 text-xs mb-1 font-medium">
                                  {board.created_at ? formatDate(board.created_at) : 'No date'}
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <div className="text-green-700 text-sm font-semibold">
                                  ${board.board_data?.totalBudget?.toLocaleString() || '0'}
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-violet-50 rounded-lg">
                                <div className="text-violet-700 text-sm font-semibold">
                                  {board.board_data?.items?.length || 0} items
                                </div>
                              </div>
                            </div>

                            {/* Loading Overlay */}
                            {loadingBoardId === board.id && (
                              <motion.div
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={16} />
                                  </div>
                                  <p className="text-xs font-medium text-slate-700">Loading...</p>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Actions - matching SaveVisionBoardModal button style */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <motion.button
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300/60 rounded-2xl font-medium text-slate-700 hover:bg-slate-50/80 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </motion.div>

              {/* Footer Info */}
              {savedBoards.length > 0 && !effectiveIsLoading && (
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <p className="text-xs text-slate-500">
                    Click on any board to load it instantly
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadVisionBoardModal;