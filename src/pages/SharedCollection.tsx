import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2, ExternalLink, Star, Eye, Calendar, ArrowLeft } from 'lucide-react';
import { ShareService, SharedCollectionPublic } from '../services/shareService';
import { UnifiedProduct } from '../services/combinedSearch';

const SharedCollection: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [collection, setCollection] = useState<SharedCollectionPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareToken) {
      loadSharedCollection(shareToken);
    }
  }, [shareToken]);

  const loadSharedCollection = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await ShareService.getSharedCollection(token);
      
      if (!data) {
        setError('Collection not found or has expired');
        return;
      }
      
      setCollection(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSourceColor = (source: string) => {
    return source === 'amazon' ? 'text-orange-600' : 'text-purple-600';
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'amazon' 
      ? 'bg-orange-100 text-orange-700 border-orange-200' 
      : 'bg-purple-100 text-purple-700 border-purple-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Collection...</h2>
          <p className="text-slate-600">Please wait while we fetch the shared collection</p>
        </motion.div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Collection Not Found</h2>
          <p className="text-slate-600 mb-6">
            {error || 'This collection may have been removed or the link has expired.'}
          </p>
          <motion.button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={16} />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-16 lg:py-20 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" className="text-white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="w-16 h-1 bg-gradient-to-r from-violet-400 to-blue-400 mb-6 rounded-full"
            />
            
            <motion.h1 
              className="font-light text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {collection.project_name}
              </span>
              <span className="block font-light text-2xl md:text-3xl lg:text-4xl mt-2 text-slate-300">
                Shared Collection
              </span>
            </motion.h1>
            
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-slate-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Created {formatDate(collection.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{collection.view_count} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 size={16} />
                <span>{collection.products.length} products</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {collection.products.map((product, index) => (
            <motion.div
              key={product.id}
              className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/400x400/f1f5f9/64748b?text=${encodeURIComponent(product.title.slice(0, 20))}`;
                  }}
                />
                
                {/* Source Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 border rounded-full text-xs font-medium capitalize ${getSourceBadgeColor(product.source)}`}>
                  {product.source}
                </div>

                {/* External Link Indicator */}
                <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ExternalLink size={14} className="text-slate-600" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-slate-900 text-lg mb-3 line-clamp-2">
                  {product.title}
                </h3>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-yellow-500">
                    {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-slate-500 ml-2 font-medium">
                    ({product.reviewsCount.toLocaleString()})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-2xl text-slate-900">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <motion.a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                      product.source === 'amazon'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Shop Now</span>
                    <ExternalLink size={14} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              About This Collection
            </h3>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
              This collection was curated using AI-powered design analysis. Each product has been 
              carefully selected to match the design elements and style of the original inspiration. 
              Click "Shop Now" to purchase any item directly from the retailer.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedCollection;