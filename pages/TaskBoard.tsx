
import React, { useState } from 'react';
import { Task, Category } from '../types';
import { TaskCard } from '../components/TaskCard';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskBoardProps {
  tasks: Task[];
  filterType: 'all' | 'today' | 'scheduled' | 'important' | 'completed';
  onTaskActions: any;
  onReorder?: (sourceId: string, targetId: string) => void;
  onOpenSort: () => void;
  sortOption: string;
  onStartSmartTimer: (minutes: number) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
    tasks, 
    filterType, 
    onTaskActions, 
    onReorder,
    onOpenSort,
    sortOption,
    onStartSmartTimer
}) => {
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Smart Search Logic - Matches "25m", "start 25m", etc.
  const timerMatch = searchQuery.match(/(\d+)\s*[mM]/);
  const smartTimerMinutes = timerMatch ? parseInt(timerMatch[1]) : null;

  const filterTasks = (tasks: Task[]) => {
    let filtered = tasks;

    // Type filter
    if (filterType === 'completed') filtered = filtered.filter(t => t.completed);
    else if (filterType === 'important') filtered = filtered.filter(t => t.priority === 'high' && !t.completed);
    else if (filterType === 'today') filtered = filtered.filter(t => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString());
    else if (filterType === 'scheduled') filtered = filtered.filter(t => !t.completed && t.dueDate);
    else filtered = filtered.filter(t => !t.completed || t.completed); // All tasks

    // Category Filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    return filtered.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        
        switch(sortOption) {
            case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'priority': {
                const pMap = { high: 3, medium: 2, low: 1 };
                return pMap[b.priority] - pMap[a.priority];
            }
            case 'alphabetical': return a.title.localeCompare(b.title);
            default: return a.order - b.order; // Manual/Default
        }
    });
  };

  const displayedTasks = filterTasks(tasks);
  
  // Drag and Drop Logic
  const canDrag = filterType === 'all' && categoryFilter === 'all' && searchQuery === '' && sortOption === 'manual';

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (sourceId !== targetId && onReorder) {
      onReorder(sourceId, targetId);
    }
  };

  return (
    <div className="animate-slide-up pb-24">
       <div className="mb-8 sticky top-0 z-20 bg-[var(--surface)]/80 backdrop-blur-xl pt-4 -mt-4 px-1 pb-4 transition-colors">
            <h1 className="text-3xl font-display font-bold text-on-surface capitalize mb-6 flex items-center gap-3">
                {filterType === 'all' ? 'All Tasks' : `${filterType} Tasks`}
                <span className="text-lg font-normal text-on-surface-variant bg-[var(--surface-container-high)] px-3 py-0.5 rounded-full">{displayedTasks.length}</span>
            </h1>

            {/* Expressive Search & Filter Bar */}
            <div className="bg-[var(--surface-container)] p-2 rounded-[28px] flex flex-col md:flex-row gap-2 shadow-sm border border-[var(--outline-variant)]/10">
                <div className="flex-1 relative group">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[24px] group-focus-within:text-[var(--primary)] transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="Search or type '25m' for timer..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-4 bg-[var(--surface)] rounded-[20px] text-lg text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative md:w-40 flex-1">
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value as any)}
                            className="w-full h-14 pl-4 pr-8 bg-[var(--surface)] rounded-[20px] text-on-surface font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer text-sm"
                        >
                            <option value="all">All Categories</option>
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="health">Health</option>
                            <option value="learning">Learning</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
                    </div>
                    
                    <button 
                        onClick={onOpenSort}
                        className="h-14 px-4 bg-[var(--surface)] rounded-[20px] flex items-center justify-center text-on-surface hover:bg-[var(--surface-container-high)] transition-colors active:scale-95 border border-transparent focus:border-[var(--primary)] focus:outline-none"
                    >
                        <span className="material-symbols-outlined">sort</span>
                    </button>
                </div>
            </div>

            {/* Smart Timer Suggestion */}
            {smartTimerMinutes && smartTimerMinutes > 0 && (
                <button 
                    onClick={() => onStartSmartTimer(smartTimerMinutes)}
                    className="w-full mt-3 p-4 bg-[var(--primary)] text-[var(--on-primary)] rounded-[24px] flex items-center justify-between shadow-lg animate-slide-up hover:scale-[1.01] active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl">timer</span>
                        <div className="text-left">
                            <div className="font-bold text-lg">Start {smartTimerMinutes}m Focus Timer</div>
                            <div className="text-xs opacity-80">Quick Action</div>
                        </div>
                    </div>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            )}
       </div>

      <div className="grid gap-3">
        <AnimatePresence mode='popLayout'>
        {displayedTasks.length > 0 ? (
          displayedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleComplete={onTaskActions.toggleComplete} 
              onDelete={onTaskActions.delete} 
              onPin={onTaskActions.pin}
              onEdit={onTaskActions.edit}
              onLongPress={onTaskActions.longPress}
              isDraggable={canDrag}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-60"
          >
            <span className="material-symbols-outlined text-6xl mb-4 text-[var(--outline-variant)]">filter_list_off</span>
            <p className="text-lg">No tasks found matching your criteria.</p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};
