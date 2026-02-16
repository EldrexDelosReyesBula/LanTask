
import React from 'react';
import { Page } from '../types';

interface TermsOfUseProps {
  onNavigate?: (page: Page) => void;
  onBack?: () => void;
}

export const TermsOfUse: React.FC<TermsOfUseProps> = ({ onNavigate, onBack }) => {
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
        <h1 className="text-2xl font-display font-bold text-on-surface">Terms of Use</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--outline-variant)]/20 rounded-3xl p-8 shadow-sm space-y-8 text-on-surface">
        <section>
            <h2 className="text-xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-on-surface-variant leading-relaxed">
                By accessing and using LanTask ("the Application"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this Application.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">2. Use License</h2>
            <p className="text-on-surface-variant leading-relaxed">
                Permission is granted to use LanTask for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
            </p>
            <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-2">
                <li>Modify or copy the materials for commercial purposes.</li>
                <li>Attempt to decompile or reverse engineer any software contained in the LanTask application.</li>
                <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">3. User Data & Responsibility</h2>
            <p className="text-on-surface-variant leading-relaxed">
                LanTask operates as an offline-first application. You acknowledge that:
            </p>
            <ul className="list-disc list-inside mt-2 text-on-surface-variant space-y-2">
                <li>You are solely responsible for backing up your data using the provided "Export Data" feature.</li>
                <li>We are not responsible for data loss due to browser cache clearing, device failure, or software errors.</li>
                <li>You must not use the application to store illegal or harmful content.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">4. Disclaimer</h2>
            <p className="text-on-surface-variant leading-relaxed">
                The materials on LanTask are provided on an 'as is' basis. LanTask makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">5. Limitations</h2>
            <p className="text-on-surface-variant leading-relaxed">
                In no event shall LanTask or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LanTask, even if LanTask or a LanTask authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-bold mb-4">6. Governing Law</h2>
            <p className="text-on-surface-variant leading-relaxed">
                Any claim relating to LanTask shall be governed by the laws of the jurisdiction in which the developer resides without regard to its conflict of law provisions.
            </p>
        </section>

        <div className="pt-8 border-t border-[var(--outline-variant)]/20 text-sm text-on-surface-variant">
            Last updated: February 16, 2026
        </div>
      </div>
    </div>
  );
};
