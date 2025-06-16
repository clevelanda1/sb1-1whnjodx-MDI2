import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, ExternalLink, Loader2, Share2, DollarSign } from 'lucide-react';
import { VisionBoardShareService, SharedVisionBoardPublic } from '../services/visionBoardShareService';
import { VisionBoardItem } from '../types/visionboard';
import { WhiteLabelService } from '../services/whiteLabelService';
import { WhiteLabelSettings } from '../types/visionboard';

const SharedVisionBoard: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [sharedBoard, setSharedBoard] = useState<SharedVisionBoardPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [whiteLabelSettings, setWhiteLabelSettings] = useState<WhiteLabelSettings | null>(null);

  useEffect(() => {
    if (shareToken) {
      loadSharedVisionBoard(shareToken);
    }
  }, [shareToken]);

  const loadSharedVisionBoard = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await VisionBoardShareService.getSharedVisionBoard(token);
      
      if (!data) {
        setError('Vision board not found or has expired');
        return;
      }
      
      setSharedBoard(data);
      
      // If this is a Studio tier user's board, load their white label settings
      if (data.creator_subscription_tier === 'studio' && data.creator_id) {
        try {
          const settings = await WhiteLabelService.getWhiteLabelSettingsForUser(data.creator_id);
          setWhiteLabelSettings(settings);
        } catch (whiteError) {
          console.error('Error loading white label settings:', whiteError);
          // Continue without white label settings
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load vision board');
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
    return source === 'amazon' ? 'text-orange-600' : 'text-teal-600';
  };

  const getSourceBadgeColor = (source: string) => {
    return source === 'amazon' 
      ? 'bg-orange-100 text-orange-700 border-orange-200' 
      : 'bg-teal-100 text-teal-700 border-teal-200';
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
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading Vision Board...</h2>
          <p className="text-slate-600">Please wait while we fetch the shared vision board</p>
        </motion.div>
      </div>
    );
  }

  if (error || !sharedBoard) {
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
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Vision Board Not Found</h2>
          <p className="text-slate-600 mb-6">
            {error || 'This vision board may have been removed or the link has expired.'}
          </p>
          <motion.a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={16} />
            Go to Homepage
          </motion.a>
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
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Header content with logo on the left */}
            <div className="flex items-center gap-12">
              {/* White Label Logo (if available) */}
              {whiteLabelSettings?.logoUrl && (
                <motion.div 
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                    <img 
                      src={whiteLabelSettings.logoUrl} 
                      alt="Company Logo" 
                      className="max-h-24 max-w-sm object-contain"
                    />
                  </div>
                </motion.div>
              )}

              {/* Main content */}
              <div className="flex-1">
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
                    {sharedBoard.board_name}
                  </span>
                  <span className="block font-light text-2xl md:text-3xl lg:text-4xl mt-2 text-slate-300">
                    Shared Vision Board
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
                    <span>Created {formatDate(sharedBoard.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{sharedBoard.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>${sharedBoard.total_budget.toLocaleString()}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Vision Board Canvas */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-500 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-2xl text-slate-900 flex items-center gap-3">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                {sharedBoard.board_name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>{sharedBoard.board_data.items.length} items</span>
                <span className="mx-2">•</span>
                <span>${sharedBoard.total_budget.toLocaleString()} total</span>
              </div>
            </div>
          </div>
          
          <div 
            className="relative bg-gradient-to-br from-slate-50/50 to-white/50 min-h-[600px] overflow-hidden"
            style={{ 
              backgroundImage: `
                radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)
              `,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Render board items */}
            {sharedBoard.board_data.items.map((item) => (
              <div
                key={item.boardId}
                className="absolute cursor-default select-none"
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: 10
                }}
              >
                <div className="relative w-full h-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 overflow-hidden group">
                  {/* Image */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img 
                      src={item.image || ''}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x400/f1f5f9/64748b?text=${encodeURIComponent(item.title.slice(0, 20))}`;
                      }}
                    />
                    
                    {/* Source Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 ${getSourceBadgeColor(item.source)} border rounded-full text-xs font-medium capitalize`}>
                      {item.source}
                    </div>
                    
                    {/* Hover overlay with product info */}
                    <motion.div 
                      className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end"
                      initial={false}
                    >
                      <div className="p-4 text-white w-full">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-slate-200 text-xs mb-2">${item.price}</p>
                        <a 
                          href={item.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 backdrop-blur-sm px-2 py-1 rounded-full transition-colors"
                        >
                          <span>View Product</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state if no items */}
            {sharedBoard.board_data.items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Share2 className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">This vision board is empty</p>
                  <p className="text-slate-500 text-sm mt-2">The creator hasn't added any items yet</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Info - Show MDI branding only if not white labeled */}
        {(!whiteLabelSettings?.logoUrl && sharedBoard.creator_subscription_tier !== 'studio') && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-lg overflow-hidden">
              <div className="flex flex-col lg:flex-row min-h-[300px]">
                {/* Left side - Slideshow (25%) */}
                <div className="lg:w-1/4 w-full relative bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  {/* Slideshow container */}
                  <div className="relative w-full h-full min-h-[250px] lg:min-h-[300px]">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="footer-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="20" cy="20" r="1.5" fill="currentColor"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#footer-dots)" className="text-slate-400" />
                      </svg>
                    </div>
                    
                    {/* Slideshow images */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{ 
                        backgroundImage: [
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                        ]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Icon container with MDI text */}
                      <motion.div
                        className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl w-40 h-40"
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        {/* MDI text */}
                        <motion.span 
                          className="text-4xl font-bold text-white"
                          whileHover={{ 
                            scale: 1.1,
                            transition: { type: "spring", stiffness: 400, damping: 17 }
                          }}
                          animate={{
                            textShadow: [
                              "0 0 20px rgba(255,255,255,0.5)",
                              "0 0 30px rgba(255,255,255,0.8)", 
                              "0 0 20px rgba(255,255,255,0.5)"
                            ]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          MDI
                        </motion.span>
                      </motion.div>
                    </motion.div>

                    {/* Floating elements */}
                    <motion.div
                      className="absolute top-6 right-6 w-16 h-16 bg-white/30 rounded-full"
                      animate={{ 
                        y: [0, -10, 0],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute bottom-8 left-6 w-6 h-6 bg-white/20 rounded-full"
                      animate={{ 
                        y: [0, -15, 0],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <motion.div
                      className="absolute top-1/3 left-4 w-4 h-4 bg-white/25 rounded-full"
                      animate={{ 
                        x: [0, 8, 0],
                        y: [0, -12, 0],
                        opacity: [0.25, 0.55, 0.25]
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                    />
                    <motion.div
                      className="absolute bottom-1/4 right-8 w-3 h-3 bg-white/15 rounded-full"
                      animate={{ 
                        x: [0, -6, 0],
                        y: [0, -8, 0],
                        opacity: [0.15, 0.4, 0.15]
                      }}
                      transition={{ 
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                  </div>
                </div>

                {/* Right side - Content (75%) */}
                <div className="lg:w-3/4 w-full p-6 lg:p-8 flex flex-col justify-center">
                  <div className="max-w-2xl">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-6 flex items-center gap-4"
                    >
                      {/* 4-dot logo */}
                      <motion.div 
                        className="relative w-12 h-12 -mt-2"
                        whileHover={{ 
                          scale: 1.1,
                          transition: { type: "spring", stiffness: 400, damping: 17 }
                        }}
                      >
                        <svg width="48" height="48" viewBox="0 0 32 32" className="w-full h-full">
                          {/* Glow effects behind each circle */}
                          <motion.circle 
                            cx="10" 
                            cy="10" 
                            r="8" 
                            fill="rgba(139, 92, 246, 0.3)"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0 * 0.6
                            }}
                          />
                          <motion.circle 
                            cx="22" 
                            cy="10" 
                            r="8" 
                            fill="rgba(59, 130, 246, 0.3)"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1 * 0.6
                            }}
                          />
                          <motion.circle 
                            cx="10" 
                            cy="22" 
                            r="8" 
                            fill="rgba(124, 58, 237, 0.3)"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 2 * 0.6
                            }}
                          />
                          <motion.circle 
                            cx="22" 
                            cy="22" 
                            r="8" 
                            fill="rgba(71, 85, 105, 0.3)"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 0.6, 0]
                            }}
                            transition={{ 
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 3 * 0.6
                            }}
                          />

                          {/* Main circles on top */}
                          <motion.circle 
                            cx="10" 
                            cy="10" 
                            r="6" 
                            fill="url(#gradient1)"
                            initial={{ scale: 0, opacity: 0.3 }}
                            animate={{ 
                              scale: 1,
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              scale: { delay: 0.1, type: "spring", stiffness: 400, damping: 17 },
                              opacity: { 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0 * 0.6
                              }
                            }}
                          />
                          <motion.circle 
                            cx="22" 
                            cy="10" 
                            r="6" 
                            fill="url(#gradient2)"
                            initial={{ scale: 0, opacity: 0.3 }}
                            animate={{ 
                              scale: 1,
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              scale: { delay: 0.2, type: "spring", stiffness: 400, damping: 17 },
                              opacity: { 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1 * 0.6
                              }
                            }}
                          />
                          <motion.circle 
                            cx="10" 
                            cy="22" 
                            r="6" 
                            fill="url(#gradient3)"
                            initial={{ scale: 0, opacity: 0.3 }}
                            animate={{ 
                              scale: 1,
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              scale: { delay: 0.3, type: "spring", stiffness: 400, damping: 17 },
                              opacity: { 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 2 * 0.6
                              }
                            }}
                          />
                          <motion.circle 
                            cx="22" 
                            cy="22" 
                            r="6" 
                            fill="url(#gradient4)"
                            initial={{ scale: 0, opacity: 0.3 }}
                            animate={{ 
                              scale: 1,
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{ 
                              scale: { delay: 0.4, type: "spring", stiffness: 400, damping: 17 },
                              opacity: { 
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 3 * 0.6
                              }
                            }}
                          />
                          
                          {/* Gradient definitions */}
                          <defs>
                            <linearGradient 
                              id="gradient1" 
                              x1="0%" 
                              y1="0%" 
                              x2="100%" 
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient 
                              id="gradient2" 
                              x1="0%" 
                              y1="0%" 
                              x2="100%" 
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#2563eb" />
                            </linearGradient>
                            <linearGradient 
                              id="gradient3" 
                              x1="0%" 
                              y1="0%" 
                              x2="100%" 
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#7c3aed" />
                              <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                            <linearGradient 
                              id="gradient4" 
                              x1="0%" 
                              y1="0%" 
                              x2="100%" 
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#475569" />
                              <stop offset="100%" stopColor="#334155" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </motion.div>

                      <h3 className="text-xl font-semibold text-slate-900 mb-4">
                        About This Vision Board
                      </h3>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="text-slate-600 leading-relaxed mb-8"
                    >
                      This vision board was created and shared using MDI. 
                      Click on any item to view and purchase it directly from the retailer.
                    </motion.p>

                    {/* CTA Button 
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300 group"
                      >
                        <span>Create Your Own Vision Board</span>
                        <ArrowLeft size={16} className="transform rotate-180 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>*/}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SharedVisionBoard;
