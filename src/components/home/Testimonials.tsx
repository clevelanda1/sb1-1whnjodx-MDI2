import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowRight, Quote, Star, Play, Pause } from 'lucide-react';
import { TESTIMONIALS } from '../../utils/constants';

const Testimonials: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Subtle scroll transforms
  const y = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, TESTIMONIALS.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  const slideVariants = {
    enter: {
      x: 300,
      opacity: 0,
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      x: -300,
      opacity: 0,
    },
  };

  return (
    <section 
      ref={containerRef}
      className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced gradient orb */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-full blur-3xl"
          style={{ y }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Enhanced geometric pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="testimonial-dots" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#testimonial-dots)" className="text-white" />
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
            className="w-16 h-1 bg-gradient-to-r from-violet-400 to-blue-400 mx-auto mb-6 rounded-full"
          />
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            <span className="font-thin text-white">What Our</span>
            <motion.span 
              className="block font-[800] bg-gradient-to-r from-white via-slate-300 via-slate-500 to-white bg-clip-text text-transparent bg-[length:200%_100%]"
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
              Users Say
            </motion.span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Discover how our the MDI platform has revolutionized the creative process 
            for thousands of designers homeowners worldwide.
          </p>
        </motion.div>
        
        {/* Main Testimonial Display */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative min-h-[400px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 }
                }}
                className="w-full"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Compact Image Section */}
                  <motion.div 
                    className="relative order-2 lg:order-1"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Refined Glass Card Background */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl" />
                    
                    <div className="relative p-6">
                      <div className="aspect-square overflow-hidden rounded-2xl shadow-2xl max-w-sm mx-auto">
                        <img 
                          src={currentTestimonial.image || `https://images.unsplash.com/photo-${
                            currentIndex === 0 ? '1507003211169-0a1dd7228f2d' : 
                            currentIndex === 1 ? '1494790108755-2616c67a06ee' :
                            currentIndex === 2 ? '1472099645785-5658abf4ff4e' :
                            '1507591064344-4c6ce1dc5a17'
                          }?auto=format&fit=crop&w=400&q=80`}
                          alt={currentTestimonial.author}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://picsum.photos/320/320?random=${currentIndex + 10}`;
                          }}
                        />
                      </div>
                      
                      {/* Minimal Info Card */}
                      <motion.div
                        className="absolute -bottom-3 -right-3 bg-white/95 backdrop-blur-sm border border-white/30 rounded-2xl p-3 shadow-xl"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, ease: "easeOut" }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className="text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <p className="text-slate-800 font-medium text-xs">5.0 Rating</p>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Elegant Quote Section */}
                  <div className="relative order-1 lg:order-2">
                    {/* Subtle Quote Icon */}
                    <motion.div
                      className="absolute -top-6 -left-6 text-4xl text-violet-400/30"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    >
                      <Quote size={40} />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      className="relative z-10"
                    >
                      <blockquote className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-6 text-white">
                        "{currentTestimonial.quote}"
                      </blockquote>
                      
                      {/* Clean Author Info */}
                      <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {currentTestimonial.author.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {currentTestimonial.author}
                          </h4>
                          <p className="text-slate-400 font-medium text-sm">{currentTestimonial.title}</p>
                          
                          {/* Minimal Badge */}
                          <motion.div
                            className="mt-1 inline-flex items-center gap-2 px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-slate-300 font-medium"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, ease: "easeOut" }}
                          >
                            <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                            Verified Client
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Clean Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-16 gap-8">
            {/* Minimal Dot Indicators */}
            <div className="flex items-center gap-3">
              {TESTIMONIALS.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`relative transition-all duration-300 ${
                    index === currentIndex ? 'w-8 h-2' : 'w-2 h-2'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className={`w-full h-full rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`} />
                  
                  {/* Progress bar for current slide */}
                  {index === currentIndex && isAutoPlaying && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-400 to-blue-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                      style={{ transformOrigin: "left" }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            
            {/* Refined Control Buttons */}
            <div className="flex items-center gap-3">
              {/* Auto-play Toggle */}
              <motion.button
                onClick={toggleAutoPlay}
                className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
              </motion.button>
              
              {/* Clean Navigation Arrows */}
              <motion.button 
                className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
                onClick={prevTestimonial}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={16} />
              </motion.button>
              
              <motion.button 
                className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
                onClick={nextTestimonial}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                aria-label="Next testimonial"
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Clean Trust Indicators */}
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-center gap-12 mt-20 text-slate-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-4">
            <div className="text-yellow-400 text-xl">★★★★★</div>
            <div>
              <p className="text-white font-semibold">4.9/5 Average Rating</p>
              <p className="text-sm text-slate-400">Trusted By Designers</p>
            </div>
          </div>
          
          <div className="hidden lg:block w-px h-12 bg-white/20"></div>
          
          <div className="text-center">
            <p className="text-white font-semibold">94% Success Rate</p>
            <p className="text-sm text-slate-400">Find What They Love</p>
          </div>
          
          <div className="hidden lg:block w-px h-12 bg-white/20"></div>
          
          <div className="text-center">
            <p className="text-white font-semibold">10 Hours Saved</p>
            <p className="text-sm text-slate-400">Per Room Designed</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Testimonials;