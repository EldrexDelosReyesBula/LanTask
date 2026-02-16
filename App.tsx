
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Page, Task, UserSettings, Subtask, ModalConfig, Category, Priority, ModalType, ThemeMode, TaskColor, FocusSession } from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { parseNaturalLanguageDate } from './utils/nlp';
import { Dashboard } from './pages/Dashboard';
import { TaskBoard } from './pages/TaskBoard';
import { FocusMode } from './pages/FocusMode';
import { Analytics as AnalyticsPage } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { FocusHistory } from './pages/FocusHistory';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { About } from './pages/About';
import { Sheet } from './components/Modal';
import { Onboarding } from './components/Onboarding';
import { Analytics } from "@vercel/analytics/react";

function App() {
  // --- Global State ---
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [sessions, setSessions] = useState<FocusSession[]>(StorageService.getSessions());
  const [sortOption, setSortOption] = useState('manual');
  
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!settings.hasCompletedOnboarding);
  const [showSleepOverlay, setShowSleepOverlay] = useState(false);
  const [sleepDismissed, setSleepDismissed] = useState(false);
  
  // --- Focus Timer Global State ---
  const [focusState, setFocusState] = useState({
      timeLeft: settings.focusDuration,
      isActive: false,
      mode: 'focus' as 'focus' | 'break',
      totalTime: settings.focusDuration
  });
  
  // Lifted Intent State for Persistence
  const [focusIntent, setFocusIntent] = useState('');
  
  // New: Explicit Immersive Mode State
  const [isImmersive, setIsImmersive] = useState(false);
  
  // --- Stacked Modal State ---
  const [modalStack, setModalStack] = useState<ModalConfig[]>([]);

  // Task Form State
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [dueDateInput, setDueDateInput] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Danger Zone State
  const [dangerTimer, setDangerTimer] = useState(5);
  const [isDangerActive, setIsDangerActive] = useState(false);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- Initialization & Theme Logic ---
  useEffect(() => {
    const loadedTasks = StorageService.getTasks();
    setTasks(loadedTasks);
    // Removed automatic requestPermission on load - moved to Settings toggle
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Theme & Mode Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);

    const applyMode = (isDark: boolean) => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    if (settings.themeMode === 'auto') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        applyMode(mq.matches);
        const handler = (e: MediaQueryListEvent) => applyMode(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    } else {
        applyMode(settings.themeMode === 'dark');
    }

    if (settings.grayscale) document.documentElement.classList.add('grayscale-mode');
    else document.documentElement.classList.remove('grayscale-mode');

  }, [settings.theme, settings.themeMode, settings.grayscale]);

  // Sync Focus State when Settings Change (if timer not active)
  useEffect(() => {
      if (!focusState.isActive && focusState.mode === 'focus') {
           setFocusState(prev => ({
               ...prev,
               timeLeft: settings.focusDuration,
               totalTime: settings.focusDuration
           }));
      }
  }, [settings.focusDuration]);

  // Handle Fullscreen Exit via ESC key
  useEffect(() => {
      const handleFsChange = () => {
          if (!document.fullscreenElement) {
              setIsImmersive(false);
          }
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Danger Zone Timer Effect
  useEffect(() => {
      let interval: any;
      if (isDangerActive && dangerTimer > 0) {
          interval = setInterval(() => setDangerTimer(prev => prev - 1), 1000);
      }
      return () => clearInterval(interval);
  }, [isDangerActive, dangerTimer]);

  // --- Sleep Mode Logic ---
  useEffect(() => {
      const checkSleepMode = () => {
          if (!settings.sleepEnabled) {
              setShowSleepOverlay(false);
              return;
          }

          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          
          const [startH, startM] = settings.sleepStartTime.split(':').map(Number);
          const [endH, endM] = settings.sleepEndTime.split(':').map(Number);
          
          const startTotal = startH * 60 + startM;
          const endTotal = endH * 60 + endM;
          
          let isSleepTime = false;
          
          if (startTotal < endTotal) {
              // Standard range (e.g. 01:00 to 06:00)
              isSleepTime = currentMinutes >= startTotal && currentMinutes < endTotal;
          } else {
              // Overnight range (e.g. 22:00 to 06:00)
              isSleepTime = currentMinutes >= startTotal || currentMinutes < endTotal;
          }
          
          if (isSleepTime && !sleepDismissed) {
              setShowSleepOverlay(true);
          } else if (!isSleepTime) {
              // Reset dismissal if outside sleep hours (e.g. next day)
              setSleepDismissed(false);
              setShowSleepOverlay(false);
          }
      };

      checkSleepMode();
      const interval = setInterval(checkSleepMode, 60000); // Check every minute
      return () => clearInterval(interval);
  }, [settings.sleepEnabled, settings.sleepStartTime, settings.sleepEndTime, sleepDismissed]);

  // Helper to Save Session
  const saveFocusSession = (status: 'completed' | 'abandoned', timeSpent: number) => {
      // Only save if duration was significant (> 1 minute)
      if (timeSpent < 60) return;

      const newSession: FocusSession = {
          id: crypto.randomUUID(),
          intent: focusIntent,
          duration: focusState.totalTime,
          timeSpent: timeSpent,
          status,
          date: new Date().toISOString()
      };
      StorageService.saveSession(newSession);
      setSessions(prev => [newSession, ...prev]);
  };

  // Global Focus Timer Ticker
  useEffect(() => {
    let interval: any = null;
    if (focusState.isActive && focusState.timeLeft > 0) {
      interval = setInterval(() => {
        setFocusState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (focusState.timeLeft === 0 && focusState.isActive) {
      // Timer Finished
      setFocusState(prev => ({ ...prev, isActive: false }));
      
      // Save Session
      saveFocusSession('completed', focusState.totalTime);

      if (settings.notificationsEnabled) {
          NotificationService.scheduleNotification("timer-end", "Timer Finished", "Your focus session is complete.");
      }
    }
    return () => clearInterval(interval);
  }, [focusState.isActive, focusState.timeLeft, settings.notificationsEnabled]);

  // --- Early Due Date & Reminder Notifications ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (!settings.notificationsEnabled) return;
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.completed) return;

        // 1. Explicit Reminder
        if (task.reminder) {
          const reminderTime = new Date(task.reminder);
          const diff = now.getTime() - reminderTime.getTime();
          // Trigger within 1 minute of reminder time (and hasn't been triggered yet)
          if (diff >= 0 && diff < 60000) {
             NotificationService.scheduleNotification(`reminder-${task.id}`, `Reminder: ${task.title}`, `It's time for: ${task.title}`);
          }
        }

        // 2. Due Date Early Warning (15 mins before if time exists)
        if (task.dueDate) {
            const due = new Date(task.dueDate);
            const hasTime = due.getHours() !== 0 || due.getMinutes() !== 0;
            
            if (hasTime) {
                const diffMinutes = (due.getTime() - now.getTime()) / 60000;
                if (diffMinutes > 0 && diffMinutes <= 15) {
                    NotificationService.scheduleNotification(`due-${task.id}`, `Upcoming Task`, `"${task.title}" is due in 15 minutes.`);
                }
            }
        }
      });
    }, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [tasks, settings.notificationsEnabled]);

  // --- Modal Management (Stack Logic) ---
  const pushModal = (type: ModalConfig['type'], props?: any) => {
    const id = crypto.randomUUID();
    setModalStack(prev => [...prev, { id, type, props }]);
  };

  const popModal = () => {
    setModalStack(prev => prev.slice(0, -1));
    setIsDangerActive(false);
    setDangerTimer(5);
  };

  const closeAllModals = () => {
    setModalStack([]);
    setIsDangerActive(false);
  };

  // --- Task CRUD ---
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const handleTaskActions = {
    toggleComplete: (id: string) => {
      const newTasks = tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined } : t
      );
      saveTasks(newTasks);
    },
    delete: (id: string) => {
      if(window.confirm('Delete this task?')) {
        const newTasks = tasks.filter(t => t.id !== id);
        saveTasks(newTasks);
      }
    },
    deleteFromOption: () => {
        if (selectedTask) {
             const newTasks = tasks.filter(t => t.id !== selectedTask.id);
             saveTasks(newTasks);
             closeAllModals();
        }
    },
    pin: (id: string) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t);
        saveTasks(newTasks);
    },
    setColor: (id: string, color: TaskColor) => {
        const newTasks = tasks.map(t => t.id === id ? { ...t, color } : t);
        saveTasks(newTasks);
    },
    edit: (task: Task) => {
      setEditingTask(task);
      setTaskForm({ ...task });
      if (task.dueDate) {
          const d = new Date(task.dueDate);
          const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
          if (hasTime) {
              const offset = d.getTimezoneOffset() * 60000;
              setDueDateInput(new Date(d.getTime() - offset).toISOString().slice(0, 16));
          } else {
              setDueDateInput(d.toISOString().split('T')[0]);
          }
      } else {
          setDueDateInput('');
      }
      pushModal('TASK_FORM');
    },
    openAdd: () => {
        setEditingTask(null);
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0;
        setTaskForm({ priority: 'medium', category: 'personal', subtasks: [], order: maxOrder + 1, color: 'default' });
        setDueDateInput('');
        pushModal('TASK_FORM');
    },
    longPress: (task: Task) => {
        setSelectedTask(task);
        pushModal('TASK_OPTIONS');
    }
  };

  const handleReorder = (sourceId: string, targetId: string) => {
    const sourceIndex = tasks.findIndex(t => t.id === sourceId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);
    const reorderedTasks = newTasks.map((t, index) => ({ ...t, order: index }));
    saveTasks(reorderedTasks);
  };

  // --- Form Logic ---
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = { id: crypto.randomUUID(), title: newSubtaskTitle, completed: false };
    setTaskForm({ ...taskForm, subtasks: [...(taskForm.subtasks || []), newSubtask] });
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = taskForm.subtasks?.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    setTaskForm({ ...taskForm, subtasks: updatedSubtasks });
  };

  const handleDateBlur = () => {
    if (!dueDateInput) { setTaskForm({ ...taskForm, dueDate: undefined }); return; }
    const parsed = parseNaturalLanguageDate(dueDateInput);
    if (parsed) {
        setTaskForm({ ...taskForm, dueDate: parsed.toISOString() });
        const hasTime = parsed.getHours() !== 0 || parsed.getMinutes() !== 0;
        if (hasTime) {
             const offset = parsed.getTimezoneOffset() * 60000;
             setDueDateInput(new Date(parsed.getTime() - offset).toISOString().slice(0, 16));
        } else {
            setDueDateInput(parsed.toISOString().split('T')[0]); 
        }
    }
  };

  const handleSaveTask = () => {
    if (!taskForm.title) return;
    if (editingTask) {
      const updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...taskForm, updatedAt: new Date().toISOString() } : t);
      saveTasks(updatedTasks as Task[]);
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        title: taskForm.title!,
        description: taskForm.description || '',
        category: taskForm.category as any || 'personal',
        priority: taskForm.priority as any || 'medium',
        tags: [],
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        dueDate: taskForm.dueDate,
        timeEstimate: taskForm.timeEstimate,
        subtasks: taskForm.subtasks || [],
        reminder: taskForm.reminder,
        order: taskForm.order || 0,
        color: taskForm.color || 'default',
        duration: taskForm.duration
      };
      saveTasks([newTask, ...tasks]);
    }
    closeAllModals();
  };

  const handleImportData = (jsonContent: string) => {
      try {
          const data = JSON.parse(jsonContent);
          
          // Full Backup Import
          if (data.tasks || data.settings) {
              if (data.tasks && Array.isArray(data.tasks)) {
                  // Merge tasks
                  const mergedTasks = [...tasks, ...data.tasks];
                  // Basic deduplication based on ID could be added here, 
                  // but simple append is safer than accidental data loss for now.
                  saveTasks(mergedTasks);
              }
              if (data.settings) {
                  const newSettings = { ...settings, ...data.settings };
                  setSettings(newSettings);
                  StorageService.saveSettings(newSettings);
              }
              if (data.sessions && Array.isArray(data.sessions)) {
                  const newSessions = [...sessions, ...data.sessions].slice(0, 100);
                  setSessions(newSessions);
                  localStorage.setItem('lantask-pro-sessions', JSON.stringify(newSessions));
              }
              alert('Backup restored successfully!');
          }
          // Backward Compatibility (Array of tasks)
          else if (Array.isArray(data)) {
              const merged = [...tasks, ...data];
              saveTasks(merged);
              alert('Tasks imported successfully!');
          } else {
              alert('Unknown file format.');
          }
      } catch (e) {
          alert('Invalid JSON file.');
      }
  };

  const handleClearData = () => {
      StorageService.clearData();
      setTasks([]);
      setSessions([]);
      setSettings(StorageService.getSettings());
      window.location.reload();
  };

  // --- Renderers ---
  
  const renderTaskForm = () => (
    <div className="space-y-6 pt-2">
      {/* Title */}
      <div>
        <input 
          autoFocus
          type="text" 
          className="w-full px-5 py-4 rounded-2xl bg-[var(--surface-container-high)] border-none focus:ring-2 focus:ring-[var(--primary)] focus:outline-none text-xl font-bold placeholder:text-on-surface-variant/50 transition-shadow"
          value={taskForm.title || ''}
          onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
          placeholder="What needs to be done?"
        />
      </div>

      {/* Description */}
      <div>
        <div className="bg-[var(--surface-container-low)] rounded-xl p-1 focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-shadow">
            <textarea 
            className="w-full px-4 py-3 bg-transparent border-none focus:outline-none resize-none h-24 text-sm font-medium placeholder:text-on-surface-variant/50"
            value={taskForm.description || ''}
            onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
            placeholder="Add details about this task..."
            />
        </div>
      </div>
      
       {/* Subtasks (Dashed Box) */}
       <div>
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Subtasks</label>
        <div className="border-2 border-dashed border-[var(--outline-variant)] rounded-2xl p-4 bg-[var(--surface-container)]/30">
            <div className="space-y-3 mb-3">
            {taskForm.subtasks?.map((st, i) => (
                <div key={st.id} className="flex items-center gap-3 animate-slide-up group" style={{ animationDelay: `${i * 50}ms` }}>
                    <input 
                        type="checkbox" 
                        checked={st.completed} 
                        onChange={() => toggleSubtask(st.id)} 
                        className="w-5 h-5 rounded border-2 border-[var(--outline)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer" 
                    />
                    <span className={`flex-1 text-sm font-medium ${st.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>{st.title}</span>
                </div>
            ))}
            </div>
            
            <div className="flex items-center gap-2 bg-[var(--surface)] px-4 py-3 rounded-xl border border-[var(--outline-variant)]/30 focus-within:border-[var(--primary)] focus-within:ring-1 focus-within:ring-[var(--primary)] transition-all">
                <input 
                    type="text" 
                    placeholder="Add subtask" 
                    className="flex-1 text-sm bg-transparent border-none focus:outline-none font-medium" 
                    value={newSubtaskTitle} 
                    onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()} 
                />
                <button onClick={addSubtask} className="text-on-surface-variant hover:text-[var(--primary)] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
            </div>
        </div>
      </div>

      {/* Grid for Date & Category */}
      <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Due Date</label>
             <div className="bg-[var(--surface-container-low)] rounded-xl px-4 py-3.5 hover:bg-[var(--surface-container-high)] transition-colors">
                 <input 
                    type="text" 
                    className="w-full bg-transparent border-none focus:outline-none text-sm font-semibold" 
                    value={dueDateInput} 
                    onChange={(e) => setDueDateInput(e.target.value)} 
                    onBlur={handleDateBlur} 
                    placeholder="e.g. Fri at 3pm" 
                 />
             </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
             <button 
                onClick={() => pushModal('SELECT_CATEGORY')}
                className="w-full text-left"
             >
                <div className="bg-[var(--surface-container-low)] rounded-xl px-4 py-3.5 flex items-center justify-between text-sm hover:bg-[var(--surface-container-high)] transition-colors">
                    <span className="capitalize font-semibold">{taskForm.category}</span>
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </div>
             </button>
          </div>
      </div>
      
      {/* Remind Me */}
      <div>
         <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Remind Me</label>
         <div className={`rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors ${taskForm.reminder ? 'bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]' : 'bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]'}`}>
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <input 
                type="datetime-local"
                className="bg-transparent border-none text-sm w-full focus:outline-none font-semibold"
                value={taskForm.reminder || ''}
                onChange={(e) => setTaskForm({...taskForm, reminder: e.target.value})}
            />
            {taskForm.reminder && (
                <button onClick={() => setTaskForm({...taskForm, reminder: undefined})} className="hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
         </div>
      </div>
      
      {/* Color Picker (Subtle) */}
      <div>
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Color Tint</label>
          <div className="flex gap-3 overflow-x-auto pb-2 items-center no-scrollbar">
              {(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'] as TaskColor[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setTaskForm({...taskForm, color: c})}
                    className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center shrink-0 ${
                        taskForm.color === c || (!taskForm.color && c === 'default') 
                        ? 'scale-110 border-2 border-[var(--primary)]' 
                        : 'border border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c === 'default' ? 'var(--surface-container-high)' : `var(--color-${c}, ${c})` }}
                  >
                  </button>
              ))}
          </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-[var(--outline-variant)]/10 mt-4">
          <button onClick={popModal} className="px-6 py-3 text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary-container)]/30 rounded-full transition-colors">Cancel</button>
          <button onClick={handleSaveTask} disabled={!taskForm.title} className="px-10 py-3 text-sm font-bold bg-[#3A693B] text-white rounded-full hover:shadow-lg disabled:opacity-50 transition-all active:scale-95 shadow-md">Save</button>
      </div>
    </div>
  );

  const renderCategorySelector = () => {
    const categories: {id: Category, icon: string, label: string}[] = [
        { id: 'personal', icon: 'person', label: 'Personal' },
        { id: 'work', icon: 'work', label: 'Work' },
        { id: 'health', icon: 'favorite', label: 'Health' },
        { id: 'learning', icon: 'school', label: 'Learning' },
        { id: 'other', icon: 'category', label: 'Other' },
    ];
    return (
        <div className="space-y-1">
            {categories.map((cat, i) => (
                <button
                    key={cat.id}
                    onClick={() => { setTaskForm({...taskForm, category: cat.id}); popModal(); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all animate-slide-up ${taskForm.category === cat.id ? 'bg-[var(--surface-container-high)]' : 'hover:bg-[var(--surface-container-high)]/50'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                    <span className="material-symbols-outlined text-[var(--on-surface-variant)]">{cat.icon}</span>
                    <span className="font-medium text-sm text-on-surface capitalize">{cat.label}</span>
                    {taskForm.category === cat.id && <span className="material-symbols-outlined ml-auto text-[var(--primary)]">check</span>}
                </button>
            ))}
        </div>
    );
  };
  
  const renderPrioritySelector = () => {
    const priorities: Priority[] = ['low', 'medium', 'high'];
    return (
        <div className="grid gap-2">
            {priorities.map((p, i) => (
                <button
                    key={p}
                    onClick={() => { setTaskForm({...taskForm, priority: p}); popModal(); }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all animate-slide-up ${taskForm.priority === p ? 'bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]' : 'hover:bg-[var(--surface-container-high)]'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                     <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                        <span className="capitalize font-medium">{p} Priority</span>
                    </div>
                    {taskForm.priority === p && <span className="material-symbols-outlined">check</span>}
                </button>
            ))}
        </div>
    );
  };

  const renderTaskOptions = () => {
      if (!selectedTask) return null;
      return (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { handleTaskActions.edit(selectedTask); }} className="flex flex-col items-center justify-center p-4 bg-[var(--surface-container-high)] rounded-2xl hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] transition-colors active:scale-95">
                      <span className="material-symbols-outlined text-2xl mb-1">edit</span>
                      <span className="text-sm font-bold">Edit</span>
                  </button>
                   <button onClick={() => { handleTaskActions.pin(selectedTask.id); closeAllModals(); }} className={`flex flex-col items-center justify-center p-4 bg-[var(--surface-container-high)] rounded-2xl transition-colors active:scale-95 ${selectedTask.pinned ? 'bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)]' : 'hover:bg-[var(--tertiary-container)]'}`}>
                      <span className="material-symbols-outlined text-2xl mb-1">{selectedTask.pinned ? 'keep_off' : 'keep'}</span>
                      <span className="text-sm font-bold">{selectedTask.pinned ? 'Unpin' : 'Pin'}</span>
                  </button>
              </div>
              
              {selectedTask.duration && (
                  <button 
                    onClick={() => { 
                        // Start timer in background (widget), don't force navigation
                        setFocusState({ timeLeft: selectedTask.duration! * 60, isActive: true, mode: 'focus', totalTime: selectedTask.duration! * 60 });
                        closeAllModals();
                    }} 
                    className="w-full py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Start Focus ({selectedTask.duration}m)
                  </button>
              )}

              {/* Color Quick Pick */}
              <div>
                  <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Color Tint</h3>
                   <div className="flex justify-between px-2">
                    {(['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'] as TaskColor[]).map(c => (
                        <button
                            key={c}
                            onClick={() => { handleTaskActions.setColor(selectedTask.id, c); closeAllModals(); }}
                            className={`w-10 h-10 rounded-full transition-transform active:scale-95 flex items-center justify-center ${selectedTask.color === c || (!selectedTask.color && c === 'default') ? 'scale-110 border-2 border-[var(--primary)]' : 'border border-transparent'}`}
                            style={{ backgroundColor: c === 'default' ? 'var(--surface-container-high)' : `var(--color-${c}, ${c})` }}
                        >
                             {c === 'default' && <span className="material-symbols-outlined text-[16px] text-on-surface-variant opacity-60">block</span>}
                        </button>
                    ))}
                   </div>
              </div>

              <div className="pt-4 border-t border-[var(--outline-variant)]/20">
                  <button onClick={handleTaskActions.deleteFromOption} className="w-full py-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors active:scale-95">
                      <span className="material-symbols-outlined">delete</span>
                      Delete Task
                  </button>
              </div>
          </div>
      );
  };
  
  const renderSortOptions = () => (
      <div className="space-y-2">
          {[
              { id: 'manual', label: 'Manual Order', icon: 'drag_indicator' },
              { id: 'newest', label: 'Newest First', icon: 'schedule' },
              { id: 'oldest', label: 'Oldest First', icon: 'history' },
              { id: 'priority', label: 'Priority', icon: 'flag' },
              { id: 'alphabetical', label: 'Alphabetical', icon: 'sort_by_alpha' }
          ].map((opt, i) => (
              <button
                key={opt.id}
                onClick={() => { setSortOption(opt.id); popModal(); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors animate-slide-up ${sortOption === opt.id ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]' : 'hover:bg-[var(--surface-container-high)] text-on-surface'}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                  <span className="material-symbols-outlined">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                  {sortOption === opt.id && <span className="material-symbols-outlined ml-auto">check</span>}
              </button>
          ))}
      </div>
  );

  const renderDangerZone = () => (
      <div className="text-center space-y-6 pt-4">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop">
              <span className="material-symbols-outlined text-4xl">warning</span>
          </div>
          <div>
              <h3 className="text-xl font-bold text-on-surface">Reset Application?</h3>
              <p className="text-on-surface-variant mt-2 px-4">This will permanently delete all tasks and reset your settings to default. This action cannot be undone.</p>
          </div>
          
          <button 
            onClick={handleClearData} 
            disabled={dangerTimer > 0}
            className="w-full py-4 rounded-2xl font-bold text-white bg-red-600 disabled:bg-red-300 dark:disabled:bg-red-900/40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
              {dangerTimer > 0 ? `Wait ${dangerTimer}s` : 'Delete Everything'}
          </button>
      </div>
  );

  const renderGrayscaleConfirm = () => (
      <div className="text-center space-y-6 pt-4">
          <div className="w-20 h-20 bg-[var(--surface-container-high)] text-on-surface rounded-full flex items-center justify-center mx-auto mb-4 grayscale animate-pop">
              <span className="material-symbols-outlined text-4xl">contrast</span>
          </div>
          <div>
              <h3 className="text-xl font-bold text-on-surface">Enable Grayscale?</h3>
              <p className="text-on-surface-variant mt-2 px-4">Grayscale mode removes all color from the app to reduce stimulation and help you focus.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={popModal} className="flex-1 py-3 font-bold text-[var(--primary)] hover:bg-[var(--primary-container)]/20 rounded-2xl transition-colors">Cancel</button>
            <button 
                onClick={() => { 
                    setSettings({...settings, grayscale: !settings.grayscale}); 
                    StorageService.saveSettings({...settings, grayscale: !settings.grayscale});
                    popModal(); 
                }} 
                className="flex-1 py-3 rounded-2xl font-bold bg-[var(--primary)] text-[var(--on-primary)] hover:shadow-lg active:scale-95 transition-all"
            >
                {settings.grayscale ? 'Disable' : 'Enable'}
            </button>
          </div>
      </div>
  );

  const renderModalContent = (config: ModalConfig) => {
    switch (config.type) {
        case 'TASK_FORM': return renderTaskForm();
        case 'SELECT_CATEGORY': return renderCategorySelector();
        case 'SELECT_PRIORITY': return renderPrioritySelector();
        case 'TASK_OPTIONS': return renderTaskOptions();
        case 'DANGER_ZONE': return renderDangerZone();
        case 'CONFIRM_GRAYSCALE': return renderGrayscaleConfirm();
        case 'SORT_OPTIONS': return renderSortOptions();
        default: return null;
    }
  };

  const getModalTitle = (type: ModalType) => {
      switch(type) {
          case 'TASK_FORM': return editingTask ? 'Edit Task' : 'New Task';
          case 'SELECT_CATEGORY': return 'Select Category';
          case 'SELECT_PRIORITY': return 'Set Priority';
          case 'TASK_OPTIONS': return 'Task Options';
          case 'DANGER_ZONE': return 'Danger Zone';
          case 'CONFIRM_GRAYSCALE': return 'Focus Mode';
          case 'SORT_OPTIONS': return 'Sort Tasks';
          default: return '';
      }
  }

  const renderPage = () => {
    return (
        <div key={activePage} className="animate-enter w-full">
            {(() => {
                switch (activePage) {
                case 'dashboard': return <Dashboard tasks={tasks} userName={settings.name} onNavigate={setActivePage} onTaskActions={handleTaskActions} onOpenFocus={() => setActivePage('focus')} />;
                case 'tasks': 
                    return <TaskBoard 
                        tasks={tasks} 
                        filterType="all" 
                        onTaskActions={handleTaskActions} 
                        onReorder={handleReorder}
                        onOpenSort={() => pushModal('SORT_OPTIONS')}
                        sortOption={sortOption}
                        onStartSmartTimer={(minutes) => { 
                            setFocusState({ timeLeft: minutes * 60, isActive: true, mode: 'focus', totalTime: minutes * 60 });
                            setActivePage('focus');
                        }}
                    />;
                case 'today': return <TaskBoard tasks={tasks} filterType="today" onTaskActions={handleTaskActions} onOpenSort={() => pushModal('SORT_OPTIONS')} sortOption={sortOption} onStartSmartTimer={() => {}} />;
                case 'scheduled': return <TaskBoard tasks={tasks} filterType="scheduled" onTaskActions={handleTaskActions} onOpenSort={() => pushModal('SORT_OPTIONS')} sortOption={sortOption} onStartSmartTimer={() => {}} />;
                case 'important': return <TaskBoard tasks={tasks} filterType="important" onTaskActions={handleTaskActions} onOpenSort={() => pushModal('SORT_OPTIONS')} sortOption={sortOption} onStartSmartTimer={() => {}} />;
                case 'completed': return <TaskBoard tasks={tasks} filterType="completed" onTaskActions={handleTaskActions} onOpenSort={() => pushModal('SORT_OPTIONS')} sortOption={sortOption} onStartSmartTimer={() => {}} />;
                case 'focus': 
                    return <FocusMode 
                        timeLeft={focusState.timeLeft} 
                        isActive={focusState.isActive} 
                        mode={focusState.mode} 
                        totalTime={focusState.totalTime}
                        onToggle={() => setFocusState(prev => ({ ...prev, isActive: !prev.isActive }))}
                        onReset={() => {
                            saveFocusSession('abandoned', focusState.totalTime - focusState.timeLeft);
                            setFocusState(prev => ({ ...prev, isActive: false, timeLeft: settings.focusDuration }));
                        }}
                        onSetMode={(m, time) => setFocusState({ timeLeft: time, isActive: false, mode: m, totalTime: time })}
                        settings={settings}
                        onUpdateSettings={(s) => { setSettings(s); StorageService.saveSettings(s); }}
                        isImmersive={isImmersive}
                        onToggleImmersive={setIsImmersive}
                        intent={focusIntent}
                        onIntentChange={setFocusIntent}
                    />;
                case 'history':
                    return <FocusHistory 
                        sessions={sessions} 
                        onReuse={(session) => {
                            setFocusIntent(session.intent);
                            const newSettings = { ...settings, focusDuration: session.duration };
                            setSettings(newSettings);
                            StorageService.saveSettings(newSettings);
                            setFocusState({
                                timeLeft: session.duration,
                                totalTime: session.duration,
                                isActive: false,
                                mode: 'focus'
                            });
                            setActivePage('focus');
                        }}
                    />;
                case 'analytics': return <AnalyticsPage tasks={tasks} />;
                case 'settings': 
                    return <Settings 
                        settings={settings} 
                        onUpdateSettings={(s) => { setSettings(s); StorageService.saveSettings(s); }} 
                        onClearData={() => { setIsDangerActive(true); setDangerTimer(5); pushModal('DANGER_ZONE'); }} 
                        installPrompt={deferredPrompt}
                        onInstall={() => { if(deferredPrompt) deferredPrompt.prompt(); }}
                        onTriggerGrayscaleConfirm={() => pushModal('CONFIRM_GRAYSCALE')}
                        onTriggerDangerZone={() => { setIsDangerActive(true); setDangerTimer(5); pushModal('DANGER_ZONE'); }}
                        onImportData={handleImportData}
                        onNavigate={setActivePage}
                    />;
                case 'privacy': return <PrivacyPolicy onNavigate={setActivePage} />;
                case 'terms': return <TermsOfUse onNavigate={setActivePage} />;
                case 'about': return <About onNavigate={setActivePage} />;
                default: return null;
                }
            })()}
        </div>
    );
  };
  
  if (showOnboarding) {
      return (
          <Onboarding 
            settings={settings}
            onUpdateSettings={(s) => { setSettings(s); StorageService.saveSettings(s); }}
            onComplete={() => setShowOnboarding(false)}
          />
      );
  }
  
  // Immersive Mode hides everything
  if (isImmersive) {
      return (
          <div className="fixed inset-0 bg-[var(--surface)] text-[var(--on-surface)] z-50">
             <FocusMode 
                timeLeft={focusState.timeLeft} 
                isActive={focusState.isActive} 
                mode={focusState.mode} 
                totalTime={focusState.totalTime}
                onToggle={() => setFocusState(prev => ({ ...prev, isActive: !prev.isActive }))}
                onReset={() => {
                     saveFocusSession('abandoned', focusState.totalTime - focusState.timeLeft);
                     setFocusState(prev => ({ ...prev, isActive: false, timeLeft: settings.focusDuration }));
                }}
                onSetMode={(m, time) => setFocusState({ timeLeft: time, isActive: false, mode: m, totalTime: time })}
                settings={settings}
                onUpdateSettings={(s) => { setSettings(s); StorageService.saveSettings(s); }}
                isImmersive={isImmersive}
                onToggleImmersive={setIsImmersive}
                intent={focusIntent}
                onIntentChange={setFocusIntent}
            />
          </div>
      );
  }
  
  // --- SLEEP MODE OVERLAY ---
  if (showSleepOverlay && !sleepDismissed) {
      return (
          <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center animate-enter px-6 text-center">
             <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/40 rounded-full blur-[100px]"></div>
                 <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-900/40 rounded-full blur-[100px]"></div>
             </div>
             
             <span className="material-symbols-outlined text-6xl mb-6 text-indigo-300 animate-pulse">bedtime</span>
             <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Time to Rest</h1>
             <p className="text-xl text-white/70 max-w-lg leading-relaxed mb-12">
                 "Sleep is the best meditation." <br/>
                 Disconnect to reconnect tomorrow.
             </p>
             
             <button 
                onClick={() => setSleepDismissed(true)}
                className="px-8 py-3 rounded-full border border-white/20 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors z-10"
             >
                 I'm still awake
             </button>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[var(--surface)] text-[var(--on-surface)] overflow-hidden transition-colors duration-500">
      
      {settings.analyticsEnabled && <Analytics />}
      
      {/* Sidebar - Desktop (Static) / Mobile (Drawer) */}
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        onAddTask={handleTaskActions.openAdd} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="" // Removed 'hidden lg:flex' to allow fixed positioning on mobile
      />

      <main className="flex-1 flex flex-col h-full relative">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden h-16 flex items-center px-4 bg-[var(--surface-container-low)] border-b border-[var(--outline-variant)]/20 shrink-0 sticky top-0 z-30">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-full text-on-surface-variant hover:bg-[var(--surface-container-high)]"
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="ml-2 font-display font-bold text-lg text-[var(--primary)]">LanTask</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {renderPage()}
          </div>
        </div>
        
        {/* Active Timer Widget (When not on focus page) */}
        {activePage !== 'focus' && focusState.isActive && (
            <div 
                onClick={() => setActivePage('focus')}
                className="fixed bottom-24 left-6 right-6 lg:left-auto lg:right-10 lg:bottom-10 lg:w-96 bg-[#1A1C1E] dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer animate-slide-up z-30 ring-1 ring-white/10 hover:scale-[1.02] transition-transform ease-spring"
            >
                <div className="relative z-10">
                    <div className="text-[10px] font-bold opacity-60 uppercase tracking-wide mb-1">Active Timer</div>
                    <div className="text-3xl font-mono font-bold tracking-tight">
                        {Math.floor(focusState.timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(focusState.timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div className="relative z-10 flex items-center gap-2 font-bold text-sm">
                    Go to Focus Mode <span className="material-symbols-outlined">chevron_right</span>
                </div>
                {/* Progress Bar Background */}
                <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-current transition-all duration-1000 ease-linear"
                        style={{ width: `${(1 - focusState.timeLeft / focusState.totalTime) * 100}%` }}
                    />
                </div>
            </div>
        )}

        {/* FAB - Mobile Only */}
        <button 
            onClick={handleTaskActions.openAdd}
            className="lg:hidden fixed bottom-24 right-6 w-16 h-16 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-[24px] shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 ease-spring hover:scale-110 active:scale-95 z-20 group"
        >
            <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
        </button>
      </main>

      {/* Bottom Nav */}
      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      {modalStack.map((modal, index) => (
        <Sheet 
            key={modal.id} 
            isOpen={true} 
            onClose={popModal} 
            title={getModalTitle(modal.type)}
            index={index}
            totalSheets={modalStack.length}
        >
            {renderModalContent(modal)}
        </Sheet>
      ))}
    </div>
  );
}

export default App;
