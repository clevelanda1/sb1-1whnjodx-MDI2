import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { subscription } = useSubscription();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Get plan display name based on subscription tier
  const getPlanDisplayName = () => {
    switch (subscription.tier) {
      case 'studio':
        return 'Studio Plan';
      case 'pro':
        return 'Pro Plan';
      default:
        return 'Free Plan';
    }
  };

  // Get plan color based on subscription tier
  const getPlanColor = () => {
    switch (subscription.tier) {
      case 'studio':
        return 'bg-blue-100 text-blue-700';
      case 'pro':
        return 'bg-violet-100 text-violet-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            className="absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl py-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                  {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                  </p>
                  <p className="text-sm text-slate-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="px-4 py-3 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Subscription</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPlanColor()}`}>
                  {getPlanDisplayName()}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link 
                to="/account" 
                className="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={onClose}
              >
                <Settings size={16} />
                <span className="text-sm font-medium">Account Settings</span>
              </Link>

              {subscription.tier === 'free' && (
                <Link 
                  to="/upgrade" 
                  className="flex items-center gap-3 px-4 py-2.5 text-violet-600 hover:bg-violet-50 transition-colors"
                  onClick={onClose}
                >
                  <Crown size={16} />
                  <div>
                    <span className="text-sm font-medium">Upgrade Plan</span>
                    {/* Only show "Want to remove ads?" text for free tier users */}
                    <p className="text-xs text-slate-500">Want to remove ads?</p>
                  </div>
                </Link>
              )}

              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountMenu;