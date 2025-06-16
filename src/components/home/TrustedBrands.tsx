import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TrustedBrands: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Subtle scroll transforms
  const y = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Primary marketplace partners
  const primaryPartners = [
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Our primary sourcing partner with millions of curated design recommendations across every category imaginable.',
      fullDescription: 'Amazon brings unparalleled scale and convenience to your design journey. With Prime shipping, customer reviews, and our AI-powered curation, you can trust that every recommendation is backed by quality and reliability.',
      logo: 'A',
      color: 'from-orange-600 to-orange-700',
      bgColor: 'from-orange-50 to-amber-50',
      accentColor: 'orange',
      stats: { 
        products: '10M+', 
        availability: '99.9%', 
        specialty: 'Everything Home'
      },
      image: '/images/amazon.jpg'
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Unique handmade and vintage finds from independent creators and artisans worldwide.',
      fullDescription: 'Etsy connects you with millions of talented creators offering one-of-a-kind pieces that you won\'t find anywhere else. From custom art to vintage treasures, discover items that truly reflect your personal style and make your space uniquely yours.',
      logo: 'E',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-cyan-50',
      accentColor: 'teal',
      stats: { 
        products: '120M+', 
        availability: '98.2%', 
        specialty: 'Handmade & Vintage'
      },
      image: '/images/etsy.jpg'
    }
  ];

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % primaryPartners.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [primaryPartners.length]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  const currentPartner = primaryPartners[currentSlide];

  const handleStartShopping = () => {
    navigate('/signup');
  };

  // Interior design products with proper imagery - updated for Amazon + Etsy
  const interiorProducts = [
    { 
      name: 'Modern Sectional Sofa', 
      price: 1299, 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center', 
      source: 'amazon',
      category: 'seating'
    },
    { 
      name: 'Handwoven Boho Wall Art', 
      price: 89, 
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=center', 
      source: 'etsy',
      category: 'art' 
    },
    { 
      name: 'Mid-Century Floor Lamp', 
      price: 189, 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center', 
      source: 'amazon',
      category: 'lighting' 
    },
    { 
      name: 'Vintage Ceramic Vase', 
      price: 45, 
      image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=150&h=150&fit=crop&crop=center', 
      source: 'etsy',
      category: 'decor' 
    },
    { 
      name: 'Walnut Console Table', 
      price: 599, 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop&crop=center', 
      source: 'amazon',
      category: 'storage' 
    },
    { 
      name: 'Macrame Plant Hanger', 
      price: 28, 
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop&crop=center', 
      source: 'etsy',
      category: 'decor' 
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic gradient orb that changes color based on current slide */}
        <motion.div
          className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${
            currentPartner.accentColor === 'orange' 
              ? 'from-orange-100/40 to-amber-100/40' 
              : 'from-teal-100/40 to-cyan-100/40'
          } rounded-full blur-3xl`}
          style={{ y }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Clean geometric pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="brands-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#brands-dots)" className="text-slate-600" />
          </svg>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10"
        style={{ opacity }}
      >
        {/* Refined Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="w-16 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto mb-6 rounded-full"
          />
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 leading-tight">
            <span className="font-thin text-slate-900">Powered by</span>
            <motion.span 
              className="block font-[800] bg-gradient-to-r from-slate-900 via-violet-600 via-blue-600 to-slate-900 bg-clip-text text-transparent bg-[length:200%_100%]"
              style={{
                fontFamily: '"Inter", "Nunito", "Poppins", "Rubik", sans-serif',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                backgroundPosition: "0% 50%"
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                backgroundPosition: { 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
            >
              Premium Marketplaces
            </motion.span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            Access millions of curated design items through our partnerships with leading home retailers and artisan marketplaces. 
            Get instant recommendations for furniture, decor, and unique handmade accessories from trusted sources.
          </p>
        </motion.div>
        
        {/* Slideshow Container */}
        <motion.div 
          className="max-w-7xl mx-auto mb-20"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="relative">
            {/* Main Slideshow Card */}
            <motion.div 
              className="relative overflow-hidden bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl"
              variants={item}
            >
              {/* Dynamic Background Gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${currentPartner.bgColor} opacity-40`}
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.8 }}
              />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
                {/* Left Side - Marketplace Image (wider) */}
                <div className="lg:col-span-1 relative overflow-hidden rounded-l-[2.5rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <img 
                        src={currentPartner.image}
                        alt={`${currentPartner.name} marketplace`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay with logo */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start p-8">
                        <motion.div 
                          className={`w-16 h-16 bg-gradient-to-br ${currentPartner.color} rounded-2xl flex items-center justify-center shadow-xl`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <span className="text-white text-2xl font-bold">{currentPartner.logo}</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right Side - Partner Information (2/3) */}
                <div className="lg:col-span-2 p-12 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="space-y-8"
                    >
                      {/* Header */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <motion.h3 
                            className="text-4xl font-bold text-slate-900"
                            layoutId={`title-${currentPartner.id}`}
                          >
                            {currentPartner.name}
                          </motion.h3>
                          <motion.div
                            className={`px-4 py-2 bg-${currentPartner.accentColor}-100 text-${currentPartner.accentColor}-700 border border-${currentPartner.accentColor}-200 rounded-full text-sm font-semibold`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            Primary Partner
                          </motion.div>
                        </div>
                        
                        <p className="text-lg text-slate-600 leading-relaxed font-light max-w-2xl">
                          {currentPartner.fullDescription}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(currentPartner.stats).map(([key, value], index) => (
                          <motion.div
                            key={key}
                            className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <div className={`w-3 h-3 bg-${currentPartner.accentColor}-500 rounded-full mx-auto mb-2`}></div>
                            <div className="font-bold text-slate-900 text-lg">{value}</div>
                            <div className="text-slate-500 text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 gap-3">
              {primaryPartners.map((_, index) => (
                <motion.button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? `bg-${currentPartner.accentColor}-500 scale-125` 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust Metrics - Updated for Amazon + Etsy */}
        <motion.div
          className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {[
            { number: "130M+", label: "Choices Simplified", icon: "📦" },
            { number: "98%", label: "User Satisfaction Rate", icon: "🎯" },
            { number: "Real-time", label: "AI Recommendations", icon: "🤖" },
            { number: "Favorites", label: "Marketplace Partners", icon: "🤝" }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              className="text-center p-6 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-lg hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-500"
              whileHover={{ y: -4, scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <div className="text-2xl mb-3">{metric.icon}</div>
              <div className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-2">
                {metric.number}
              </div>
              <div className="text-slate-600 font-medium text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Elegant CTA */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={handleStartShopping}
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span>Start Shopping with AI</span>
            <motion.div
              className="group-hover:translate-x-1 transition-transform duration-200"
            >
              →
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Vision Board Interface Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-6xl mt-24"
        >
          <motion.div
            className="relative"
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {/* Main Vision Board Interface Card */}
            <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/10 p-1 overflow-hidden">
              <div className="bg-gradient-to-br from-slate-50/50 to-white/50 rounded-[20px] p-8">
                
                {/* Header Bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                    </div>
                    <span className="text-slate-600 text-sm font-medium ml-4">Vision Board Studio</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>

                {/* Vision Board Interface Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  
                  {/* Product Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/80 rounded-2xl p-6 border border-slate-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-4 h-4 text-red-500">❤️</div>
                        <h3 className="font-semibold text-slate-900 text-sm">Liked Products</h3>
                      </div>
                      
                      {/* Search */}
                      <div className="relative mb-4">
                        <input 
                          type="text" 
                          placeholder="Search products..." 
                          className="w-full pl-8 pr-3 py-2 border border-slate-300/60 rounded-xl bg-white/60 text-xs"
                          disabled
                        />
                        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">🔍</div>
                      </div>

                      {/* Project Filter */}
                      <div className="relative mb-4">
                        <select className="w-full pl-8 pr-3 py-2 border border-slate-300/60 rounded-xl bg-white/60 text-xs appearance-none" disabled>
                          <option>Living Room</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">📁</div>
                      </div>

                      {/* Marketplace Toggle - Updated for Amazon/Etsy */}
                      <div className="flex items-center gap-1 mb-4 p-1 bg-slate-100/60 rounded-lg">
                        <button className="flex-1 py-1 px-2 text-xs font-medium bg-white rounded-md shadow-sm text-slate-900">
                          Amazon
                        </button>
                        <button className="flex-1 py-1 px-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors">
                          Etsy
                        </button>
                      </div>
                      
                      {/* Product Grid - First 4 products */}
                      <div className="grid grid-cols-2 gap-3">
                        {interiorProducts.slice(0, 4).map((product, i) => (
                          <motion.div 
                            key={product.name}
                            className="group bg-white/60 rounded-xl p-3 border border-slate-200/60 cursor-grab relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          >
                            {/* Source indicator - Updated colors for Amazon/Etsy */}
                            <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                              product.source === 'amazon' ? 'bg-orange-500' : 'bg-teal-500'
                            }`}></div>
                            
                            <div className="aspect-square bg-slate-100 rounded-lg mb-2 overflow-hidden">
                              <img 
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h4 className="font-medium text-slate-900 text-xs line-clamp-2 mb-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 text-xs">${product.price}</span>
                              <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                Drag
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Vision Board Canvas */}
                  <div className="lg:col-span-3">
                    <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-lg overflow-hidden h-full">
                      <div className="p-6 border-b border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-slate-900 flex items-center gap-3">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Your Vision Board
                          </h2>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs">Amazon</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span className="text-xs">Etsy</span>
                            </div>
                            <span className="text-xs">📊 6 items</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Canvas Area with matching height to sidebar */}
                      <div className="relative bg-gradient-to-br from-slate-50/50 to-white/50 overflow-hidden" style={{ height: '500px' }}>
                        {/* Grid Pattern - More prominent */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{ 
                            backgroundImage: `
                              linear-gradient(rgba(148, 163, 184, 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(148, 163, 184, 0.3) 1px, transparent 1px)
                            `,
                            backgroundSize: '40px 40px'
                          }}
                        />
                        
                        {/* Grid squares for snapping */}
                        <div className="absolute inset-4 grid grid-cols-12 grid-rows-10 gap-1">
                          {Array.from({ length: 120 }).map((_, i) => (
                            <div
                              key={i}
                              className="border border-slate-200/30 rounded-lg bg-white/10 hover:bg-slate-200/20 transition-colors duration-200"
                            />
                          ))}
                        </div>
                        
                        {/* Vision Board Items - Updated with Amazon/Etsy products */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            
                            {/* Row 1 - Top row */}
                            {/* Modern Sectional Sofa - Top Left (Amazon) */}
                            <motion.div 
                              className="absolute w-40 h-32 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-orange-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '-140px', top: '-127px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              animate={{ 
                                boxShadow: [
                                  "0 4px 6px -1px rgba(249, 115, 22, 0.2)",
                                  "0 10px 15px -3px rgba(249, 115, 22, 0.4)",
                                  "0 4px 6px -1px rgba(249, 115, 22, 0.2)"
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <img 
                                src={interiorProducts[0].image}
                                alt={interiorProducts[0].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[0].price}
                              </div>
                            </motion.div>
                            
                            {/* Handwoven Wall Art - Top Center (Etsy) */}
                            <motion.div 
                              className="absolute w-32 h-28 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-teal-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '-36px', top: '-127px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                            >
                              <img 
                                src={interiorProducts[1].image}
                                alt={interiorProducts[1].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-teal-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[1].price}
                              </div>
                            </motion.div>
                            
                            {/* Floor Lamp - Top Right (Amazon) */}
                            <motion.div 
                              className="absolute w-28 h-36 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-orange-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '60px', top: '-137px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.5 }}
                            >
                              <img 
                                src={interiorProducts[2].image}
                                alt={interiorProducts[2].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[2].price}
                              </div>
                            </motion.div>

                            {/* Row 2 - Bottom row */}
                            {/* Vintage Ceramic Vase - Bottom Left (Etsy) */}
                            <motion.div 
                              className="absolute w-44 h-32 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-teal-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '-150px', top: '-23px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.9, duration: 0.5 }}
                            >
                              <img 
                                src={interiorProducts[3].image}
                                alt={interiorProducts[3].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-teal-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[3].price}
                              </div>
                            </motion.div>

                            {/* Console Table - Bottom Center (Amazon) */}
                            <motion.div 
                              className="absolute w-36 h-28 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-orange-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '-38px', top: '-23px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 1.2, duration: 0.5 }}
                            >
                              <img 
                                src={interiorProducts[4].image}
                                alt={interiorProducts[4].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-orange-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[4].price}
                              </div>
                            </motion.div>

                            {/* Macrame Plant Hanger - Bottom Right (Etsy) */}
                            <motion.div 
                              className="absolute w-28 h-32 bg-white/95 rounded-xl shadow-lg overflow-hidden border-2 border-teal-500 cursor-grab active:cursor-grabbing"
                              style={{ left: '60px', top: '-23px' }}
                              drag
                              dragMomentum={false}
                              dragElastic={0.1}
                              whileDrag={{ scale: 1.05, zIndex: 50 }}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 1.5, duration: 0.5 }}
                            >
                              <img 
                                src={interiorProducts[5].image}
                                alt={interiorProducts[5].name}
                                className="w-full h-full object-cover pointer-events-none"
                              />
                              <div className="absolute -top-8 left-0 bg-teal-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                ${interiorProducts[5].price}
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Interactive helper text */}
                        <div className="absolute bottom-4 left-4 text-slate-500 text-xs bg-white/80 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-200/60">
                          <div className="flex items-center gap-2">
                            <span>🖱️ Drag items to rearrange</span>
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <span>Grid snapping enabled</span>
                          </div>
                        </div>

                        {/* Grid info in corner */}
                        <div className="absolute top-4 right-4 text-slate-400 text-xs bg-white/60 px-2 py-1 rounded-md">
                          12×10 Grid
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar - Updated for Amazon/Etsy */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="bg-slate-100/60 px-4 py-2 rounded-full">
                      <span className="text-sm">Total Budget: </span>
                      <span className="font-semibold text-slate-900">$2,190</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-xs text-slate-500">Amazon</span>
                      <div className="w-2 h-2 bg-teal-500 rounded-full ml-2"></div>
                      <span className="text-xs text-slate-500">Etsy</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200 rounded-lg hover:bg-slate-100/60">
                      Clear Board
                    </button>
                    <button className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                      Share Vision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TrustedBrands;