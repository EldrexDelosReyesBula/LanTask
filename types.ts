
export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'health' | 'learning' | 'other';
export type Theme = 'sierra-blue' | 'graphite' | 'gold' | 'sage' | 'purple' | 'cosmic-orange' | 'lavender' | 'pink' | 'crimson';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type TaskColor = 'default' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  tags: string[];
  dueDate?: string; // ISO Date string
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  timeEstimate?: string;
  pinned: boolean;
  
  // New features
  subtasks: Subtask[];
  reminder?: string; // ISO Date string
  order: number;
  color?: TaskColor;
  duration?: number; // minutes for focus timer
}

export interface UserSettings {
  theme: Theme;
  themeMode: ThemeMode;
  name: string;
  focusDuration: number; // Stored in SECONDS
  notificationsEnabled: boolean;
  grayscale: boolean;
  
  // New Settings
  analyticsEnabled: boolean;
  hasCompletedOnboarding: boolean;
  
  // Focus Mode Specifics
  focusQuotes: boolean;
  focusFlipMode: boolean; // Toggle between timer and intent
  focusFlipInterval: number; // Seconds to show each state

  // Sleep Mode
  sleepEnabled: boolean;
  sleepStartTime: string; // Format "HH:mm" 24h
  sleepEndTime: string;   // Format "HH:mm" 24h
}

export interface FocusSession {
  id: string;
  intent: string;
  duration: number; // Planned duration in seconds
  timeSpent: number; // Actual time spent in seconds
  status: 'completed' | 'abandoned';
  date: string; // ISO Date string
}

export type Page = 'dashboard' | 'tasks' | 'today' | 'scheduled' | 'important' | 'completed' | 'analytics' | 'focus' | 'settings' | 'history' | 'privacy' | 'terms' | 'about';

// Modal System Types
export type ModalType = 
  | 'TASK_FORM' 
  | 'SELECT_CATEGORY' 
  | 'SELECT_PRIORITY' 
  | 'TASK_OPTIONS' 
  | 'CONFIRM_GRAYSCALE' 
  | 'DANGER_ZONE'
  | 'SORT_OPTIONS';

export interface ModalConfig {
  id: string;
  type: ModalType;
  props?: any;
}
