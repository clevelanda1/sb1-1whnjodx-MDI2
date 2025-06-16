import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Eye, Heart, Share2 } from 'lucide-react';
import { FEATURED_ROOMS } from '../../utils/constants';

const FeaturedRooms: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Advanced scroll transforms
  const y = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Smooth mouse tracking
  const mouseX = useSpring(mousePosition.x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(mousePosition.y, { stiffness: 500, damping: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({
        x: (e.clientX - rect.left - rect.width / 2) / rect.width * 15,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height * 15,
      });
    }
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
    hidden: { opacity: 0, y: 60, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  const cardVariants = {
    rest: { y: 0, scale: 1, rotateY: 0 },
    hover: { 
      y: -12, 
      scale: 1.03,
      rotateY: 2,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const overlayVariants = {
    rest: { opacity: 0, y: 20 },
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const featuredRooms = FEATURED_ROOMS.filter(room => room.featured);

  return (
    <section 
      ref={containerRef}
      className="relative py-32 bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.3) 1px, transparent 0)`,
            backgroundSize: '80px 80px',
            x: mouseX,
            y: mouseY,
          }}
        />
        
        {/* Floating Gradient Orbs */}
        <motion.div
          className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/30 to-fuchsia-200/30 rounded-full blur-3xl"
          style={{ y }}
        />
        <motion.div
          className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"
          style={{ y: useTransform(y, value => -value) }}
        />
      </div>

      <motion.div 
        className="container mx-auto px-6 relative z-10"
        style={{ opacity }}
      >
        {/* Enhanced Header */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="mb-8 lg:mb-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-20 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-6 rounded-full"
            />
            
            <h2 className="font-bold text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-6 leading-tight">
              Featured
              <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                Inspirations
              </span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Explore our curated collection of AI-generated premium interior designs, each crafted with 
              exceptional attention to detail and innovative spatial intelligence.
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <a 
              href="#" 
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg text-slate-700 hover:text-violet-600 transition-all duration-300"
            >
              <span className="font-semibold">View All Inspirations</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={18} />
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Rooms Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {featuredRooms.map((room, index) => (
            <motion.div 
              key={room.id}
              className="group relative"
              variants={item}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              <motion.div 
                className="relative overflow-hidden rounded-3xl"
                variants={cardVariants}
                animate={hoveredRoom === room.id ? "hover" : "rest"}
                style={{ perspective: 1000 }}
              >
                {/* Glass Card Background */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 z-10" />
                
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-3xl">
                  <motion.img 
                    src={room.image || `https://images.unsplash.com/photo-${
                      index === 0 ? '1586023492289-c0b195f4341f' : 
                      index === 1 ? '1631679706909-7f865d96a34b' :
                      index === 2 ? '1556909114-f6e7ad7d3136' :
                      '1616486338812-3dadae4b4ace'
                    }?auto=format&fit=crop&w=800&q=80`}
                    alt={room.title} 
                    className="w-full h-80 lg:h-96 object-cover"
                    variants={imageVariants}
                    animate={hoveredRoom === room.id ? "hover" : "rest"}
                    onError={(e) => {
                      // Fallback to a reliable placeholder if the image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/800/600?random=${index + 1}`;
                    }}
                  />
                  
                  {/* Dynamic Overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"
                    variants={overlayVariants}
                    animate={hoveredRoom === room.id ? "hover" : "rest"}
                  >
                    {/* Interactive Actions */}
                    <motion.div 
                      className="absolute top-4 right-4 flex flex-col gap-2"
                      variants={overlayVariants}
                      animate={hoveredRoom === room.id ? "hover" : "rest"}
                    >
                      {[
                        { icon: Eye, label: "View" },
                        { icon: Heart, label: "Save" },
                        { icon: Share2, label: "Share" }
                      ].map(({ icon: Icon, label }, i) => (
                        <motion.button
                          key={label}
                          className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, x: 20 }}
                          animate={hoveredRoom === room.id ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Icon size={16} />
                        </motion.button>
                      ))}
                    </motion.div>
                    
                    {/* Content Overlay */}
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 p-6"
                      variants={overlayVariants}
                      animate={hoveredRoom === room.id ? "hover" : "rest"}
                    >
                      <motion.div
                        className="inline-block px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-3"
                        initial={{ scale: 0 }}
                        animate={hoveredRoom === room.id ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {room.category}
                      </motion.div>
                      
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                        {room.title}
                      </h3>
                      
                      <motion.p 
                        className="text-slate-200 leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={hoveredRoom === room.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 0.3 }}
                      >
                        {room.description}
                      </motion.p>
                      
                      {/* AI Generation Badge */}
                      <motion.div
                        className="mt-4 flex items-center gap-2 text-sm text-slate-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={hoveredRoom === room.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span>AI-Generated in 2.3s</span>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
                
                {/* Bottom Card Content */}
                <div className="relative z-20 p-6 bg-white/90 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-600 text-sm font-semibold uppercase tracking-wider mb-1">
                        {room.category}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-700 transition-colors duration-300">
                        {room.title}
                      </h3>
                    </div>
                    
                    <motion.div
                      className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <ArrowRight size={16} className="text-white" />
                    </motion.div>
                  </div>
                </div>

                {/* Floating Number Badge */}
                <motion.div
                  className="absolute top-4 left-4 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-30"
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  {index + 1}
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.button
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Create Your Dream Space</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.div>
            
            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 border-2 border-white/30 rounded-2xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 6,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedRooms;