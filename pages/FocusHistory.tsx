
import React from 'react';
import { FocusSession } from '../types';

interface FocusHistoryProps {
  sessions: FocusSession[];
  onReuse: (session: FocusSession) => void;
}

export const FocusHistory: React.FC<FocusHistoryProps> = ({ sessions, onReuse }) => {
  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s > 0 ? s + 's' : ''}`;
    return `${s}s`;
  };

  return (
    <div className="animate-slide-up pb-24 space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-on-surface">Focus History</h1>
          <div className="bg-[var(--surface-container-high)] px-3 py-1 rounded-full text-xs font-bold text-on-surface-variant">
              {sessions.length} Sessions
          </div>
      </div>

      <div className="grid gap-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div 
                key={session.id} 
                className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-2xl p-5 shadow-sm hover:bg-[var(--surface-container-low)] transition-colors flex items-center justify-between group"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.status === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    }`}>
                        <span className="material-symbols-outlined text-[20px]">
                            {session.status === 'completed' ? 'check' : 'stop_circle'}
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-on-surface text-base">
                            {session.intent || 'Untitled Session'}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                             <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {new Date(session.date).toLocaleDateString()}
                             </span>
                             <span>•</span>
                             <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {formatDuration(session.timeSpent)} {session.status === 'abandoned' && `of ${formatDuration(session.duration)}`}
                             </span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => onReuse(session)}
                    className="p-3 rounded-full hover:bg-[var(--surface-container-high)] text-on-surface-variant hover:text-[var(--primary)] transition-all active:scale-95"
                    title="Reuse this session settings"
                >
                    <span className="material-symbols-outlined">replay</span>
                </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-[var(--surface-container-low)] rounded-[32px] border-2 border-dashed border-[var(--outline-variant)]/50">
            <span className="material-symbols-outlined text-6xl text-[var(--outline-variant)] mb-4">history_edu</span>
            <p className="text-lg font-medium text-on-surface-variant">No sessions recorded yet.</p>
            <p className="text-sm text-on-surface-variant/70 mt-2">Complete a focus session to see it here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
