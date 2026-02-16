
import React from 'react';
import { Page } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  className?: string;
  onAddTask?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'scheduled', label: 'Scheduled', icon: 'calendar_month' },
  { id: 'important', label: 'Important', icon: 'star' },
  { id: 'completed', label: 'Done', icon: 'check_circle' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'analytics', label: 'Insights', icon: 'monitoring' },
  { id: 'focus', label: 'Focus', icon: 'timer' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, className, onAddTask, isOpen, onClose }) => {
  return (
    <>
        {/* Mobile Backdrop */}
        <div 
            className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto bg-black/40 backdrop-blur-sm' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        />

        {/* Sidebar Container */}
        <div 
            className={`
                fixed top-0 bottom-0 left-0 z-50 w-[280px] 
                bg-[var(--surface-container-low)] lg:bg-[var(--surface)] border-r border-[var(--outline-variant)]/10
                flex flex-col p-4 shadow-2xl lg:shadow-none lg:static lg:translate-x-0
                transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)]
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${className}
            `}
        >
            <div className="h-16 flex items-center justify-between px-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-[var(--on-primary)] shadow-lg shadow-[var(--primary)]/30">
                        <span className="material-symbols-outlined text-[24px]">task</span>
                    </div>
                    <span className="font-display font-bold text-2xl text-[var(--on-surface)] tracking-tight">LanTask</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="lg:hidden p-2 rounded-full hover:bg-[var(--surface-container-high)] text-on-surface-variant active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Add Task Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => { onAddTask?.(); onClose(); }}
                className="group relative flex items-center justify-center gap-3 w-full py-4 mb-8 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-[20px] shadow-sm hover:shadow-lg transition-shadow font-bold overflow-hidden"
            >
                <div className="absolute inset-0 bg-[var(--on-primary-container)] opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">add</span>
                <span>New Task</span>
            </motion.button>

            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-2 relative">
                {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => { onNavigate(item.id); onClose(); }}
                        className={`relative w-full flex items-center h-12 px-5 rounded-full transition-colors group z-10 ${
                            isActive
                            ? 'text-[var(--on-secondary-container)] font-bold'
                            : 'text-on-surface-variant hover:text-on-surface font-medium hover:bg-[var(--surface-container-high)]/50'
                        }`}
                    >
                        {/* Framer Motion Floating Active Pill */}
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute inset-0 bg-[var(--surface-container-highest)] rounded-full -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}

                        <span 
                            className={`material-symbols-outlined mr-4 text-[22px] transition-all duration-300 group-hover:scale-110 ${
                                isActive ? 'font-variation-settings-fill text-[var(--primary)]' : ''
                            }`}
                            style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            {item.icon}
                        </span>
                        <span className="text-sm">{item.label}</span>
                    </button>
                );
                })}
            </nav>
            
            <div className="mt-4 px-4 py-4 bg-[var(--surface-container-high)]/30 border border-[var(--outline-variant)]/10 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                    <span className="material-symbols-outlined text-[18px]">offline_bolt</span>
                </div>
                <div>
                    <div className="text-xs font-bold text-on-surface">Offline Ready</div>
                    <div className="text-[10px] text-on-surface-variant">Data saved locally</div>
                </div>
            </div>
        </div>
    </>
  );
};
