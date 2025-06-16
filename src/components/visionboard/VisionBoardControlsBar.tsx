import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, RotateCcw, Save, Share2, FolderOpen, AlertCircle, Crown, Edit2 } from 'lucide-react';
import SaveVisionBoardModal from './SaveVisionBoardModal';
import LoadVisionBoardModal from './LoadVisionBoardModal';
import ShareVisionBoardModal from './ShareVisionBoardModal';
import { SavedVisionBoard } from '../../services/visionBoardService';
import { VisionBoardItem } from '../../types/visionboard';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface VisionBoardControlsBarProps {
  itemCount: number;
  totalBudget: number;
  showSidebar: boolean;
  savedBoards: SavedVisionBoard[];
  isLoadingSavedBoards: boolean;
  isSaving: boolean;
  boardItems: VisionBoardItem[];
  currentBoardId?: string;
  currentBoardName: string;
  onToggleSidebar: () => void;
  onClearBoard: () => void;
  onSaveBoard: (boardName: string) => Promise<void>;
  onLoadBoard: (boardId: string) => Promise<void>;
  onDeleteBoard: (boardId: string) => Promise<void>;
  onLoadSavedBoards: () => Promise<void>;
  onUpdateBoardName?: (boardId: string, newName: string) => Promise<void>;
}

const VisionBoardControlsBar: React.FC<VisionBoardControlsBarProps> = ({
  itemCount,
  totalBudget,
  showSidebar,
  savedBoards,
  isLoadingSavedBoards,
  isSaving,
  boardItems,
  currentBoardId,
  currentBoardName,
  onToggleSidebar,
  onClearBoard,
  onSaveBoard,
  onLoadBoard,
  onDeleteBoard,
  onLoadSavedBoards,
  onUpdateBoardName
}) => {
  const { subscription, limits } = useSubscription();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUpgradeInfo, setShowUpgradeInfo] = useState(false);
  const [saveError, setShowSaveError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentBoardName);

  // Check if user can save vision boards (free tier can save 1, paid tiers can save more)
  const canSaveVisionBoards = true; // All users can save at least one board
  
  // Check if user can share vision boards based on subscription
  const canShareVisionBoards = subscription.tier !== 'free';
  
  // Check if user has reached their saved boards limit
  const hasReachedSavedBoardsLimit = 
    (subscription.tier === 'free' && savedBoards.length >= limits.visionBoards && !currentBoardId) ||
    (subscription.tier === 'pro' && savedBoards.length >= limits.visionBoards && !currentBoardId);

  const handleSaveBoard = async (boardName: string) => {
    try {
      if (hasReachedSavedBoardsLimit && !currentBoardId) {
        setShowSaveError(`You've reached the limit of ${limits.visionBoards} saved boards for your ${subscription.tier} plan.`);
        return;
      }
      
      setShowSaveError(null);
      await onSaveBoard(boardName);
      setShowSaveModal(false);
    } catch (error: any) {
      setShowSaveError(error.message || 'Failed to save vision board');
    }
  };

  const handleSaveClick = () => {
    if (itemCount === 0) {
      setShowUpgradeInfo(true);
      setTimeout(() => setShowUpgradeInfo(false), 3000);
      return;
    }
    
    if (hasReachedSavedBoardsLimit && !currentBoardId) {
      setShowUpgradeInfo(true);
      setTimeout(() => setShowUpgradeInfo(false), 3000);
      return;
    }
    
    setShowSaveModal(true);
  };

  const handleLoadClick = () => {
    if (savedBoards.length === 0 && !isLoadingSavedBoards) {
      setShowUpgradeInfo(true);
      setTimeout(() => setShowUpgradeInfo(false), 3000);
      return;
    }
    
    setShowLoadModal(true);
  };

  const handleShareClick = () => {
    if (!canShareVisionBoards) {
      setShowUpgradeInfo(true);
      setTimeout(() => setShowUpgradeInfo(false), 3000);
      return;
    }
    
    if (!currentBoardId) {
      // Need to save first
      setShowUpgradeInfo(true);
      setTimeout(() => setShowUpgradeInfo(false), 3000);
      return;
    }
    
    setShowShareModal(true);
  };

  const handleEditNameClick = () => {
    if (!currentBoardId) {
      // Can't edit name of unsaved board
      return;
    }
    
    setEditedName(currentBoardName);
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!currentBoardId || !onUpdateBoardName || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }
    
    try {
      await onUpdateBoardName(currentBoardId, editedName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating board name:', error);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(currentBoardName);
    }
  };

  const hasNoBoardsToLoad = !isLoadingSavedBoards && savedBoards.length === 0;
  
  // Check if the current board is saved
  const isBoardSaved = !!currentBoardId;

  return (
    <>
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 font-medium">
                {itemCount} items on board
              </span>
              
              <div className="bg-slate-100/60 px-4 py-2 rounded-full">
                <span className="text-sm text-slate-600">Total Budget: </span>
                <span className="font-semibold text-slate-900">${totalBudget.toLocaleString()}</span>
              </div>
              
              {currentBoardId && (
                <div className="bg-violet-100/60 px-4 py-2 rounded-full flex items-center gap-2">
                  {isEditingName ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={handleNameKeyDown}
                      className="bg-transparent border-b border-violet-300 focus:outline-none focus:border-violet-500 text-sm text-violet-600 font-medium px-1 py-0.5 w-40"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="text-sm text-violet-600 font-medium">{currentBoardName}</span>
                      <motion.button
                        onClick={handleEditNameClick}
                        className="p-1 text-violet-400 hover:text-violet-600 hover:bg-violet-100 rounded-full transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit2 size={12} />
                      </motion.button>
                    </>
                  )}
                </div>
              )}
              
              {/* Subscription Tier Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                subscription.tier === 'studio' 
                  ? 'bg-blue-100 text-blue-700' 
                  : subscription.tier === 'pro'
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={onToggleSidebar}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/60 rounded-full transition-all duration-200"
                title="Toggle product sidebar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showSidebar ? <EyeOff size={18} /> : <Eye size={18} />}
              </motion.button>
              
              <motion.button
                onClick={onClearBoard}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/60 rounded-full transition-all duration-200"
                title="Clear board"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={18} />
              </motion.button>
              
              <motion.button 
                onClick={handleLoadClick}
                disabled={hasNoBoardsToLoad}
                className={`flex items-center space-x-2 px-4 py-2.5 border border-slate-300/60 rounded-full text-slate-600 hover:bg-slate-50/80 transition-all duration-200 font-medium ${
                  hasNoBoardsToLoad ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''
                }`}
                title={hasNoBoardsToLoad 
                  ? "No saved boards to load" 
                  : "Load saved board"}
                whileHover={{ scale: !hasNoBoardsToLoad ? 1.02 : 1 }}
                whileTap={{ scale: !hasNoBoardsToLoad ? 0.98 : 1 }}
              >
                <FolderOpen size={16} />
                <span>Load</span>
              </motion.button>
              
              <motion.button 
                onClick={handleSaveClick}
                disabled={itemCount === 0 || isSaving || (hasReachedSavedBoardsLimit && !currentBoardId)}
                className={`flex items-center space-x-2 px-4 py-2.5 border border-slate-300/60 rounded-full text-slate-600 hover:bg-slate-50/80 transition-all duration-200 font-medium ${
                  itemCount === 0 || isSaving || (hasReachedSavedBoardsLimit && !currentBoardId) 
                    ? 'opacity-50 cursor-not-allowed hover:bg-transparent' 
                    : ''
                }`}
                title={itemCount === 0 
                  ? "Add items to save" 
                  : hasReachedSavedBoardsLimit && !currentBoardId
                  ? `You've reached the limit of ${limits.visionBoards} saved boards`
                  : "Save board"}
                whileHover={{ scale: itemCount > 0 && !isSaving && !(hasReachedSavedBoardsLimit && !currentBoardId) ? 1.02 : 1 }}
                whileTap={{ scale: itemCount > 0 && !isSaving && !(hasReachedSavedBoardsLimit && !currentBoardId) ? 0.98 : 1 }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </motion.button>
              
              {/* Share button - checks if board is saved and if user can share */}
              <motion.button 
                onClick={handleShareClick}
                disabled={itemCount === 0 || !isBoardSaved || !canShareVisionBoards}
                className={`flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all duration-200 font-medium ${
                  itemCount === 0 || !isBoardSaved || !canShareVisionBoards
                    ? 'opacity-50 cursor-not-allowed hover:bg-slate-900' 
                    : ''
                }`}
                title={!canShareVisionBoards 
                  ? "Upgrade to Pro or Studio to share boards" 
                  : !isBoardSaved 
                  ? "Save board first to share" 
                  : itemCount === 0
                  ? "Add items to share"
                  : "Share board"}
                whileHover={{ scale: canShareVisionBoards && isBoardSaved && itemCount > 0 ? 1.02 : 1 }}
                whileTap={{ scale: canShareVisionBoards && isBoardSaved && itemCount > 0 ? 0.98 : 1 }}
              >
                <Share2 size={16} />
                <span>Share</span>
              </motion.button>
            </div>
          </div>
          
          {/* Upgrade Info Message */}
          <AnimatePresence>
            {showUpgradeInfo && (
              <motion.div 
                className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-lg z-50 flex items-start gap-3 max-w-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-sm font-medium">
                    {itemCount === 0 
                      ? "Add Items First" 
                      : hasReachedSavedBoardsLimit && !currentBoardId
                      ? "Board Limit Reached"
                      : !isBoardSaved && canShareVisionBoards
                      ? "Save Required"
                      : "Upgrade Required"}
                  </p>
                  <p className="text-amber-700 text-xs">
                    {itemCount === 0 
                      ? "Add some items to your vision board before saving." 
                      : hasReachedSavedBoardsLimit && !currentBoardId
                      ? `You've reached the limit of ${limits.visionBoards} saved boards for your ${subscription.tier} plan. Upgrade or delete some boards.`
                      : !isBoardSaved && canShareVisionBoards
                      ? "You need to save your board before sharing it."
                      : "Upgrade to Pro or Studio to access this feature."}
                  </p>
                  <a 
                    href="/upgrade" 
                    className="text-xs text-amber-800 font-medium mt-1 inline-block hover:underline"
                  >
                    View Upgrade Options
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Save Modal */}
      <SaveVisionBoardModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBoard}
        isLoading={isSaving}
        initialName={currentBoardName}
        error={saveError}
        hasReachedLimit={hasReachedSavedBoardsLimit && !currentBoardId}
        maxBoards={limits.visionBoards}
      />

      {/* Load Modal */}
      <LoadVisionBoardModal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onLoad={onLoadBoard}
        onDelete={onDeleteBoard}
        savedBoards={savedBoards}
        isLoading={isLoadingSavedBoards}
        onLoadSavedBoards={onLoadSavedBoards}
      />

      {/* Share Modal - Pass isSaved prop */}
      <ShareVisionBoardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        boardName={currentBoardName || "My Vision Board"}
        boardItems={boardItems}
        totalBudget={totalBudget}
        originalBoardId={currentBoardId}
        isSaved={isBoardSaved}
        canShare={canShareVisionBoards}
      />
    </>
  );
};

export default VisionBoardControlsBar;