import React from 'react';
import { ShieldCheck, X, Lock, Database, EyeOff, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#35C99A]/20 text-[#35C99A] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Privacy Policy</h3>
              <p className="text-xs text-[var(--text-secondary)]">Clear, honest explanation of what we collect and store</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 text-xs text-[var(--text-secondary)] leading-relaxed scrollbar-thin">
          <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
              <Database className="w-4 h-4 text-[#8296FF]" />
              <span>1. What We Collect</span>
            </div>
            <p>
              We only collect data that is strictly necessary for your productivity tracking:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>Account Info:</strong> Your name and verified Gmail ID for authentication.</li>
              <li><strong>Task &amp; Goal Data:</strong> Titles, durations, notes, and completion states of your tasks.</li>
              <li><strong>Focus Sessions:</strong> Timer durations logged during your deep work sessions.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
              <Lock className="w-4 h-4 text-[#35C99A]" />
              <span>2. Local Storage &amp; Offline Offline Mode</span>
            </div>
            <p>
              Your tasks and timer records are kept directly on your phone or computer using local browser storage and service worker caching. You retain 100% control over your data and can export it as CSV anytime.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
              <EyeOff className="w-4 h-4 text-[#A78BFA]" />
              <span>3. Analytics &amp; Third-Party Services</span>
            </div>
            <p>
              We do not sell, rent, or trade your personal data. Google Analytics 4 is strictly optional and only activates if you give your consent on the cookie banner. AI prompts sent to Gemini are processed securely without retaining personal training records.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Last updated: October 2026</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#35C99A] text-[#0B1020] font-semibold text-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
