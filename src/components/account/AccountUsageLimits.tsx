import React from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { ApiUsage } from '../../services/apiUsageService';

interface AccountUsageLimitsProps {
  apiUsage: ApiUsage | null;
  isLoading: boolean;
  projectCount: number;
  visionBoardCount: number;
}

const AccountUsageLimits: React.FC<AccountUsageLimitsProps> = ({
  apiUsage,
  isLoading,
  projectCount,
  visionBoardCount
}) => {
  const { subscription, limits } = useSubscription();

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
    <motion.div 
      className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm sticky top-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Usage Limits</h2>
        <p className="text-slate-600 text-sm">Track your current usage</p>
      </div>

      <div className="space-y-8">
        {/* Projects Limit */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-900">Projects</h3>
            <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
              {subscription.tier === 'free' 
                ? `${limits.projects} max` 
                : subscription.tier === 'pro'
                ? `${limits.projects} max`
                : 'Unlimited'}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: subscription.tier === 'studio' 
                  ? '100%' 
                  : `${Math.min(100, (projectCount / limits.projects) * 100)}%` 
              }}
              transition={{ duration: 1, delay: 0.8 }}
            ></motion.div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {subscription.tier === 'studio' 
              ? 'No limits on your plan' 
              : `${projectCount} of ${limits.projects} projects used`}
          </p>
        </div>

        {/* API Calls - Amazon */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">Amazon</h3>
              <span className="text-xs text-orange-600 font-medium">(Search)</span>
            </div>
            <span className="text-sm font-semibold px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
              {limits.apiCalls} credits
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: isLoading 
                  ? '0%' 
                  : `${getUsagePercent(apiUsage?.amazon_total_count || 0, limits.apiCalls)}%` 
              }}
              transition={{ duration: 1, delay: 0.9 }}
            ></motion.div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {isLoading 
              ? 'Loading usage data...' 
              : `${apiUsage?.amazon_total_count || 0} of ${limits.apiCalls} credits used this month`
            }
          </p>
        </div>

        {/* API Calls - Etsy */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">Etsy</h3>
              <span className="text-xs text-teal-600 font-medium">(Search)</span>
            </div>
            <span className="text-sm font-semibold px-3 py-1 bg-teal-100 text-teal-700 rounded-full">
              {getEtsyLimit()} credits
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: isLoading 
                  ? '0%' 
                  : `${getUsagePercent(apiUsage?.etsy_total_count || 0, getEtsyLimit())}%` 
              }}
              transition={{ duration: 1, delay: 1 }}
            ></motion.div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {isLoading 
              ? 'Loading usage data...' 
              : `${apiUsage?.etsy_total_count || 0} of ${getEtsyLimit()} credits used this month`
            }
          </p>
        </div>

        {/* Vision Boards Limit */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-900">Vision Boards</h3>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              subscription.tier === 'free' 
                ? 'bg-slate-100 text-slate-600' 
                : subscription.tier === 'pro'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {subscription.tier === 'free' ? '1 max' : 
               subscription.tier === 'pro' ? `${limits.visionBoards} max` : 
               'Unlimited'}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${
                subscription.tier === 'free' 
                  ? 'bg-gradient-to-r from-slate-500 to-slate-400' 
                  : subscription.tier === 'pro'
                  ? 'bg-gradient-to-r from-violet-500 to-violet-400'
                  : 'bg-gradient-to-r from-blue-500 to-blue-400'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: subscription.tier === 'studio' 
                  ? '100%' 
                  : `${Math.min(100, (visionBoardCount / limits.visionBoards) * 100)}%` 
              }}
              transition={{ duration: 1, delay: 1.2 }}
            ></motion.div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {subscription.tier === 'studio' 
              ? 'No limits on your plan' 
              : `${visionBoardCount} of ${limits.visionBoards} boards created`
            }
          </p>
        </div>
      </div>

      {subscription.tier === 'free' && (
        <motion.div 
          className="mt-8 p-4 bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="text-center">
            <h4 className="font-semibold text-slate-900 mb-2">Unlock More Features</h4>
            <p className="text-sm text-slate-600 mb-4">Upgrade to Pro or Studio for more projects and advanced features.</p>
            <a
              href="/upgrade"
              className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-purple-700 transition-all duration-200 inline-block"
            >
              Upgrade Plan
            </a>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AccountUsageLimits;