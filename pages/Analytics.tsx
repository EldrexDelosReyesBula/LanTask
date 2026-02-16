
import React from 'react';
import { Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface AnalyticsProps {
  tasks: Task[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.completed);
  const total = tasks.length;
  const completionRate = total === 0 ? 0 : Math.round((completedTasks.length / total) * 100);

  // Calculate Streak
  const calculateStreak = () => {
    const dates = Array.from(new Set(
      completedTasks
        .filter(t => t.completedAt)
        .map(t => new Date(t.completedAt!).toDateString())
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

    if (dates.length > 0) {
      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1;
        let currentDate = new Date(dates[0]);
        
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i]);
          const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Weekly Trend Data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toDateString());
    }
    return days;
  };

  const last7Days = getLast7Days();
  const trendData = last7Days.map(dateStr => {
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    const count = completedTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === dateStr).length;
    return { name: dayName, value: count };
  });

  // Category Data
  const categories = ['work', 'personal', 'health', 'learning', 'other'];
  const categoryData = categories.map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: tasks.filter(t => t.category === cat).length
  }));

  // Theme-aware colors
  const COLORS = ['var(--primary)', 'var(--tertiary)', '#eab308', '#f97316', '#8b5cf6'];

  return (
    <div className="animate-slide-up pb-24 space-y-8">
      <h1 className="text-2xl font-display font-bold text-on-surface">Productivity Insights</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completion */}
        <div className="bg-[var(--surface-container)] rounded-3xl p-6 shadow-sm col-span-2 md:col-span-1 border border-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Completion</span>
          </div>
          <div className="text-4xl font-bold text-on-surface">{completionRate}%</div>
          <div className="w-full bg-[var(--surface-container-high)] h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-[var(--surface-container)] rounded-3xl p-6 shadow-sm border border-transparent">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-500/10 text-orange-500">
                <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Streak</span>
          </div>
          <div className="text-4xl font-bold text-on-surface">{streak} <span className="text-base font-normal text-on-surface-variant">days</span></div>
        </div>

        {/* Total Done */}
        <div className="bg-[var(--surface-container)] rounded-3xl p-6 shadow-sm border border-transparent">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Total Done</span>
          </div>
          <div className="text-4xl font-bold text-on-surface">{completedTasks.length}</div>
        </div>

        {/* Top Area */}
        <div className="bg-[var(--surface-container)] rounded-3xl p-6 shadow-sm col-span-2 md:col-span-1 border border-transparent">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[var(--tertiary)]/10 text-[var(--tertiary)]">
                <span className="material-symbols-outlined text-[20px]">category</span>
            </div>
            <span className="text-sm font-medium text-on-surface-variant">Top Area</span>
          </div>
          <div className="text-3xl font-bold text-on-surface capitalize truncate">
             {categoryData.sort((a,b) => b.value - a.value)[0]?.value > 0 ? categoryData[0].name : 'N/A'}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-on-surface">Last 7 Days Activity</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-container-high)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'var(--on-surface)' }}
                  itemStyle={{ color: 'var(--on-surface)' }}
                  cursor={{stroke: 'var(--primary)', strokeWidth: 2}}
                />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{r: 4, fill: 'var(--primary)'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Chart */}
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-on-surface">Tasks by Category</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'var(--surface-container-high)'}}
                  contentStyle={{ backgroundColor: 'var(--surface-container-high)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: 'var(--on-surface)' }}
                  itemStyle={{ color: 'var(--on-surface)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
