import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Filter } from 'lucide-react';

interface EmptyStateProps {
  showFavoritesOnly?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ showFavoritesOnly = false }) => {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut" }}
    >
      <div className="text-slate-400 mb-4">
        {showFavoritesOnly ? (
          <Heart size={48} className="mx-auto" />
        ) : (
          <Filter size={48} className="mx-auto" />
        )}
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">
        {showFavoritesOnly ? 'No favorite products found' : 'No products found'}
      </h3>
      <p className="text-slate-600 font-light">
        {showFavoritesOnly 
          ? 'You haven\'t liked any products yet. Heart some products to see them here!'
          : 'Try adjusting your filters or search terms to see more results.'
        }
      </p>
    </motion.div>
  );
};

export default EmptyState;