import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface EmptyStatesProps {
  hasLikedProducts: boolean;
  type: 'products' | 'board';
}

const EmptyStates: React.FC<EmptyStatesProps> = ({ hasLikedProducts, type }) => {
  if (type === 'products') {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">
          {hasLikedProducts === false 
            ? "No liked products yet. Like products from the curation page to see them here."
            : "No products match your current filters."
          }
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium text-lg mb-2">Create your vision board</p>
        <p className="text-slate-500 text-sm max-w-xs">
          {hasLikedProducts === false 
            ? "Like products from the curation page, then drag them here or double-click to add to center"
            : "Drag products from the sidebar or double-click them to add to the center of your board"
          }
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyStates;