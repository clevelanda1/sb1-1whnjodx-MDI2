import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, List, Layout, BarChart, Crown } from 'lucide-react';
import { ProjectFilters } from '../../types/studio';
import { ApiUsage, GlobalApiLimits } from '../../services/apiUsageService';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Link } from 'react-router-dom';

interface StudioControlsBarProps {
  projectCount: number;
  searchQuery: string;
  filters: ProjectFilters;
  apiUsage?: ApiUsage | null;
  globalLimits?: GlobalApiLimits;
  onClearSearch: () => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onShowApiUsage?: () => void;
}

const StudioControlsBar: React.FC<StudioControlsBarProps> = ({
  projectCount,
  searchQuery,
  filters,
  apiUsage,
  globalLimits,
  onClearSearch,
  onViewModeChange,
  onShowApiUsage
}) => {
  const { subscription } = useSubscription();
  
  // Calculate API usage percentages
  const getApiUsagePercent = (current: number, limit: number) => {
    if (limit <= 0) return 0; // Avoid division by zero
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const amazonUsagePercent = apiUsage && globalLimits?.amazon.monthly_limit 
    ? getApiUsagePercent(apiUsage.amazon_total_count, globalLimits.amazon.monthly_limit)
    : 0;
    
  const etsyUsagePercent = apiUsage && globalLimits?.etsy.monthly_limit
    ? getApiUsagePercent(apiUsage.etsy_total_count, globalLimits.etsy.monthly_limit)
    : 0;

  // Determine color based on usage percentage
  const getUsageColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 70) return 'text-amber-500';
    return 'text-emerald-500';
  };

  // Get Etsy limit based on subscription tier
  const getEtsyLimit = () => {
    if (subscription.tier === 'free') return 25;
    if (subscription.tier === 'pro') return 125;
    return 750; // studio tier
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 font-medium">
              {projectCount} projects {searchQuery ? 'found' : 'created'}
            </span>
            {searchQuery && (
              <motion.button
                onClick={onClearSearch}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-full hover:bg-slate-100/60 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear search
              </motion.button>
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
            
            {/* API Usage Indicators */}
            {apiUsage && globalLimits && (
              <div className="flex items-center gap-3">
                {globalLimits.amazon.monthly_limit > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className={`font-medium ${getUsageColor(amazonUsagePercent)}`}>
                      Amazon: {apiUsage.amazon_total_count}/{globalLimits.amazon.monthly_limit}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${amazonUsagePercent >= 90 ? 'bg-red-500' : amazonUsagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${amazonUsagePercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {globalLimits.etsy.monthly_limit > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className={`font-medium ${getUsageColor(etsyUsagePercent)}`}>
                      Etsy: {apiUsage.etsy_total_count}/{getEtsyLimit()}
                    </span>
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${etsyUsagePercent >= 90 ? 'bg-red-500' : etsyUsagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${getApiUsagePercent(apiUsage.etsy_total_count, getEtsyLimit())}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {onShowApiUsage && (
                  <motion.button
                    onClick={onShowApiUsage}
                    className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100/60 rounded-full transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="View API usage details"
                  >
                    <BarChart size={14} />
                  </motion.button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Upgrade Button - Show for free tier users */}
            {subscription.tier === 'free' && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/upgrade"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all duration-200 font-medium"
                >
                  <span>Upgrade Access</span>
                </Link>
              </motion.div>
            )}
            
            {/* Vision Board Button */}
            <motion.button
              onClick={() => window.location.href = '/visionboard'}
              className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all duration-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Layout size={16} />
              <span className="flex items-center space-x-2">
                <span>Vision Board</span>
                <span className="relative ml-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-full shadow-lg">
                  <span className="relative z-10">BETA</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full blur-sm opacity-70"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                </span>
              </span>
            </motion.button>
            
            <div className="flex border border-slate-300/60 rounded-2xl overflow-hidden bg-white/60 backdrop-blur-sm">
              <motion.button 
                onClick={() => onViewModeChange('grid')}
                className={`p-3 transition-all duration-200 ${
                  filters.viewMode === 'grid' 
                    ? 'bg-slate-100/80 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Grid3X3 size={18} />
              </motion.button>
              <motion.button 
                onClick={() => onViewModeChange('list')}
                className={`p-3 border-l border-slate-300/60 transition-all duration-200 ${
                  filters.viewMode === 'list' 
                    ? 'bg-slate-100/80 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <List size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioControlsBar;