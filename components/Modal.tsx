
import React, { useEffect, useState, useRef } from 'react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  index: number;
  totalSheets: number;
}

export const Sheet: React.FC<SheetProps> = ({ isOpen, onClose, title, children, index, totalSheets }) => {
  const [isRendered, setIsRendered] = useState(false);
  const isTop = index === totalSheets - 1;
  const offset = totalSheets - 1 - index; // 0 for top, 1 for behind, etc.
  
  // Gesture State
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef<number>(0);
  
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setDragY(0);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 400); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isRendered) return null;

  // Visual stacking calculations
  const scale = 1 - offset * 0.05; 
  const translateY = offset * 10; 
  // Determine opacity: if open, stack effect. if closing, fade out.
  const opacity = isOpen ? (isTop ? 1 : 0.6) : 0;
  
  // Handlers for Swipe Down Gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    
    // Only allow drag if we are touching the header area or if we are at the top of scroll
    const target = e.target as HTMLElement;
    const isHeader = target.closest('.sheet-header');
    const scrollContainer = target.closest('.sheet-content');
    
    // If touching content and scrolled down, don't drag sheet
    if (scrollContainer && scrollContainer.scrollTop > 0 && !isHeader) return;

    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const y = e.touches[0].clientY;
    const delta = y - startY.current;
    
    // Only allow dragging down
    if (delta > 0) {
      setDragY(delta);
      // Prevent default to stop scrolling the body/background
      if (e.cancelable) e.preventDefault(); 
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Threshold to close (pull down distance)
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0); // Snap back
    }
  };

  // Transforms
  const mobileTransform = isOpen 
    ? `translateY(${dragY}px) scale(${scale})` 
    : `translateY(100%) scale(${scale})`;
    
  const desktopTransform = isOpen
    ? `translate(-50%, -50%) scale(${scale})`
    : `translate(-50%, -40%) scale(${scale * 0.9})`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      {index === 0 && (
        <div 
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-auto ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => { onClose(); }}
        />
      )}

      {/* Sheet Container */}
      <div 
        className={`
          absolute pointer-events-auto shadow-2xl transition-transform duration-500 ease-[var(--ease-spring)]
          bg-[var(--surface)] border border-[var(--outline-variant)]/20 overflow-hidden
          
          /* Mobile Styles */
          w-full max-h-[92vh] bottom-0 left-0 right-0 rounded-t-[32px]
          lg:w-[500px] lg:h-auto lg:max-h-[85vh] lg:rounded-[32px] lg:bottom-auto lg:top-1/2 lg:left-1/2
        `}
        style={{
          zIndex: 60 + index,
          transform: window.innerWidth >= 1024 ? desktopTransform : mobileTransform,
          opacity: opacity,
          marginTop: window.innerWidth >= 1024 ? 0 : `${translateY}px`,
          // Disable transition during drag for immediate follow
          transition: isDragging ? 'none' : 'transform 0.5s var(--ease-spring), opacity 0.5s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle (Mobile Visual + Touch Area) */}
        <div className="sheet-header w-full h-10 flex items-center justify-center lg:hidden pt-4 pb-2 shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-[var(--outline-variant)]/40" />
        </div>

        {/* Header */}
        <div className="sheet-header px-6 pb-4 pt-2 flex items-center justify-between border-b border-[var(--outline-variant)]/10 shrink-0 select-none">
          {title && <h2 className="text-xl font-display font-bold text-on-surface">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-[var(--surface-container-high)] text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="sheet-content p-6 overflow-y-auto max-h-[calc(92vh-90px)] lg:max-h-[calc(80vh-80px)] overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
