import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface CurationHeroProps {
  projectName: string;
}

const CurationHero: React.FC<CurationHeroProps> = ({ projectName }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-16 lg:py-20 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hero Background Pattern */}
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
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Back Button */}
          <motion.div 
            variants={itemVariants}
            className="flex mb-8"
          >
            <a 
              href="/studio"
              className="inline-flex items-center text-slate-300 hover:text-white transition-all duration-300 font-medium group bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full hover:bg-white/20"
            >
              <svg 
                className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back to Studio</span>
            </a>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="w-16 h-1 bg-gradient-to-r from-violet-400 to-blue-400 mb-6 rounded-full"
          />
          
          <motion.h1 
            variants={itemVariants}
            className="font-light text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
          >
            {projectName ? (
              <>
                <span className="font-semibold">{projectName}</span>
                <span className="block font-light">Product Selections</span>
              </>
            ) : (
              <>
                Curated
                <span className="block font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Selections
                </span>
              </>
            )}
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-slate-300 leading-relaxed max-w-3xl font-light"
          >
            Discover a curated selection of premium furniture and décor from Amazon and Etsy, 
            tailored to your space and style preference.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CurationHero;