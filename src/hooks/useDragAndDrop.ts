import { useState, useRef, useCallback } from 'react';
import { DragAndDropState, BoardBounds } from '../types/visionboard';
import { LikedProduct } from '../lib/supabase';

export const useDragAndDrop = (
  addItemToBoard: (product: LikedProduct, x?: number, y?: number, boardBounds?: BoardBounds) => void,
  boardRef: React.RefObject<HTMLDivElement>
) => {
  const [dragState, setDragState] = useState<DragAndDropState>({
    draggedItem: null,
    isDragOver: false,
    dragCounter: 0
  });

  const dragCounter = useRef(0);

  // Handle drag start from product list
  const handleDragStart = (e: React.DragEvent, product: LikedProduct) => {
    console.log('Starting drag for product:', product.title);
    setDragState(prev => ({ ...prev, draggedItem: product }));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback to the dragged element
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.1)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  // Handle drop on vision board
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragState(prev => ({ ...prev, isDragOver: false, dragCounter: 0 }));
    
    if (dragState.draggedItem && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 100; // Offset by half item width
      const y = e.clientY - rect.top - 100;  // Offset by half item height
      
      console.log('Dropping product at:', x, y);
      addItemToBoard(dragState.draggedItem, x, y, {
        width: rect.width,
        height: rect.height
      });
      
      setDragState(prev => ({ ...prev, draggedItem: null }));
      
      // Show feedback at drop location
      showAddFeedback(e.clientX, e.clientY);
    }
  }, [dragState.draggedItem, addItemToBoard, boardRef]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDragState(prev => ({ ...prev, isDragOver: true, dragCounter: dragCounter.current }));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragState(prev => ({ ...prev, isDragOver: false, dragCounter: 0 }));
    }
  };

  // Show visual feedback when item is added
  const showAddFeedback = (x: number, y: number) => {
    const feedback = document.createElement('div');
    feedback.className = 'fixed pointer-events-none z-50 text-emerald-600 font-semibold text-sm bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-full px-3 py-1 shadow-lg';
    feedback.textContent = 'Added to board!';
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(feedback);
    
    // Animate and remove
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
      feedback.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 1000);
  };

  // Handle double-click to add to center
  const handleDoubleClick = (product: LikedProduct) => {
    console.log('Double-clicking product:', product.title);
    
    // Get board center coordinates
    const getBoardCenter = (): { x: number; y: number } => {
      if (!boardRef.current) return { x: 300, y: 300 };
      
      const rect = boardRef.current.getBoundingClientRect();
      return {
        x: (rect.width / 2) - 100, // Center minus half item width
        y: (rect.height / 2) - 100  // Center minus half item height
      };
    };

    const center = getBoardCenter();
    addItemToBoard(product, center.x, center.y, boardRef.current ? {
      width: boardRef.current.getBoundingClientRect().width,
      height: boardRef.current.getBoundingClientRect().height
    } : undefined);
    
    // Visual feedback
    showAddFeedback(center.x + 100, center.y + 100);
  };

  return {
    ...dragState,
    handleDragStart,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDoubleClick,
    showAddFeedback
  };
};