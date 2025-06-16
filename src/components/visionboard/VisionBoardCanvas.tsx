import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { VisionBoardItem } from '../../types/visionboard';
import VisionBoardItemComponent from './VisionBoardItem';
import EmptyStates from './EmptyStates';

interface VisionBoardCanvasProps {
  boardRef: React.RefObject<HTMLDivElement>;
  boardItems: VisionBoardItem[];
  selectedItem: string | null; // Changed from number to string
  isDragOver: boolean;
  hasLikedProducts: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onItemSelect: (boardId: string | null) => void; // Changed from number to string
  onItemMove: (boardId: string, newX: number, newY: number) => void; // Changed from number to string
  onItemRemove: (boardId: string) => void; // Changed from number to string
  onItemResize: (boardId: string, newWidth: number, newHeight: number) => void; // Changed from number to string
}

const VisionBoardCanvas: React.FC<VisionBoardCanvasProps> = ({
  boardRef,
  boardItems,
  selectedItem,
  isDragOver,
  hasLikedProducts,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onItemSelect,
  onItemMove,
  onItemRemove,
  onItemResize
}) => {
  return (
    <motion.div 
      className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/10 transition-all duration-500 overflow-hidden"
      layout
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-2xl text-slate-900 flex items-center gap-3">
            <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
            Your Vision Board
          </h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{boardItems.length} items</span>
          </div>
        </div>
      </div>
      
      <div
        ref={boardRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`relative bg-gradient-to-br from-slate-50/50 to-white/50 min-h-[600px] overflow-hidden transition-all duration-300 ${
          isDragOver ? 'bg-violet-50/50 border-2 border-dashed border-violet-400' : ''
        }`}
        style={{ 
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Drop zone indicator */}
        {isDragOver && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-violet-500/90 text-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Plus size={20} />
                <span className="font-medium">Drop to add to board</span>
              </div>
            </div>
          </motion.div>
        )}

        {boardItems.length === 0 && !isDragOver && (
          <EmptyStates 
            hasLikedProducts={hasLikedProducts}
            type="board"
          />
        )}

        <AnimatePresence>
          {boardItems.map((item) => (
            <VisionBoardItemComponent
              key={item.boardId}
              item={item}
              isSelected={selectedItem === item.boardId}
              onSelect={() => onItemSelect(item.boardId === selectedItem ? null : item.boardId)}
              onMove={onItemMove}
              onRemove={() => onItemRemove(item.boardId)}
              onResize={onItemResize}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VisionBoardCanvas;