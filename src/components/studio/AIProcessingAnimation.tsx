import React from 'react';
import { motion } from 'framer-motion';

const AIProcessingAnimation: React.FC = () => {
  return (
    <div className="relative w-full h-48 bg-gradient-to-br from-violet-100 via-blue-100 to-purple-100 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-violet-400/20 via-blue-400/20 to-purple-400/20"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
            'linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2), rgba(139, 92, 246, 0.2))',
            'linear-gradient(45deg, rgba(147, 51, 234, 0.2), rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating bubbles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 rounded-full ${
            i % 3 === 0 ? 'bg-violet-400/40' : 
            i % 3 === 1 ? 'bg-blue-400/40' : 'bg-purple-400/40'
          }`}
          style={{
            left: `${20 + (i * 10)}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3 + (i * 0.5),
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Sparkle effects */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute text-yellow-400"
          style={{
            left: `${15 + (i * 15)}%`,
            top: `${20 + (i % 2) * 40}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        >
          ✨
        </motion.div>
      ))}

      {/* Central robot with pulsating glow */}
      <motion.div className="relative z-10 text-center">
        <motion.div
          className="relative inline-block"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Pulsating glow effect */}
          <motion.div
            className="absolute inset-0 bg-violet-400/30 rounded-full blur-xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Robot emoji */}
          <motion.div
            className="relative text-6xl"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🤖
          </motion.div>
        </motion.div>

        {/* Status text with animated dots */}
        <motion.div
          className="mt-4 text-slate-700 font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span>AI Agent Working</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIProcessingAnimation;