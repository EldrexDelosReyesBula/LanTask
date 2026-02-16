
import { Task, UserSettings, FocusSession } from '../types';

const TASKS_KEY = 'lantask-pro-tasks';
const SETTINGS_KEY = 'lantask-pro-settings';
const SESSIONS_KEY = 'lantask-pro-sessions';

const defaultSettings: UserSettings = {
  theme: 'sierra-blue',
  themeMode: 'auto',
  name: 'User',
  focusDuration: 2700,
  notificationsEnabled: false,
  grayscale: false,
  focusQuotes: true,
  focusFlipMode: false,
  focusFlipInterval: 10,
  analyticsEnabled: true,
  hasCompletedOnboarding: false,
  sleepEnabled: false,
  sleepStartTime: "22:00",
  sleepEndTime: "06:00"
};

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Welcome to LanTask',
    description: 'This is a sample task to get you started.!',
    category: 'other',
    priority: 'medium',
    tags: [],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
    subtasks: [
      { id: 'st1', title: 'Explore features', completed: false },
      { id: 'st2', title: 'Try Focus Mode', completed: false }
    ],
    order: 0,
  },
];

export const StorageService = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (!data) return defaultTasks;
      
      const tasks = JSON.parse(data);
      return tasks.map((t: any, index: number) => ({
        ...t,
        subtasks: t.subtasks || [],
        order: t.order ?? index,
        reminder: t.reminder || undefined
      }));
    } catch (e) {
      console.error('Failed to load tasks', e);
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return defaultSettings;
      
      const parsed = JSON.parse(data);
      
      // Migrations / Safeguards
      if ('isDarkMode' in parsed) {
          parsed.themeMode = parsed.isDarkMode ? 'dark' : 'light';
          delete parsed.isDarkMode;
      }
      if (parsed.theme === 'dark') {
          parsed.theme = 'sierra-blue';
          parsed.themeMode = 'dark';
      }
      if (parsed.focusDuration && parsed.focusDuration < 200) {
          parsed.focusDuration = parsed.focusDuration * 60;
      }

      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.error('Failed to load settings', e);
      return defaultSettings;
    }
  },

  saveSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getSessions: (): FocusSession[] => {
    try {
        const data = localStorage.getItem(SESSIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to load sessions', e);
        return [];
    }
  },

  saveSession: (session: FocusSession) => {
      try {
          const sessions = StorageService.getSessions();
          sessions.unshift(session);
          if (sessions.length > 100) sessions.pop();
          localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      } catch (e) {
          console.error('Failed to save session', e);
      }
  },
  
  clearData: () => {
      localStorage.removeItem(TASKS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(SESSIONS_KEY);
  }
};
