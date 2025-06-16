import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { VisionBoardItem } from '../../types/visionboard';

interface VisionBoardItemProps {
  item: VisionBoardItem;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (boardId: string, newX: number, newY: number) => void;
  onRemove: () => void;
  onResize: (boardId: string, newWidth: number, newHeight: number) => void;
}

const VisionBoardItemComponent: React.FC<VisionBoardItemProps> = ({
  item,
  isSelected,
  onSelect,
  onMove,
  onRemove,
  onResize
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking on resize handle or remove button
    if ((e.target as HTMLElement).closest('.resize-handle') || 
        (e.target as HTMLElement).closest('.remove-button')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - item.x,
      y: e.clientY - item.y
    });
    onSelect();
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Resize handle clicked', e.clientX, e.clientY);
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.width,
      height: item.height
    });
    
    // Ensure the item is selected when starting resize
    onSelect();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.x);
      const newY = Math.max(0, e.clientY - dragStart.y);
      onMove(item.boardId, newX, newY);
    } else if (isResizing) {
      console.log('Resizing', e.clientX, e.clientY);
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(150, Math.min(400, resizeStart.width + deltaX));
      const newHeight = Math.max(150, Math.min(400, resizeStart.height + deltaY));
      console.log('New dimensions:', newWidth, newHeight);
      onResize(item.boardId, newWidth, newHeight);
    }
  }, [isDragging, isResizing, dragStart, resizeStart, item.boardId, onMove, onResize]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    e.preventDefault();
    console.log('Mouse up - isDragging:', isDragging, 'isResizing:', isResizing);
    setIsDragging(false);
    setIsResizing(false);
  }, [isDragging, isResizing]);

  useEffect(() => {
    if (isDragging || isResizing) {
      // Add pointer-events: none to prevent interference
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
      
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      
      return () => {
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      className={`absolute cursor-move select-none ${isSelected ? 'z-20' : 'z-10'}`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
      }}
      onMouseDown={handleMouseDown}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Selection Border */}
      {isSelected && (
        <>
          <motion.div 
            className="absolute -inset-2 border-2 border-violet-500 rounded-3xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Resize Handle - Made larger and more visible */}
            <motion.div 
              className="resize-handle absolute -bottom-3 -right-3 w-6 h-6 bg-violet-500 hover:bg-violet-600 rounded-full cursor-se-resize transition-colors duration-200 border-2 border-white shadow-lg flex items-center justify-center"
              onMouseDown={handleResizeMouseDown}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ pointerEvents: 'all' }} // Ensure it's clickable
            >
              {/* Small circle indicator for resize */}
              <div className="w-2 h-2 bg-white group-hover:bg-green-400 rounded-full opacity-100 transition-colors duration-200" />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="absolute -top-12 left-0 bg-violet-500 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap max-w-xs pointer-events-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="truncate">
              {item.title.slice(0, 30)}... - ${item.price}
            </div>
          </motion.div>
        </>
      )}

      {/* Product Card */}
      <div className="relative w-full h-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-slate-900/5 transition-all duration-500 overflow-hidden group">
        {/* Remove Button - Enhanced visibility */}
        {isSelected && (
          <motion.button
            className="remove-button absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-xl z-30 border-3 border-white hover:border-red-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.15, boxShadow: "0 8px 25px rgba(239, 68, 68, 0.4)" }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{ pointerEvents: 'all' }} // Ensure it's clickable
          >
            <X size={16} strokeWidth={2.5} />
          </motion.button>
        )}

        {/* Image - Full card */}
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
          
          {/* Hover overlay with product info */}
          <motion.div 
            className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end"
            initial={false}
          >
            <div className="p-4 text-white w-full">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
              <p className="text-slate-200 text-xs">${item.price}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default VisionBoardItemComponent;