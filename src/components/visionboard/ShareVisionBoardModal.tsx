import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, ExternalLink, Loader2, Calendar, Eye, AlertCircle, Crown } from 'lucide-react';
import { VisionBoardShareService } from '../../services/visionBoardShareService';
import { VisionBoardItem } from '../../types/visionboard';

interface ShareVisionBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName: string;
  boardItems: VisionBoardItem[];
  totalBudget: number;
  originalBoardId?: string;
  isLoading?: boolean;
  isSaved: boolean;
  canShare: boolean;
}

const ShareVisionBoardModal: React.FC<ShareVisionBoardModalProps> = ({
  isOpen,
  onClose,
  boardName,
  boardItems,
  totalBudget,
  originalBoardId,
  isLoading = false,
  isSaved = false,
  canShare = false
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState('');
  const [expiryDays, setExpiryDays] = useState<number | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCreateShare = async () => {
    try {
      // Check if user can share vision boards
      if (!canShare) {
        setError('You need to upgrade to Pro or Studio to share vision boards');
        return;
      }
      
      // Check if the board is saved first
      if (!isSaved) {
        setError('You must save the vision board before sharing it');
        return;
      }

      // Check if we have a board ID
      if (!originalBoardId) {
        setError('Unable to share: No saved board ID found');
        return;
      }

      setIsCreating(true);
      setError('');
      
      // Use the saved board ID to create a share link
      const { shareUrl: newShareUrl } = await VisionBoardShareService.createSharedVisionBoard(
        originalBoardId,
        expiryDays || undefined
      );
      
      setShareUrl(newShareUrl);
    } catch (error: any) {
      setError(error.message || 'Failed to create shareable link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await VisionBoardShareService.copyToClipboard(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, '_blank');
  };

  const handleUpgradeClick = () => {
    onClose();
    window.location.href = '/upgrade';
  };

  const expiryOptions = [
    { label: 'Never expires', value: null },
    { label: '1 day', value: 1 },
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 }
  ];

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
            className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
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
              <X size={20} />
            </motion.button>

            {/* Content */}
            <div className="p-8">
              {/* Icon */}
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <Share2 size={24} className="text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-semibold text-slate-900 text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Share Vision Board
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-slate-600 text-center leading-relaxed mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Create a shareable link for "{boardName}" with {boardItems.length} items
              </motion.p>

              {/* Subscription Required Warning */}
              {!canShare && (
                <motion.div
                  className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <Crown size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium mb-1">Upgrade Required</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        Vision board sharing is available on Pro and Studio plans. Upgrade now to share your vision boards with clients and collaborators.
                      </p>
                      <motion.button
                        onClick={handleUpgradeClick}
                        className="mt-2 px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg font-medium hover:bg-amber-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Upgrade Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Not Saved Warning */}
              {!isSaved && (
                <motion.div
                  className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-amber-800 text-sm font-medium mb-1">Board Not Saved</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        You need to save your vision board before sharing it. Please use the "Save" button in the control bar first.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {!shareUrl ? (
                <>
                  {/* Expiry Options */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      <Calendar size={16} className="inline mr-2" />
                      Link Expiration
                    </label>
                    <div className="space-y-2">
                      {expiryOptions.map((option) => (
                        <label key={option.label} className="flex items-center">
                          <input
                            type="radio"
                            name="expiry"
                            value={option.value || ''}
                            checked={expiryDays === option.value}
                            onChange={() => setExpiryDays(option.value)}
                            className="form-radio h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                            disabled={!canShare || !isSaved}
                          />
                          <span className="ml-3 text-sm text-slate-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-2xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                  )}

                  {/* Create Button */}
                  <motion.button
                    onClick={handleCreateShare}
                    disabled={isCreating || boardItems.length === 0 || !canShare || !isSaved || !originalBoardId}
                    className="w-full px-6 py-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Creating Link...</span>
                      </>
                    ) : !canShare ? (
                      <>
                        <Crown size={16} />
                        <span>Upgrade to Share</span>
                      </>
                    ) : !isSaved ? (
                      <>
                        <AlertCircle size={16} />
                        <span>Save Board First</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={16} />
                        <span>Create Shareable Link</span>
                      </>
                    )}
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Success State */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 mb-4">
                      <div className="flex items-center gap-2 text-emerald-700 mb-2">
                        <Check size={16} />
                        <span className="font-medium">Link created successfully!</span>
                      </div>
                      <p className="text-emerald-600 text-sm">
                        Anyone with this link can view the collection and access product links.
                      </p>
                    </div>

                    {/* Share URL */}
                    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Shareable Link
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-white border border-slate-300/60 rounded-lg text-sm font-mono text-slate-600"
                        />
                        <motion.button
                          onClick={handleCopyLink}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            isCopied 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Copy to clipboard"
                        >
                          {isCopied ? <Check size={16} /> : <Copy size={16} />}
                        </motion.button>
                        <motion.button
                          onClick={handleOpenLink}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          title="Open in new tab"
                        >
                          <ExternalLink size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Info */}
                  <motion.div
                    className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <div className="flex items-start gap-3">
                      <Eye size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 text-sm font-medium mb-1">Public Access</p>
                        <p className="text-blue-700 text-xs leading-relaxed">
                          Visitors can view all items on your vision board and click through to purchase on Amazon or Wayfair. 
                          No account required to view the board.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Close Button */}
                  <motion.button
                    onClick={onClose}
                    className="w-full px-6 py-3 border border-slate-300/60 rounded-2xl font-medium text-slate-700 hover:bg-slate-50/80 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.3 }}
                  >
                    Done
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareVisionBoardModal;