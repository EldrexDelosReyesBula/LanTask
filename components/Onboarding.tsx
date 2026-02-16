
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsOfUse } from '../pages/TermsOfUse';

interface OnboardingProps {
    settings: UserSettings;
    onUpdateSettings: (s: UserSettings) => void;
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ settings, onUpdateSettings, onComplete }) => {
    const [step, setStep] = useState(0);
    const [subPage, setSubPage] = useState<'none' | 'terms' | 'privacy'>('none');

    const nextStep = () => setStep(s => s + 1);

    // If Viewing a Sub-Page (Terms or Privacy)
    if (subPage === 'privacy') {
        return (
            <div className="fixed inset-0 z-[60] bg-[var(--surface)] overflow-y-auto">
                <PrivacyPolicy onBack={() => setSubPage('none')} />
            </div>
        );
    }

    if (subPage === 'terms') {
        return (
            <div className="fixed inset-0 z-[60] bg-[var(--surface)] overflow-y-auto">
                <TermsOfUse onBack={() => setSubPage('none')} />
            </div>
        );
    }

    const renderWelcome = () => (
        <div className="text-center space-y-6 animate-enter">
            <div className="w-24 h-24 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[var(--primary)]/20">
                <span className="material-symbols-outlined text-5xl">check_circle</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-[var(--primary)]">Welcome to LanTask</h1>
            <p className="text-lg text-on-surface-variant max-w-xs mx-auto">Your modern, offline-first productivity companion.</p>
            <button onClick={nextStep} className="mt-8 px-8 py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-md">
                Get Started
            </button>
        </div>
    );

    const renderName = () => (
        <div className="text-center space-y-6 animate-enter">
             <h2 className="text-2xl font-display font-bold text-on-surface">What should we call you?</h2>
             <input 
                type="text" 
                value={settings.name}
                onChange={(e) => onUpdateSettings({...settings, name: e.target.value})}
                placeholder="Enter your name"
                className="w-full max-w-xs text-center text-3xl font-bold border-b-2 border-[var(--primary)] bg-transparent focus:outline-none py-2 text-on-surface"
                autoFocus
             />
             <div className="pt-8">
                <button onClick={nextStep} disabled={!settings.name.trim()} className="px-8 py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-bold disabled:opacity-50 hover:shadow-lg transition-all">
                    Next
                </button>
             </div>
        </div>
    );

    const renderPrivacy = () => (
        <div className="text-center space-y-6 animate-enter max-w-sm mx-auto">
            <div className="w-16 h-16 bg-[var(--surface-container-high)] text-on-surface rounded-[24px] flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl">shield</span>
            </div>
            
            <h2 className="text-2xl font-display font-bold text-on-surface">Privacy & Analytics</h2>
            <p className="text-sm text-on-surface-variant">We believe in privacy. Your tasks stay on your device.</p>
            
            {/* Dark Card Style Matching Screenshot */}
            <div className="bg-[var(--surface-container-high)] p-5 rounded-2xl text-left flex items-center justify-between mt-4 border border-[var(--outline-variant)]/20">
                <div>
                    <div className="font-bold text-sm text-on-surface">Anonymous Analytics</div>
                    <div className="text-xs text-on-surface-variant opacity-80">Help us improve LanTask</div>
                </div>
                 <button 
                    onClick={() => onUpdateSettings({...settings, analyticsEnabled: !settings.analyticsEnabled})}
                    className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${settings.analyticsEnabled ? 'bg-[var(--primary)]' : 'bg-gray-400/50'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${settings.analyticsEnabled ? 'left-6' : 'left-1'}`} />
                </button>
            </div>
            
            {/* Links */}
            <div className="text-xs text-on-surface-variant/70 mt-4 leading-relaxed">
                By continuing, you agree to our 
                <button onClick={() => setSubPage('terms')} className="underline text-[var(--primary)] font-semibold mx-1 hover:text-[var(--on-surface)] transition-colors">Terms</button> 
                and 
                <button onClick={() => setSubPage('privacy')} className="underline text-[var(--primary)] font-semibold mx-1 hover:text-[var(--on-surface)] transition-colors">Privacy Policy</button>.
            </div>

            <button onClick={nextStep} className="mt-6 px-10 py-3 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">
                Agree & Continue
            </button>
        </div>
    );

    const renderDone = () => (
        <div className="text-center space-y-6 animate-enter">
            <div className="w-24 h-24 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pop">
                <span className="material-symbols-outlined text-5xl">celebration</span>
            </div>
            <h2 className="text-3xl font-display font-bold text-on-surface">You're All Set!</h2>
            <p className="text-on-surface-variant">Time to get productive.</p>
            <button onClick={() => { onUpdateSettings({...settings, hasCompletedOnboarding: true}); onComplete(); }} className="mt-8 px-10 py-4 bg-[var(--primary)] text-[var(--on-primary)] rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
                Go to Dashboard
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-[var(--surface)] flex items-center justify-center p-6 animate-enter">
            {step === 0 && renderWelcome()}
            {step === 1 && renderName()}
            {step === 2 && renderPrivacy()}
            {step === 3 && renderDone()}
        </div>
    );
};
