
import React from 'react';
import { Page } from '../types';
import { motion } from 'framer-motion';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const mainItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Home', icon: 'home' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'focus', label: 'Focus', icon: 'timer' },
  { id: 'history', label: 'History', icon: 'history' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[var(--surface-container-low)]/90 border-t border-[var(--outline-variant)]/10 flex items-center justify-between px-2 pb-3 backdrop-blur-xl z-30 lg:hidden safe-area-bottom">
      {mainItems.map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex-1 flex flex-col items-center justify-center h-full gap-1 group relative outline-none min-w-0"
          >
            <div className={`relative h-9 px-4 flex items-center justify-center transition-all duration-300 ${isActive ? 'w-auto' : ''}`}>
                 {/* Active Background Animation */}
                 {isActive && (
                    <motion.div
                        layoutId="bottomNavActive"
                        className="absolute inset-0 bg-[var(--primary-container)] rounded-[16px]"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        initial={false}
                    />
                 )}
                 
                 <span 
                    className={`material-symbols-outlined text-[24px] z-10 transition-colors duration-200 ${isActive ? 'text-[var(--on-primary-container)]' : 'text-on-surface-variant group-hover:text-on-surface'}`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                    {item.icon}
                </span>
            </div>
            
            <span className={`text-[11px] font-medium transition-all duration-300 truncate w-full text-center ${
                isActive ? 'text-[var(--on-surface)] translate-y-0 opacity-100 font-bold' : 'text-on-surface-variant translate-y-1 opacity-0 h-0 overflow-hidden'
            }`}>
                {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
