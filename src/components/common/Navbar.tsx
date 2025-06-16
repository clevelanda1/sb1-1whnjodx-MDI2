import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Crown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../utils/constants';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [logoColorStates] = useState([0, 1, 2, 3]); // Static color states for each dot
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  // Your original 4 color gradients
  const colorGradients = [
    { id: 'gradient1', colors: ['#8b5cf6', '#a855f7'] }, // Violet
    { id: 'gradient2', colors: ['#3b82f6', '#2563eb'] }, // Blue
    { id: 'gradient3', colors: ['#7c3aed', '#6d28d9'] }, // Purple
    { id: 'gradient4', colors: ['#475569', '#334155'] }, // Slate
  ];

  // Pages that need solid navbar background
  const solidNavbarPages = ['/studio', '/curation', '/visionboard', '/upgrade', '/account'];
  const needsSolidNavbar = solidNavbarPages.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle logo click based on authentication status
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/studio');
    } else {
      navigate('/');
    }
  };

  // Handle upgrade navigation
  const handleUpgradeClick = () => {
    setIsUserMenuOpen(false); // Close the dropdown
    navigate('/upgrade'); // Navigate to upgrade page
  };

  // Handle account settings navigation
  const handleAccountClick = () => {
    setIsUserMenuOpen(false); // Close the dropdown
    navigate('/account'); // Navigate to account page
  };

  const navigationItems = [
    // Commented out Design Studio button as requested
    // { name: 'Design Studio', path: '/studio', protected: true },
    // Only show Pricing when user is NOT authenticated
    // { name: 'Pricing', path: '/', protected: false, hideWhenAuthenticated: true },
  ];

  // Filter navigation items based on authentication status
  const filteredNavigationItems = navigationItems.filter(item => {
    // Hide if protected and user not authenticated
    if (item.protected && !isAuthenticated) {
      return false;
    }
    
    // Hide if hideWhenAuthenticated is true and user is authenticated
    if (item.hideWhenAuthenticated && isAuthenticated) {
      return false;
    }
    
    return true;
  });

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const menuVariants = {
    closed: { 
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    },
    open: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
    })
  };

  // Determine navbar styling based on page and scroll state
  const getNavbarStyle = () => {
    if (needsSolidNavbar || isScrolled) {
      return {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      };
    }
    return {
      background: 'transparent'
    };
  };

  const getTextColor = () => {
    return (needsSolidNavbar || isScrolled) ? 'text-slate-900' : 'text-white';
  };

  const getTextColorSecondary = () => {
    return (needsSolidNavbar || isScrolled) ? 'text-slate-700' : 'text-white/90';
  };

  const getHoverBg = () => {
    return (needsSolidNavbar || isScrolled) ? 'rgba(148, 163, 184, 0.1)' : 'rgba(255, 255, 255, 0.15)';
  };

  // Animation variants for letter effects
  const letterVariants = {
    initial: { 
      scale: 1,
      rotateY: 0,
      z: 0,
      filter: 'none'
    },
    hover: (i: number) => ({
      scale: [1, 1.2, 1],
      rotateY: [0, 15, -15, 0],
      z: [0, 20, 0],
      filter: [
        'none',
        'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))',
        'none'
      ],
      transition: {
        duration: 0.6,
        delay: i * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  // Split APP_NAME into individual letters for animation
  const letters = APP_NAME.split('');

  return (
    <motion.nav 
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || needsSolidNavbar ? 'py-3' : 'py-4'
      }`}
      style={getNavbarStyle()}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center relative">
        
        {/* Logo - Updated with conditional dots display */}
        <button 
          onClick={handleLogoClick} 
          className="flex items-center z-10 group gap-3 min-w-fit"
          onMouseEnter={() => setIsLogoHovered(true)}
          onMouseLeave={() => setIsLogoHovered(false)}
        >
          {/* Four-Circle Logo - Only show when scrolled or on solid navbar pages */}
          <AnimatePresence>
            {(isScrolled || needsSolidNavbar) && (
              <motion.div 
                className="relative w-8 h-8 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
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
            )}
          </AnimatePresence>
          
          {/* Enhanced APP_NAME with hide/show animation - Fixed width container */}
          <div className={`font-semibold text-2xl transition-all duration-500 ${getTextColor()} relative`} style={{ width: isLogoHovered ? '220px' : '60px', height: '32px' }}>
            {/* MDI - Fade out on hover */}
            <motion.div
              className="absolute left-0 top-0 flex perspective-1000"
              animate={{
                opacity: isLogoHovered ? 0 : 1,
                x: isLogoHovered ? -20 : 0
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut"
              }}
            >
              {letters.map((letter, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={letterVariants}
                  initial="initial"
                  animate={isLogoHovered ? "hover" : "initial"}
                  className="inline-block transform-gpu"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
            
            {/* "— My Design Index" - Fade in on hover */}
            <motion.div
              className="absolute left-0 top-0 whitespace-nowrap"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: isLogoHovered ? 1 : 0,
                x: isLogoHovered ? 0 : 20
              }}
              transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: isLogoHovered ? 0.2 : 0
              }}
            >
              <span className="text-slate-600 font-normal">
                — My Design Index
              </span>
            </motion.div>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-end flex-1 space-x-1">
          {filteredNavigationItems.map((item, index) => (
            <motion.div
              key={item.name}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link 
                to={item.path}
                className={`relative px-4 py-2.5 font-medium text-sm tracking-wide transition-all duration-300 rounded-full ${getTextColorSecondary()} hover:${getTextColor()}`}
              >
                {item.name}
                
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: hoveredItem === item.name ? getHoverBg() : 'transparent',
                    boxShadow: 'none'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: hoveredItem === item.name ? 1 : 0,
                    scale: hoveredItem === item.name ? 1 : 0.8
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            // Authenticated user menu
            <div className="relative">
              <motion.button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-300`}
                style={{
                  background: isUserMenuOpen ? getHoverBg() : 'transparent'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={(e) => {
                  if (!isUserMenuOpen) {
                    e.currentTarget.style.background = getHoverBg();
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUserMenuOpen) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <span className={`font-medium text-sm ${getTextColorSecondary()}`}>
                  {user?.user_metadata?.first_name || 'User'}
                </span>
              </motion.button>

              {/* Enhanced User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                    className="absolute right-0 top-full mt-5 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-xl py-2 z-50"
                  >
                    {/* Header section */}
                    <div className="px-4 py-3 border-b border-slate-200/50">
                      <div className="flex items-center gap-3">
                        {/* Enhanced avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                          {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                          </p>
                          <p className="text-sm text-slate-600 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Settings button */}
                    <motion.button 
                      onClick={handleAccountClick}
                      className="group w-full px-4 py-3 text-left transition-all duration-300 relative overflow-hidden"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-slate-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        <div>
                          <span className="font-medium text-slate-700 group-hover:text-slate-800 transition-colors">
                            Account
                          </span>
                          <p className="text-xs text-slate-500">Manage your account</p>
                        </div>
                      </div>
                    </motion.button>
                    
                    {/* Enhanced Upgrade button */}
                    <motion.button 
                      onClick={handleUpgradeClick}
                      className="group w-full px-4 py-3 text-left transition-all duration-300 relative overflow-hidden"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-violet-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        <div>
                          <span className="font-medium text-violet-600 group-hover:text-violet-700 transition-colors">
                            Upgrade
                          </span>
                          <p className="text-xs text-slate-500">Want to remove ads?</p>
                        </div>
                      </div>
                    </motion.button>
                    
                    {/* Divider */}
                    <div className="border-t border-slate-200/50 mt-2 pt-2">
                      {/* Enhanced Sign out button */}
                      <motion.button 
                        onClick={handleLogout}
                        className="group w-full px-4 py-3 text-left transition-all duration-300 relative overflow-hidden"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-red-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        
                        <div className="relative z-10 flex items-center gap-3">
                          <span className="text-red-600 group-hover:text-red-700 transition-colors font-medium">
                            Sign Out
                          </span>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Guest user CTAs
            <>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link 
                  to="/signin" 
                  className={`px-5 py-2.5 font-medium text-sm transition-all duration-300 rounded-full ${getTextColorSecondary()} hover:${getTextColor()}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = getHoverBg();
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Sign in
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link 
                  to="/signup" 
                  className="relative inline-flex items-center px-6 py-2.5 font-medium text-sm transition-all duration-300 rounded-full overflow-hidden text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <motion.button 
          className={`md:hidden z-10 p-2.5 rounded-full transition-all duration-300`}
          style={{
            background: (needsSolidNavbar || isScrolled) ? 'rgba(148, 163, 184, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          }}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          whileTap={{ scale: 0.9 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = (needsSolidNavbar || isScrolled) 
              ? 'rgba(148, 163, 184, 0.2)' 
              : 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = (needsSolidNavbar || isScrolled) 
              ? 'rgba(148, 163, 184, 0.1)' 
              : 'rgba(255, 255, 255, 0.1)';
          }}
        >
          <AnimatePresence mode="wait">
            {isMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className={`h-5 w-5 ${getTextColor()}`} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className={`h-5 w-5 ${getTextColor()}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden absolute top-full left-0 right-0"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="space-y-2">
                
                {/* User Info (if authenticated) */}
                {isAuthenticated && user && (
                  <motion.div
                    custom={0}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    className="flex items-center gap-3 p-4 bg-slate-100/60 rounded-2xl mb-4"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                      </p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Navigation Items */}
                {filteredNavigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    custom={index + (isAuthenticated ? 1 : 0)}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link 
                      to={item.path}
                      className="flex items-center justify-between font-medium text-slate-700 hover:text-slate-900 py-4 px-4 rounded-2xl transition-all duration-300 group bg-white/60 hover:bg-white/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-lg">{item.name}</span>
                      <motion.div
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-slate-600"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                ))}

                {/* Account Settings for authenticated users */}
                {isAuthenticated && (
                  <motion.div
                    custom={1}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link 
                      to="/account"
                      className="flex items-center justify-between font-medium text-slate-700 hover:text-slate-900 py-4 px-4 rounded-2xl transition-all duration-300 group bg-white/60 hover:bg-white/80"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Settings size={18} />
                        <span className="text-lg">Account Settings</span>
                      </div>
                      <motion.div
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-slate-600"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                )}

                {/* Upgrade option for authenticated users in mobile */}
                {isAuthenticated && (
                  <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    <Link 
                      to="/upgrade"
                      className="flex items-center justify-between font-medium text-violet-600 hover:text-violet-700 py-4 px-4 rounded-2xl transition-all duration-300 group bg-violet-50/60 hover:bg-violet-100/60 w-full"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Crown size={18} />
                        <span className="text-lg">Upgrade Plan</span>
                      </div>
                      <motion.div
                        className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:bg-violet-600"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                )}
                
                {/* Divider */}
                <motion.div
                  custom={filteredNavigationItems.length + (isAuthenticated ? 3 : 1)}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className="py-4"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                </motion.div>

                {/* Mobile Auth CTAs */}
                <motion.div
                  custom={filteredNavigationItems.length + (isAuthenticated ? 4 : 2)}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  className="space-y-3"
                >
                  {isAuthenticated ? (
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-center py-4 px-6 font-medium text-red-600 hover:text-red-700 rounded-2xl transition-all duration-300 bg-white/60 hover:bg-red-50/80"
                    >
                      Sign out
                    </button>
                  ) : (
                    <>
                      <Link 
                        to="/signin" 
                        className="block w-full text-center py-4 px-6 font-medium text-slate-700 hover:text-slate-900 rounded-2xl transition-all duration-300 bg-white/60 hover:bg-white/80"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      
                      <Link 
                        to="/signup" 
                        className="block w-full text-center py-4 px-6 font-medium rounded-2xl transition-all duration-300 text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get started
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;