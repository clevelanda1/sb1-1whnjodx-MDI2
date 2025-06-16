import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { ApiUsage } from '../../services/apiUsageService';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface ApiUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUsage: ApiUsage | null;
  isLoading?: boolean;
}

const ApiUsageModal: React.FC<ApiUsageModalProps> = ({
  isOpen,
  onClose,
  apiUsage,
  isLoading = false
}) => {
  const { subscription, limits } = useSubscription();
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate next reset date (one month after last reset)
  const getNextResetDate = (lastResetDate: string) => {
    const lastReset = new Date(lastResetDate);
    const nextReset = new Date(lastReset);
    nextReset.setMonth(nextReset.getMonth() + 1);
    
    return formatDate(nextReset.toISOString());
  };

  // Calculate usage percentage
  const getUsagePercent = (current: number, limit: number) => {
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  // Get Etsy limit based on subscription tier
  const getEtsyLimit = () => {
    if (subscription.tier === 'free') return 25;
    if (subscription.tier === 'pro') return 125;
    return 750; // studio tier
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
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
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

            {/* Header */}
            <div className="p-8 border-b border-slate-200/60">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <BarChart size={24} className="text-white" />
              </motion.div>

              <motion.h2
                className="text-2xl font-semibold text-slate-900 text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Your API Usage Statistics
              </motion.h2>

              <motion.p
                className="text-slate-600 text-center leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Track your API usage and monthly limits
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <RefreshCw className="animate-spin" size={20} />
                    <span className="font-medium">Loading API usage data...</span>
                  </div>
                </div>
              ) : !apiUsage ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No API usage data available</h3>
                  <p className="text-slate-600">
                    API usage tracking data is not available at this time.
                  </p>
                </div>
              ) : (
                <>
                  {/* API Usage Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Amazon API Usage */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Amazon API Usage
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Usage Bar */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-600">Monthly Usage</span>
                            <span className="text-sm font-medium">
                              {apiUsage.amazon_total_count} / {limits.apiCalls}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getUsagePercent(apiUsage.amazon_total_count, limits.apiCalls) >= 90
                                  ? 'bg-red-500'
                                  : getUsagePercent(apiUsage.amazon_total_count, limits.apiCalls) >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${getUsagePercent(apiUsage.amazon_total_count, limits.apiCalls)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Reset Info */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>
                            Next reset: {getNextResetDate(apiUsage.last_reset_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Etsy API Usage */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        Etsy API Usage
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Usage Bar */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-600">Monthly Usage</span>
                            <span className="text-sm font-medium">
                              {apiUsage.etsy_total_count} / {getEtsyLimit()}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                getUsagePercent(apiUsage.etsy_total_count, getEtsyLimit()) >= 90
                                  ? 'bg-red-500'
                                  : getUsagePercent(apiUsage.etsy_total_count, getEtsyLimit()) >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${getUsagePercent(apiUsage.etsy_total_count, getEtsyLimit())}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Reset Info */}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar size={14} className="flex-shrink-0" />
                          <span>
                            Next reset: {getNextResetDate(apiUsage.last_reset_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info Box */}
                  <div className="mt-6 bg-blue-50/80 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-xs">i</span>
                      </div>
                      <div>
                        <p className="text-blue-800 text-sm font-medium mb-1">About API Usage</p>
                        <p className="text-blue-700 text-xs leading-relaxed">
                          API usage counters reset monthly based on your billing cycle. 
                          Your monthly limit is determined by your subscription plan.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200/60 text-center">
              <motion.button
                onClick={onClose}
                className="px-6 py-3 border border-slate-300/60 rounded-2xl font-medium text-slate-700 hover:bg-slate-50/80 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApiUsageModal;