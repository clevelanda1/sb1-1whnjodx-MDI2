import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../../utils/constants';
import Button from '../common/Button';

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Enhanced text options with more strategic messaging
  const textOptions = [
    'With Zero Effort',
    'And Shop The Look',
    'With Smart Assistance',
    'With Instant Results',
    'With Creative Freedom',
  ];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [2, -2]));
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-2, 2]));

  useEffect(() => {
    setIsLoaded(true);

    // Professional text cycling with improved UX
    const startTextCycle = () => {
      let currentIndex = 0;

      const cycleText = () => {
        setIsTransitioning(true);

        // Wait for exit animation to complete before changing text
        setTimeout(() => {
          currentIndex = (currentIndex + 1) % textOptions.length;
          setCurrentTextIndex(currentIndex);
          setIsTransitioning(false);
        }, 400); // Half of transition duration for smooth overlap
      };

      // Start cycling after initial display time
      const initialDelay = setTimeout(() => {
        const interval = setInterval(cycleText, 3500); // Slower, more readable pace

        // Clean up interval
        return () => clearInterval(interval);
      }, 4000); // Longer initial display time

      return () => clearTimeout(initialDelay);
    };

    const cleanup = startTextCycle();
    return cleanup;
  }, [textOptions.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden"
    >
      {/* Enhanced Background Elements - Matching Upgrade Page */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs similar to Upgrade page */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Clean geometric pattern */}
      <div className="absolute inset-0 opacity-[0.25]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dots"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#dots)"
            className="text-slate-600"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 lg:px-12 max-w-none mx-auto pt-20">
        {/* Status Badge - Refined */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-full shadow-sm hover:shadow-md transition-all duration-500 group cursor-pointer">
            <div className="w-2 h-2 bg-emerald-500 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-slate-700 text-sm font-medium">
              Introducing MDI Design Studio v1.0
            </span>
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </motion.div>

        {/* Hero Text - Enhanced Typography with Professional Transitions */}
        <div className="text-center space-y-8 mb-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="relative"
          >
            <h1 className="text-[58px] md:text-[72px] lg:text-[84px] leading-[1.05] tracking-tight">
              {/* Ultra-thin first line */}
              <span className="font-thin text-slate-900">
                Design Your Dream Space,
              </span>

              {/* Professional animated second line with enhanced transitions */}
              <div
                className="relative block overflow-hidden"
                style={{ height: '1.05em' }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTextIndex}
                    className="font-[800] bg-gradient-to-r from-slate-900 via-violet-600 via-blue-600 to-slate-900 bg-clip-text text-transparent bg-[length:200%_100%] absolute inset-0 flex items-center justify-center"
                    style={{
                      fontFamily:
                        '"Inter", "Nunito", "Poppins", "Rubik", sans-serif',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                      backgroundPosition: '0% 50%',
                    }}
                    initial={{
                      opacity: 0,
                      y: 60,
                      scale: 0.8,
                      rotateX: -15,
                      filter: 'blur(8px)',
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      rotateX: 0,
                      filter: 'blur(0px)',
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    exit={{
                      opacity: 0,
                      y: -60,
                      scale: 0.8,
                      rotateX: 15,
                      filter: 'blur(8px)',
                    }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94], // Professional easing curve
                      backgroundPosition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    {textOptions[currentTextIndex]}
                  </motion.span>
                </AnimatePresence>

                {/* Subtle transition indicator */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{
                    opacity: isTransitioning ? [0, 1, 0] : 0,
                    scaleX: isTransitioning ? [0, 1, 0] : 0,
                  }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              </div>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed"
          >
            {APP_TAGLINE}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="text-lg text-slate-500 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your interior design vision into reality with My Design
            Index — Translate any room design inspiration into an actionable,
            shoppable experience in moments, not months!
          </motion.p>
        </div>

        {/* CTA Section - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <motion.button
            onClick={handleGetStarted}
            className="bg-slate-900 text-white hover:bg-slate-800 px-10 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            Start creating for free
            <motion.span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200">
              →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Studio Interface Preview - Interactive Demo - WIDER */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            y: isLoaded ? 0 : 40,
            scale: isLoaded ? 1 : 0.95,
          }}
          transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
          className="relative mx-auto max-w-6xl"
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1200,
            }}
            className="relative"
          >
            {/* Main Studio Interface Card */}
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
                    <span className="text-slate-600 text-sm font-medium ml-4">
                      Design Studio
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium">Live</span>
                  </div>
                </div>

                {/* Studio Interface Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Upload Section */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/80 rounded-2xl p-6 border border-slate-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <h3 className="font-semibold text-slate-900 text-sm">
                          New Project
                        </h3>
                      </div>

                      {/* Upload Area with Local Image */}
                      <div className="border-2 border-dashed border-slate-300/60 rounded-xl p-4 text-center mb-4 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {/* Local uploaded interior image */}
                        <div className="w-full h-32 rounded-lg mb-3 relative overflow-hidden">
                          <img
                            src="/images/upload-room.jpg"
                            alt="Uploaded Living Room"
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              // Fallback if image doesn't exist
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display =
                                'flex';
                            }}
                          />
                          {/* Fallback placeholder */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-amber-100 via-orange-50 to-red-50 rounded-lg items-center justify-center">
                            <span className="text-xs text-amber-700 font-medium bg-white/80 px-2 py-1 rounded">
                              Upload an image
                            </span>
                          </div>
                          {/* Filename overlay */}
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            Living Room.jpg
                          </div>
                        </div>
                      </div>

                      {/* Detected Elements */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-slate-700">
                          Detected Elements
                        </h4>
                        {['Sofa', 'Coffee Table', 'Lighting'].map((item, i) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                          >
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                            <span className="text-xs text-slate-600">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Projects Gallery */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        Your Projects
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🔍</span>
                        </div>
                        <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs">⚡</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Project 1 - Modern Living Room with Local Image */}
                      <motion.div
                        className="bg-white/80 rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm"
                        animate={{
                          boxShadow: [
                            '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
                            '0 10px 15px -3px rgba(139, 92, 246, 0.2)',
                            '0 4px 6px -1px rgba(139, 92, 246, 0.1)',
                          ],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src="/images/modern-living-room.jpg"
                            alt="Modern Living Room"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image doesn't exist
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display =
                                'block';
                            }}
                          />
                          {/* Fallback gradient */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
                          {/* Live indicator */}
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            Live
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">
                            Modern Living Room
                          </h4>
                          <p className="text-xs text-slate-600 mb-2">
                            Generated in 2.1 seconds
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>⚡ AI Enhanced</span>
                              <span>🎨 4K Quality</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Project 2 - Cozy Bedroom with Local Image */}
                      <div className="bg-white/80 rounded-2xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src="/images/cozy-bedroom.jpg"
                            alt="Cozy Bedroom"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display =
                                'block';
                            }}
                          />
                          {/* Fallback gradient */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50"></div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">
                            Cozy Bedroom
                          </h4>
                          <p className="text-xs text-slate-600 mb-2">
                            March 15, 2024
                          </p>
                          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            Complete
                          </div>
                        </div>
                      </div>

                      {/* Project 3 - Kitchen Space with Local Image */}
                      <div className="bg-white/80 rounded-2xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src="/images/kitchen-space.jpg"
                            alt="Kitchen Space"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display =
                                'block';
                            }}
                          />
                          {/* Fallback gradient */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">
                            Kitchen Space
                          </h4>
                          <p className="text-xs text-slate-600 mb-2">
                            March 12, 2024
                          </p>
                          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            Complete
                          </div>
                        </div>
                      </div>

                      {/* Project 4 - Bathroom Design with Local Image */}
                      <div className="bg-white/80 rounded-2xl overflow-hidden border border-slate-200/60">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src="/images/bathroom-design.jpg"
                            alt="Bathroom Design"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display =
                                'block';
                            }}
                          />
                          {/* Fallback gradient */}
                          <div className="hidden w-full h-full bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"></div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1">
                            Bathroom Design
                          </h4>
                          <p className="text-xs text-slate-600 mb-2">
                            March 10, 2024
                          </p>
                          <div className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                            Complete
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/60">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-8 h-8 bg-slate-200/60 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <span className="text-sm font-medium">Created by AI</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200 rounded-lg hover:bg-slate-100/60">
                      Customize
                    </button>
                    <button className="px-6 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors duration-200">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Social Proof - Clean and Minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
          className="mt-20 text-center"
        >
          <p className="text-slate-500 text-sm font-medium mb-6">
            Trusted by design professionals worldwide
          </p>
          <div className="flex items-center justify-center gap-12 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-600">10K+</span>
              <span className="text-sm">Inspirations Uploaded</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-600">1M+</span>
              <span className="text-sm">Products Matched</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="text-yellow-500">★★★★★</div>
              <span className="text-sm text-slate-600">4.9/5</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
