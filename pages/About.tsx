
import React from 'react';
import { Page } from '../types';

interface AboutProps {
  onNavigate: (page: Page) => void;
}

export const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="animate-slide-up pb-24 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-full hover:bg-[var(--surface-container-high)] text-on-surface-variant transition-colors"
        >
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-display font-bold text-on-surface">About LanTask</h1>
      </div>

      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-[32px] p-8 text-center shadow-sm">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="material-symbols-outlined text-4xl">task</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-2">LanTask V1</h2>
            <p className="opacity-80 font-medium">Productivity, Reimagined.</p>
        </div>

        {/* Mission */}
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-on-surface mb-4">Our Mission</h3>
            <p className="text-on-surface-variant leading-relaxed">
                LanTask helps you achieve flow. We believe productivity tools should be fast, beautiful, and respect your privacy. By combining task management with deep work tools like our Focus Timer and detailed analytics, we empower you to get more done with less stress.
            </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6">
                <span className="material-symbols-outlined text-[var(--primary)] text-3xl mb-4">wifi_off</span>
                <h4 className="font-bold text-on-surface mb-2">Offline First</h4>
                <p className="text-sm text-on-surface-variant">Works completely offline. Your data lives on your device and loads instantly.</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-6">
                <span className="material-symbols-outlined text-[var(--tertiary)] text-3xl mb-4">palette</span>
                <h4 className="font-bold text-on-surface mb-2">Theming Engine</h4>
                <p className="text-sm text-on-surface-variant">Beautifully crafted themes that adapt to light and dark modes effortlessly.</p>
            </div>
        </div>

        {/* Credits & Legal */}
        <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-8 shadow-sm text-center">
            <p className="text-sm text-on-surface-variant mb-6">
                Designed & Developed with ❤️ by the LanDecs Team.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-[var(--primary)]">
                <button onClick={() => onNavigate('privacy')} className="hover:underline">Privacy Policy</button>
                <span>•</span>
                <button onClick={() => onNavigate('terms')} className="hover:underline">Terms of Use</button>
                <span>•</span>
                <a href="https://www.landecs.org/docs/donation" target="_blank" rel="noopener noreferrer" className="hover:underline">Support Us</a>
            </div>
            <p className="text-xs text-on-surface-variant/50 mt-8">
                © 2026 LanDecs LanTask. All rights reserved.
            </p>
        </div>
      </div>
    </div>
  );
};
