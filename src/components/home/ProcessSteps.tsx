import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, ShoppingCart } from 'lucide-react';
import { PROCESS_STEPS } from '../../utils/constants';

const ProcessSteps: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const navigate = useNavigate();

  // Subtle scroll transforms
  const y = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const iconComponents: Record<string, React.ReactNode> = {
    Upload: <Upload size={24} className="text-white" />,
    Search: <Search size={24} className="text-white" />, // ScanLine instead of Scan
    Cart: <ShoppingCart size={24} className="text-white" />
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  const handleExperienceProcess = () => {
    navigate('/signup');
  };

  return (
    <section 
      ref={containerRef}
      className="relative py-24 lg:py-32 bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden"
    >
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Single elegant gradient orb */}
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-100/40 to-blue-100/40 rounded-full blur-3xl"
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
              <pattern id="process-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#process-dots)" className="text-slate-600" />
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
            <span className="font-thin text-slate-900">Our</span>
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
              Design Process
            </motion.span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
            Experience the future of interior design through our AI-powered analysis that transforms 
            spaces with unprecedented precision and creativity.
          </p>
        </motion.div>
        
        {/* Clean Steps Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto relative"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {PROCESS_STEPS.map((step, index) => (
            <motion.div 
              key={step.id}
              className="relative group"
              variants={item}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Subtle Connection Lines 
              {index < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-6 w-12 h-px z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-slate-300 to-slate-200 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                  />
                </div>
              )}*/}

              {/* Clean Card Design */}
              <motion.div 
                className="relative flex flex-col items-center text-center p-8 lg:p-10 h-full"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Refined Glass Card Background */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-lg group-hover:shadow-xl group-hover:shadow-slate-900/5 transition-all duration-500" />
                
                {/* Subtle Gradient Overlay on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-blue-50/30 to-slate-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />

                <div className="relative z-10">
                  {/* Elegant Icon Container */}
                  <motion.div 
                    className="mb-8 relative"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="relative">
                      {/* Refined Icon Background */}
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        {iconComponents[step.icon]}
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Minimal Step Number Badge */}
                  <motion.div
                    className="absolute top-4 right-4 w-6 h-6 bg-slate-600/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-xs font-medium shadow-sm"
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Clean Content */}
                  <h3 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed text-lg font-light">
                    {step.description}
                  </p>

                  {/* Subtle Interactive Indicator */}
                  <motion.div
                    className="mt-6 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full">
                      <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Interactive</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Elegant CTA Section */}
        <motion.div
          className="text-center mt-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={handleExperienceProcess}
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <span>Experience Our Process</span>
            <motion.div
              className="group-hover:translate-x-1 transition-transform duration-200"
            >
              →
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Curation Interface Preview - Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-screen-2xl mt-20"
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* Main Curation Interface Card */}
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
                    <span className="text-slate-600 text-sm font-medium ml-4">Curated Selections</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>

                {/* Curation Interface Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Filters Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/80 rounded-2xl p-6 border border-slate-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
                      </div>
                      
                      {/* Detected Elements Filter */}
                      <div className="mb-6">
                        <h4 className="text-xs font-medium text-slate-700 mb-3">Detected Elements</h4>
                        <div className="space-y-2">
                          {['Sofa', 'Coffee Table', 'Lighting', 'Rug'].map((item, i) => (
                            <div key={item} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                              <div className={`w-3 h-3 rounded-sm ${i < 2 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                              <span className="text-xs text-slate-600">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Price Range Filter */}
                      <div className="mb-6">
                        <h4 className="text-xs font-medium text-slate-700 mb-3">Price Range</h4>
                        <div className="space-y-2">
                          {['$0 - $100', '$100 - $500', '$500 - $1000'].map((range, i) => (
                            <div key={range} className="flex items-center gap-2 p-2 rounded-lg">
                              <div className={`w-3 h-3 rounded-sm ${i === 1 ? 'bg-violet-500' : 'bg-slate-300'}`}></div>
                              <span className="text-xs text-slate-600">{range}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <div className="w-full h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-slate-600">Share Collection</span>
                        </div>
                        <div className="w-full h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-slate-600">Export PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Grid */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-slate-900 text-sm">Curated Products</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🔍</span>
                        </div>
                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs">⚡</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Cards Grid - 3x2 */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Product 1 - Modern Sofa */}
                      <motion.div 
                        className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60 shadow-sm"
                        animate={{ 
                          boxShadow: [
                            "0 4px 6px -1px rgba(139, 92, 246, 0.1)",
                            "0 10px 15px -3px rgba(139, 92, 246, 0.2)",
                            "0 4px 6px -1px rgba(139, 92, 246, 0.1)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-sofa.jpg" 
                            alt="Modern Sofa"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 items-center justify-center">
                            <div className="w-10 h-6 bg-indigo-400 rounded-lg"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs">♡</span>
                          </div>
                          {/* AI Enhanced Badge */}
                          <div className="absolute bottom-2 left-2 bg-violet-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            AI Enhanced
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Modern L-Shape Sofa</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            <span className="text-xs text-slate-500 ml-1">(128)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">$899</span>
                            <div className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Product 2 - Coffee Table */}
                      <div className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-table.jpg" 
                            alt="Coffee Table"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 items-center justify-center">
                            <div className="w-8 h-4 bg-amber-400 rounded-md"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs text-red-500">♥</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Glass Coffee Table</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                            <span className="text-xs text-slate-500 ml-1">(89)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">$299</span>
                            <div className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product 3 - Floor Lamp */}
                      <div className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-lamp.jpg" 
                            alt="Floor Lamp"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-yellow-100 to-amber-100 items-center justify-center">
                            <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs">♡</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Modern Floor Lamp</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                            <span className="text-xs text-slate-500 ml-1">(256)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">$189</span>
                            <div className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Product 4 - Area Rug */}
                      <div className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-rug.jpg" 
                            alt="Area Rug"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-gray-100 to-slate-100 items-center justify-center">
                            <div className="w-10 h-6 bg-slate-400 rounded-lg"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs">♡</span>
                          </div>
                          {/* Sale Badge */}
                          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Sale
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Geometric Area Rug</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                            <span className="text-xs text-slate-500 ml-1">(64)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-slate-900">$149</span>
                              <span className="text-xs text-slate-500 line-through ml-2">$199</span>
                            </div>
                            <div className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product 5 - Wall Art */}
                      <div className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-art.jpg" 
                            alt="Wall Art"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 items-center justify-center">
                            <div className="w-8 h-10 bg-purple-400 rounded border-2 border-purple-500"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs">♡</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Abstract Wall Art</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                            <span className="text-xs text-slate-500 ml-1">(43)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">$79</span>
                            <div className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product 6 - Throw Pillows */}
                      <div className="bg-white/80 rounded-xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src="/images/product-pillows.jpg" 
                            alt="Throw Pillows"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 items-center justify-center">
                            <div className="w-8 h-6 bg-rose-400 rounded-lg"></div>
                          </div>
                          {/* Heart Icon */}
                          <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xs text-red-500">♥</span>
                          </div>
                          {/* New Badge */}
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            New
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">Velvet Throw Pillows</h4>
                          <div className="flex items-center mb-2">
                            <div className="flex text-yellow-400 text-xs">★★★★★</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">$45</span>
                            <div className="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">
                              View
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats Bar */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex items-center gap-6 text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200/60 rounded-full flex items-center justify-center">
                        <span className="text-xs">🛍️</span>
                      </div>
                      <span className="text-sm font-medium">36 products found</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200/60 rounded-full flex items-center justify-center">
                        <span className="text-xs">💝</span>
                      </div>
                      <span className="text-sm font-medium">4 wishlisted</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200 rounded-lg hover:bg-slate-100/60">
                      Share Collection
                    </button>
                    <button className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                      Export PDF
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

export default ProcessSteps;