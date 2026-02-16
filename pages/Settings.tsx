
import React, { useState, useRef } from 'react';
import { UserSettings, Theme, ThemeMode, Page } from '../types';
import { NotificationService } from '../services/notifications';

interface SettingsProps {
  settings: UserSettings;
  onUpdateSettings: (s: UserSettings) => void;
  onClearData: () => void;
  installPrompt: any;
  onInstall: () => void;
  onTriggerGrayscaleConfirm: () => void;
  onTriggerDangerZone: () => void;
  onImportData: (data: string) => void;
  onNavigate: (page: Page) => void;
}

const themes: { id: Theme; name: string; color: string }[] = [
  { id: 'sierra-blue', name: 'Sierra', color: '#0061A4' },
  { id: 'graphite', name: 'Graphite', color: '#5E5E5E' },
  { id: 'gold', name: 'Gold', color: '#745B00' },
  { id: 'sage', name: 'Sage', color: '#3A693B' },
  { id: 'purple', name: 'Purple', color: '#794D99' },
  { id: 'cosmic-orange', name: 'Cosmic', color: '#A34100' },
  { id: 'lavender', name: 'Lavender', color: '#57589D' },
  { id: 'pink', name: 'Pink', color: '#E91E63' },
  { id: 'crimson', name: 'Crimson', color: '#D32F2F' },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={`w-14 h-8 rounded-full transition-colors duration-300 relative focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--outline-variant)]/50'}`}
  >
    <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute top-1 transition-all duration-300 ease-spring ${checked ? 'left-7' : 'left-1'}`} />
  </button>
);

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdateSettings, 
  installPrompt, 
  onInstall,
  onTriggerGrayscaleConfirm,
  onTriggerDangerZone,
  onImportData,
  onNavigate
}) => {
  const [nameInputValue, setNameInputValue] = useState(settings.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameBlur = () => {
      if (nameInputValue.trim() !== "") {
          onUpdateSettings({ ...settings, name: nameInputValue });
      } else {
          setNameInputValue(settings.name);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) onImportData(content);
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportData = () => {
      const data = {
          tasks: JSON.parse(localStorage.getItem('lantask-pro-tasks') || '[]'),
          settings: settings,
          sessions: JSON.parse(localStorage.getItem('lantask-pro-sessions') || '[]'),
          version: '1.4.0',
          exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lantask_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
      if (enabled) {
          const granted = await NotificationService.requestPermission();
          if (granted) {
              onUpdateSettings({ ...settings, notificationsEnabled: true });
              NotificationService.scheduleNotification("test", "Notifications Enabled", "You will now receive task reminders.");
          } else {
              alert("Notification permission denied. Please enable it in your browser settings.");
              onUpdateSettings({ ...settings, notificationsEnabled: false });
          }
      } else {
          onUpdateSettings({ ...settings, notificationsEnabled: false });
      }
  };

  return (
    <div className="animate-slide-up pb-24 space-y-8">
      <h1 className="text-2xl font-display font-bold text-on-surface">Settings</h1>

      {/* User Profile - Inline Edit */}
      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
         <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">User Profile</h2>
         <div className="flex items-center gap-4 bg-[var(--surface-container-low)] p-2 rounded-2xl border border-transparent transition-all hover:bg-[var(--surface-container)]">
             <div className="w-12 h-12 rounded-xl bg-[var(--primary-container)] flex items-center justify-center text-[var(--on-primary-container)] font-bold text-xl">
                 {settings.name.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1">
                 <label className="text-[10px] text-on-surface-variant font-bold block uppercase tracking-wide ml-1">Display Name</label>
                 <input 
                    type="text" 
                    value={nameInputValue}
                    onChange={(e) => setNameInputValue(e.target.value)}
                    onBlur={handleNameBlur}
                    className="w-full bg-transparent border-none text-xl font-display font-bold text-on-surface focus:ring-0 p-0 hover:bg-transparent"
                 />
             </div>
             <span className="material-symbols-outlined text-on-surface-variant pr-4">edit</span>
         </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-on-surface">Appearance</h2>
        
        {/* Theme Colors */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Color Theme</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {themes.map(t => (
                <button
                key={t.id}
                onClick={() => onUpdateSettings({ ...settings, theme: t.id })}
                className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-300 relative ${
                    settings.theme === t.id 
                    ? 'bg-[var(--surface-container-high)] ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]' 
                    : 'hover:bg-[var(--surface-container-low)]'
                }`}
                >
                    <div 
                        className="w-10 h-10 rounded-full shadow-sm" 
                        style={{ backgroundColor: t.color }}
                    ></div>
                    <span className={`text-xs font-medium ${settings.theme === t.id ? 'text-[var(--primary)] font-bold' : 'text-on-surface'}`}>
                        {t.name}
                    </span>
                    {settings.theme === t.id && (
                        <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-[var(--on-primary)] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--surface)]">
                            <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                        </div>
                    )}
                </button>
            ))}
            </div>
        </div>

        {/* Theme Mode */}
        <div className="mb-8">
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Brightness</h3>
            <div className="bg-[var(--surface-container-high)] p-1.5 rounded-[20px] flex">
                {(['light', 'dark', 'auto'] as ThemeMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => onUpdateSettings({ ...settings, themeMode: mode })}
                        className={`flex-1 py-3 px-4 rounded-[16px] text-sm font-medium transition-all duration-300 ease-spring flex items-center justify-center gap-2 ${
                            settings.themeMode === mode 
                                ? 'bg-[var(--surface)] text-[var(--primary)] shadow-sm font-bold scale-[1.02]' 
                                : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {mode === 'light' ? 'light_mode' : mode === 'dark' ? 'dark_mode' : 'brightness_auto'}
                        </span>
                        <span className="capitalize">{mode}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Grayscale Mode */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-2xl mb-4">
            <div>
                <div className="font-medium text-on-surface">Grayscale Mode</div>
                <div className="text-xs text-on-surface-variant">Reduce distractions with black & white</div>
            </div>
            <Toggle checked={settings.grayscale} onChange={onTriggerGrayscaleConfirm} />
        </div>
      </div>
      
      {/* Sleep Schedule */}
      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
         <h2 className="text-lg font-semibold mb-6 text-on-surface">Wellness & Sleep</h2>
         
         <div className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-2xl mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                    <span className="material-symbols-outlined">bedtime</span>
                </div>
                <div>
                    <div className="font-medium text-on-surface">Sleep Mode</div>
                    <div className="text-xs text-on-surface-variant">Remind me to rest</div>
                </div>
            </div>
            <Toggle checked={settings.sleepEnabled} onChange={(v) => onUpdateSettings({ ...settings, sleepEnabled: v })} />
         </div>

         {settings.sleepEnabled && (
             <div className="grid grid-cols-2 gap-4 animate-slide-up">
                 <div className="bg-[var(--surface-container-low)] p-4 rounded-2xl border border-[var(--outline-variant)]/10">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Bedtime</label>
                     <input 
                        type="time" 
                        value={settings.sleepStartTime}
                        onChange={(e) => onUpdateSettings({ ...settings, sleepStartTime: e.target.value })}
                        className="bg-transparent text-2xl font-display font-bold text-on-surface focus:outline-none w-full"
                     />
                 </div>
                 <div className="bg-[var(--surface-container-low)] p-4 rounded-2xl border border-[var(--outline-variant)]/10">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">Wake Up</label>
                     <input 
                        type="time" 
                        value={settings.sleepEndTime}
                        onChange={(e) => onUpdateSettings({ ...settings, sleepEndTime: e.target.value })}
                        className="bg-transparent text-2xl font-display font-bold text-on-surface focus:outline-none w-full"
                     />
                 </div>
             </div>
         )}
      </div>
      
      {/* Notifications & Analytics */}
      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-on-surface">Preferences</h2>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--tertiary-container)] text-[var(--on-tertiary-container)] rounded-full">
                        <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div>
                        <div className="font-medium text-on-surface">Task Reminders</div>
                        <div className="text-xs text-on-surface-variant">Get notified for due dates</div>
                    </div>
                </div>
                <Toggle checked={settings.notificationsEnabled} onChange={handleNotificationToggle} />
            </div>

             <div className="flex items-center justify-between p-4 bg-[var(--surface-container-low)] rounded-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--surface-container-high)] text-on-surface rounded-full">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                        <div className="font-medium text-on-surface">Analytics</div>
                        <div className="text-xs text-on-surface-variant">Share anonymous usage stats</div>
                    </div>
                </div>
                <Toggle checked={settings.analyticsEnabled} onChange={(v) => onUpdateSettings({ ...settings, analyticsEnabled: v })} />
            </div>
        </div>
      </div>

       {/* Links & About */}
      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-on-surface">About</h2>
        <div className="space-y-2">
            <button onClick={() => onNavigate('privacy')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-container-high)] rounded-2xl transition-colors text-left">
                <span className="text-sm font-medium">Privacy Policy</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button onClick={() => onNavigate('terms')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-container-high)] rounded-2xl transition-colors text-left">
                <span className="text-sm font-medium">Terms of Use</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            <button onClick={() => onNavigate('about')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-container-high)] rounded-2xl transition-colors text-left">
                <span className="text-sm font-medium">About LanTask</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
                <a href="https://github.com/EldrexDelosReyesBula/LanTask" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-gray-900 text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                    <span className="text-lg font-mono">{'< />'}</span>
                    <span>Star on GitHub</span>
                </a>
                <a href="https://github.com/EldrexDelosReyesBula/LanTask/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-[var(--surface-container-high)] text-on-surface rounded-xl font-bold text-sm hover:bg-[var(--surface-container-highest)] transition-colors border border-[var(--outline-variant)]/20">
                    <span className="material-symbols-outlined text-lg">gavel</span>
                    <span>Apache 2.0</span>
                </a>
            </div>
            
            <a href="https://www.landecs.org/docs/donation" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-2xl transition-colors mt-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                    <span className="text-sm font-bold">Donate to Support</span>
                </div>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-on-surface">Data Management</h2>
        <div className="space-y-4">
           
           <div className="grid grid-cols-2 gap-4">
               {/* Export */}
               <div 
                    className="p-4 bg-[var(--surface-container-low)] rounded-2xl flex flex-col justify-between h-32 hover:bg-[var(--surface-container)] transition-colors cursor-pointer group border border-[var(--outline-variant)]/10" 
                    onClick={handleExportData}
                >
                  <span className="material-symbols-outlined text-[var(--primary)] text-3xl mb-auto group-hover:scale-110 transition-transform">download</span>
                  <div>
                    <div className="font-bold text-on-surface">Export Data</div>
                    <div className="text-xs text-on-surface-variant">Backup to JSON</div>
                  </div>
               </div>
               
               {/* Import */}
               <div className="p-4 bg-[var(--surface-container-low)] rounded-2xl flex flex-col justify-between h-32 hover:bg-[var(--surface-container)] transition-colors cursor-pointer group relative border border-[var(--outline-variant)]/10">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="material-symbols-outlined text-[var(--tertiary)] text-3xl mb-auto group-hover:scale-110 transition-transform">upload</span>
                  <div>
                    <div className="font-bold text-on-surface">Import Data</div>
                    <div className="text-xs text-on-surface-variant">Restore from backup</div>
                  </div>
               </div>
           </div>
          
          <div className="pt-4 border-t border-[var(--outline-variant)]/10">
            <button 
                onClick={onTriggerDangerZone}
                className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl group hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
                <div className="text-left">
                    <div className="font-bold text-red-700 dark:text-red-300">Reset Application</div>
                    <div className="text-xs text-red-600/80 dark:text-red-400/80">Clear all tasks and settings</div>
                </div>
                <span className="material-symbols-outlined text-red-600">delete_forever</span>
            </button>
          </div>
        </div>
      </div>
      
       {installPrompt && (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:right-10 md:w-auto z-40 animate-slide-up">
            <button onClick={onInstall} className="w-full md:w-auto flex items-center gap-3 px-6 py-4 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-2xl shadow-xl font-bold hover:scale-105 transition-transform">
                <span className="material-symbols-outlined">download</span>
                Install App
            </button>
        </div>
       )}

       <div className="text-center text-xs text-on-surface-variant mt-8 pb-8 opacity-60">
        LanTask V1.4.0 &bull;
      </div>
    </div>
  );
};
