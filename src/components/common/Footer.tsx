import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail, ArrowRight, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { APP_NAME } from '../../utils/constants';

const Footer: React.FC = () => {
  const [logoColorStates] = useState([0, 1, 2, 3]); // Static color states for each dot
  const containerRef = useRef<HTMLDivElement>(null);

  // Your original 4 color gradients
  const colorGradients = [
    { id: 'footer-gradient1', colors: ['#8b5cf6', '#a855f7'] }, // Violet
    { id: 'footer-gradient2', colors: ['#3b82f6', '#2563eb'] }, // Blue
    { id: 'footer-gradient3', colors: ['#7c3aed', '#6d28d9'] }, // Purple
    { id: 'footer-gradient4', colors: ['#475569', '#334155'] }, // Slate
  ];

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

  const socialIcons = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Mail, href: "#", label: "Email" }
  ];

  const legalLinks = [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms of Service" },
    { href: "#", label: "Cookie Policy" }
  ];

  return (
    <footer 
      ref={containerRef}
      className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white overflow-hidden"
    >
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-hero-dots" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-hero-dots)" className="text-white" />
        </svg>
      </div>

      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Brand Column - With Animated Logo */}
            <motion.div variants={itemVariants}>
              {/* Logo with 4 dots */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div 
                  className="relative w-8 h-8"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" className="w-full h-full">
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
                      fill={`url(#${colorGradients[logoColorStates[0]].id})`}
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
                      fill={`url(#${colorGradients[logoColorStates[1]].id})`}
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
                      fill={`url(#${colorGradients[logoColorStates[2]].id})`}
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
                      fill={`url(#${colorGradients[logoColorStates[3]].id})`}
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
                    
                    {/* All gradient definitions */}
                    <defs>
                      {colorGradients.map((gradient) => (
                        <linearGradient 
                          key={gradient.id}
                          id={gradient.id} 
                          x1="0%" 
                          y1="0%" 
                          x2="100%" 
                          y2="100%"
                        >
                          <stop offset="0%" stopColor={gradient.colors[0]} />
                          <stop offset="100%" stopColor={gradient.colors[1]} />
                        </linearGradient>
                      ))}
                    </defs>
                  </svg>
                </motion.div>
                
                <motion.h2 
                  className="font-semibold text-3xl text-white"
                  whileHover={{
                    background: "linear-gradient(to right, #a855f7, #3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    transition: { duration: 0.3 }
                  }}
                >
                  {APP_NAME}
                </motion.h2>
              </div>
              
              <motion.div
                className="w-16 h-1 bg-gradient-to-r from-violet-400 to-blue-400 mb-6 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
              />
              
              <p className="text-slate-300 leading-relaxed mb-8 text-lg font-light max-w-xl">
                Turn any room photo into your perfect space. Get smart product recommendations and create beautiful vision boards in seconds.
              </p>
              
              <div className="flex space-x-3">
                {socialIcons.map(({ icon: Icon, href, label }, index) => (
                  <motion.a 
                    key={label}
                    href={href} 
                    className="p-3 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 group"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ transitionDelay: `${0.5 + index * 0.1}s` }}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Resources & Contact Combined */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Design Stories Blog Link */}
              <div>
                <h3 className="font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  Resources
                </h3>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <Link 
                    to="/blog" 
                    className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group font-medium text-lg"
                  >
                    <motion.span
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    >
                      Design Blogs
                    </motion.span>
                    <ArrowRight 
                      size={16} 
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-2 group-hover:translate-x-0" 
                    />
                  </Link>
                  <p className="text-slate-400 text-sm mt-2 font-light">
                    Get inspired by real transformations and discover products that make the difference.
                  </p>
                </motion.div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-white mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail size={18} className="text-blue-400 flex-shrink-0" />
                    <a 
                      href="mailto:hello@mydesignindex.com" 
                      className="text-slate-300 hover:text-white transition-colors duration-300 font-medium"
                    >
                      hello@mydesignindex.com
                    </a>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Phone size={18} className="text-slate-400 flex-shrink-0" />
                    <span className="text-slate-300 font-medium">
                      Support available 24/7
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            whileHover={{ y: -2 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-2xl text-white mb-2">Stay Inspired</h3>
                <p className="text-slate-300 font-light">Get design tips, product recommendations, and room makeover ideas delivered weekly.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-300 lg:w-64"
                />
                <motion.button
                  className="px-8 py-3 bg-slate-900 text-white font-medium rounded-full hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  Subscribe
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div 
            className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-slate-400 text-sm font-medium">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            {/*<div className="flex space-x-8 text-sm">
              {legalLinks.map((link, index) => (
                <motion.a 
                  key={link.label}
                  href={link.href} 
                  className="text-slate-400 hover:text-white transition-colors duration-300 font-medium"
                  whileHover={{ y: -1 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>*/}
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;