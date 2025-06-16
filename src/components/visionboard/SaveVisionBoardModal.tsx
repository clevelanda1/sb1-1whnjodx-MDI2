import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';

interface SaveVisionBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (boardName: string) => Promise<void>;
  isLoading?: boolean;
  initialName?: string;
  error?: string | null;
  hasReachedLimit?: boolean;
  maxBoards?: number;
}

const SaveVisionBoardModal: React.FC<SaveVisionBoardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  initialName = '',
  error = null,
  hasReachedLimit = false,
  maxBoards = 1
}) => {
  const [boardName, setBoardName] = useState('');
  const [localError, setLocalError] = useState('');

  // Set initial name when modal opens
  useEffect(() => {
    if (isOpen) {
      setBoardName(initialName || '');
      setLocalError('');
    }
  }, [isOpen, initialName]);

  // Update local error when prop error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!boardName.trim()) {
      setLocalError('Please enter a board name');
      return;
    }

    if (hasReachedLimit) {
      setLocalError(`You've reached the limit of ${maxBoards} saved board${maxBoards !== 1 ? 's' : ''}. Please upgrade your plan or delete some boards.`);
      return;
    }

    try {
      setLocalError('');
      await onSave(boardName.trim());
      setBoardName('');
      onClose();
    } catch (error: any) {
      setLocalError(error.message || 'Failed to save vision board');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {/* Close Button */}
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
              {/* Icon */}
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <Save size={24} className="text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-semibold text-slate-900 text-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Save Vision Board
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-slate-600 text-center leading-relaxed mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Give your vision board a name to save it for later
              </motion.p>

              {/* Limit Warning */}
              {hasReachedLimit && (
                <motion.div
                  className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium mb-1">Board Limit Reached</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        You've reached the limit of {maxBoards} saved board{maxBoards !== 1 ? 's' : ''} for your current plan. 
                        Please upgrade your subscription or delete some boards to continue.
                      </p>
                      <a 
                        href="/upgrade" 
                        className="text-xs text-amber-800 font-medium mt-1 inline-block hover:underline"
                      >
                        View Upgrade Options
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Input */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter board name..."
                  className="w-full px-4 py-3 border border-slate-300/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 bg-white/60 backdrop-blur-sm transition-all duration-300"
                  disabled={isLoading || hasReachedLimit}
                  autoFocus
                />
                {localError && (
                  <motion.p
                    className="mt-2 text-sm text-red-600"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {localError}
                  </motion.p>
                )}
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <motion.button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border border-slate-300/60 rounded-2xl font-medium text-slate-700 hover:bg-slate-50/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  onClick={handleSave}
                  disabled={!boardName.trim() || isLoading || hasReachedLimit}
                  className="flex-1 px-6 py-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Board</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SaveVisionBoardModal;