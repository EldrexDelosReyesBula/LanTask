
import React, { useState, useEffect } from 'react';
import { Task, Page } from '../types';
import { TaskCard } from '../components/TaskCard';
import { motion } from 'framer-motion';

interface DashboardProps {
  tasks: Task[];
  userName: string;
  onNavigate: (page: Page) => void;
  onTaskActions: any;
  onOpenFocus: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, userName, onNavigate, onTaskActions, onOpenFocus }) => {
  const pendingTasks = tasks.filter(t => !t.completed);
  const overdue = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;
  const recentTasks = pendingTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
  
  const [timeState, setTimeState] = useState({ 
      greeting: 'Good Day', 
      overlay: 'day',
      bgClass: 'bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]'
  });

  useEffect(() => {
      const updateTime = () => {
          const hour = new Date().getHours();
          if (hour >= 20 || hour < 5) {
              setTimeState({ greeting: 'Good Evening', overlay: 'night', bgClass: 'bg-gradient-to-br from-[#020617] via-[#1e1b4b] to-[#312e81]' });
          } else if (hour >= 5 && hour < 12) {
              setTimeState({ greeting: 'Good Morning', overlay: 'morning', bgClass: 'bg-gradient-to-br from-[#3b82f6] via-[#60a5fa] to-[#93c5fd]' });
          } else if (hour >= 12 && hour < 17) {
              setTimeState({ greeting: 'Good Afternoon', overlay: 'afternoon', bgClass: 'bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#b45309]' });
          } else {
              setTimeState({ greeting: 'Good Evening', overlay: 'evening', bgClass: 'bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#be185d]' });
          }
      };
      updateTime();
      const interval = setInterval(updateTime, 60000); 
      return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header - Dynamic Atmosphere */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-[32px] p-6 md:p-10 shadow-2xl text-white group transition-colors duration-1000 ${timeState.bgClass}`}
      >
        
        {/* --- ATMOSPHERIC LAYERS --- */}
        {timeState.overlay === 'night' && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-10 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-12 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-8 right-20 w-1.5 h-1.5 bg-white/80 rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-10 w-0.5 h-0.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] animate-pulse"></div>
            </div>
        )}

        {timeState.overlay === 'morning' && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-100/30 rounded-full blur-[60px] animate-float"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>
        )}

        {timeState.overlay === 'afternoon' && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[100px]"></div>
            </div>
        )}

        {timeState.overlay === 'evening' && (
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-pink-500/30 to-transparent"></div>
                <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-[80px] animate-pulse"></div>
            </div>
        )}

        {/* Content Layer */}
        <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-none drop-shadow-md">
                {timeState.greeting}, <br/> <span className="opacity-90">{userName}.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-8 text-white/90 font-medium drop-shadow-sm text-sm md:text-base">
                <span>You have</span>
                <span className="bg-white/20 px-3 py-1 rounded-lg text-white font-bold border border-white/10 backdrop-blur-md">{pendingTasks.length} tasks</span>
                <span>pending today. Keep it up.</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenFocus} 
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[var(--primary)] rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-[var(--primary)]">timer</span>
                    Start Focus
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTaskActions.openAdd()} 
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full font-bold border border-white/20 shadow-sm transition-colors"
                >
                    <span className="material-symbols-outlined">add</span>
                    Quick Add
                </motion.button>
            </div>
        </div>
      </motion.div>

      {/* Stats Grid - Staggered Entry */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
          
          {/* Total Tasks */}
          <motion.div variants={item} className="bg-[#374151] rounded-[28px] p-5 h-32 md:h-40 flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-lg">
             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <span className="material-symbols-outlined text-[20px]">task_alt</span>
             </div>
             <div>
                 <span className="text-3xl font-display font-bold text-white block tracking-tight">{tasks.length}</span>
                 <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total Tasks</span>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 scale-150 rotate-12">
                <span className="material-symbols-outlined text-[100px]">task_alt</span>
             </div>
          </motion.div>

          {/* Completed */}
          <motion.div variants={item} className="bg-[#304134] rounded-[28px] p-5 h-32 md:h-40 flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-lg">
             <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
             </div>
             <div>
                 <span className="text-3xl font-display font-bold text-white block tracking-tight">{tasks.filter(t => t.completed).length}</span>
                 <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Completed</span>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 scale-150 rotate-12">
                <span className="material-symbols-outlined text-[100px]">check_circle</span>
             </div>
          </motion.div>

          {/* Pending */}
          <motion.div variants={item} className="bg-[#4D423D] rounded-[28px] p-5 h-32 md:h-40 flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-lg">
             <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
             </div>
             <div>
                 <span className="text-3xl font-display font-bold text-white block tracking-tight">{pendingTasks.length}</span>
                 <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Pending</span>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 scale-150 rotate-12">
                <span className="material-symbols-outlined text-[100px]">schedule</span>
             </div>
          </motion.div>

          {/* Action Needed */}
          <motion.div variants={item} className="bg-[#4B3B3B] rounded-[28px] p-5 h-32 md:h-40 flex flex-col justify-between relative overflow-hidden group border border-white/5 shadow-lg">
             <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-[20px]">priority_high</span>
             </div>
             <div>
                 <span className="text-3xl font-display font-bold text-white block tracking-tight">{overdue}</span>
                 <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Action Needed</span>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500 scale-150 rotate-12">
                <span className="material-symbols-outlined text-[100px]">priority_high</span>
             </div>
          </motion.div>

      </motion.div>

      {/* Recent Tasks */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-2"
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xl font-display font-bold text-on-surface">Jump Back In</h2>
          <button onClick={() => onNavigate('tasks')} className="text-xs font-bold text-[var(--primary)] bg-[var(--surface-container-high)] px-4 py-2 rounded-full hover:bg-[var(--primary-container)] transition-colors">See All</button>
        </div>
        
        <div className="grid gap-3">
          {recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggleComplete={onTaskActions.toggleComplete} 
                onDelete={onTaskActions.delete} 
                onPin={onTaskActions.pin}
                onEdit={onTaskActions.edit}
                onLongPress={onTaskActions.longPress}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-[var(--surface-container-low)] rounded-[24px] border border-dashed border-[var(--outline-variant)]/30">
              <span className="material-symbols-outlined text-4xl text-[var(--outline-variant)] mb-2">celebration</span>
              <p className="text-sm font-medium text-on-surface-variant">All clear! Enjoy your day.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
