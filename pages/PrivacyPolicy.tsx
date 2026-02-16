
import React from 'react';
import { Page } from '../types';

interface PrivacyPolicyProps {
  onNavigate?: (page: Page) => void;
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate, onBack }) => {
  
  const handleBack = () => {
      if (onBack) onBack();
      else if (onNavigate) onNavigate('settings');
  };

  return (
    <div className="animate-slide-up pb-24 max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-[var(--surface-container-high)] text-on-surface-variant transition-colors"
        >
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-2xl font-display font-bold text-on-surface">Privacy Policy</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-8 shadow-sm space-y-8 text-on-surface">
        <section>
            <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
            <p className="text-on-surface-variant leading-relaxed">
                LanTask is designed with a "Local-First" philosophy. We believe your productivity data is yours alone. This Privacy Policy outlines how LanTask handles your information. By using LanTask, you agree to the collection and use of information in accordance with this policy.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">2. Data Storage</h2>
            <p className="text-on-surface-variant leading-relaxed">
                <strong>Local Storage:</strong> All tasks, settings, focus sessions, and history created within LanTask are stored exclusively on your device using your browser's Local Storage and IndexedDB technologies.
            </p>
            <p className="text-on-surface-variant leading-relaxed mt-4">
                <strong>No Cloud Sync:</strong> LanTask does not transmit your personal task data to any external server or cloud database. If you clear your browser cache or local storage, your data will be lost unless you have manually exported a backup.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">3. Analytics</h2>
            <p className="text-on-surface-variant leading-relaxed">
                We use Vercel Analytics to collect anonymous usage data to help us improve the application performance and user experience.
            </p>
            <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-2">
                <li>This data is aggregated and does not identify individual users.</li>
                <li>You can opt-out of analytics at any time via the Settings menu.</li>
                <li>We do not track the content of your tasks or notes.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">4. Permissions</h2>
            <p className="text-on-surface-variant leading-relaxed">
                LanTask may request the following permissions:
            </p>
            <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-2">
                <li><strong>Notifications:</strong> To send you reminders for task due dates and focus timer completion.</li>
                <li><strong>Storage:</strong> To save your preferences and data persistently on your device.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">5. Security</h2>
            <p className="text-on-surface-variant leading-relaxed">
                Since your data stays on your device, the security of your data largely depends on the security of your device. We recommend using a device password or biometric lock to prevent unauthorized access to your browser data.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">6. Changes to This Policy</h2>
            <p className="text-on-surface-variant leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
        </section>

        <div className="pt-8 border-t border-[var(--outline-variant)]/20 text-sm text-on-surface-variant">
            Last updated: February 16, 2026
        </div>
      </div>
    </div>
  );
};
