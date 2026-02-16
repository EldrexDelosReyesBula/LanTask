
import React, { useRef } from 'react';
import { Task, Priority, TaskColor } from '../types';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onEdit: (task: Task) => void;
  onLongPress: (task: Task) => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
}

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-100';
    case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-100';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-100';
    default: return 'bg-[var(--surface-container-high)] text-on-surface';
  }
};

const getTaskColorClass = (color?: TaskColor) => {
    switch (color) {
        case 'red': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30';
        case 'orange': return 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30';
        case 'yellow': return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30';
        case 'green': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30';
        case 'blue': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30';
        case 'purple': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30';
        case 'pink': return 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-900/30';
        default: return 'bg-[var(--surface-container)] border-[var(--outline-variant)]/20';
    }
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onPin, 
  onEdit, 
  onLongPress,
  isDraggable, 
  onDragStart, 
  onDrop 
}) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  // Long Press Logic
  const timerRef = useRef<any>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(50);
        onLongPress(task);
    }, 600);
  };

  const endPress = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart && isDraggable) {
      onDragStart(e, task.id);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isDraggable) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (onDrop && isDraggable) {
      e.preventDefault();
      onDrop(e, task.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (navigator.vibrate) navigator.vibrate(30);
      onLongPress(task);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      
      draggable={isDraggable && !task.completed}
      onDragStart={handleDragStart as any}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onEdit(task)}
      onContextMenu={handleContextMenu}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      
      className={`group relative rounded-[24px] p-5 cursor-pointer border shadow-sm hover:shadow-lg transition-shadow duration-300
        ${task.completed 
            ? 'opacity-60 bg-[var(--surface-container-low)] grayscale-[0.8] border-transparent' 
            : `${getTaskColorClass(task.color)}`
        } 
        ${isDraggable ? 'active:cursor-grabbing active:z-10' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox (Animated) */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-500 ease-spring group/check mt-1 ${
            task.completed 
                ? 'bg-[var(--primary)] border-[var(--primary)]' 
                : 'border-[var(--outline)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10'
          }`}
        >
          <span className={`material-symbols-outlined text-[var(--on-primary)] text-[16px] font-bold transition-all duration-300 ${
              task.completed ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 -rotate-90'
          }`}>
              check
          </span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className={`font-sans font-semibold text-lg text-on-surface mb-1 truncate transition-all duration-300 tracking-tight leading-snug ${task.completed ? 'line-through text-on-surface-variant' : ''}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
               {task.pinned && (
                    <span className="material-symbols-outlined text-[16px] text-[var(--primary)] -rotate-45" style={{ fontVariationSettings: "'FILL' 1" }}>keep</span>
               )}
               {task.reminder && !task.completed && (
                    <span className="material-symbols-outlined text-[16px] text-[var(--tertiary)] animate-pulse" title="Reminder set">notifications</span>
               )}
            </div>
          </div>
          
          {task.description && (
            <p className="text-on-surface-variant text-sm mb-3 line-clamp-2 leading-relaxed opacity-90">{task.description}</p>
          )}

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className={`text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  isOverdue 
                  ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50' 
                  : 'text-on-surface-variant border-[var(--outline-variant)]/20 bg-[var(--surface)]'
              }`}>
                <span className="material-symbols-outlined text-[14px]">event</span>
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
             {totalSubtasks > 0 && (
                <span className={`text-[11px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg text-[var(--on-secondary-container)] ${
                    completedSubtasks === totalSubtasks 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                    : 'bg-[var(--surface-container-high)] text-on-surface'
                }`}>
                    <span className="material-symbols-outlined text-[14px]">checklist</span>
                    {completedSubtasks}/{totalSubtasks}
                </span>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
