import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'What is Tracker Growth?',
      a: 'Tracker Growth is a simple and fast productivity tool designed to help you organize daily tasks, run deep work focus timers, and track personal milestones without clutter.'
    },
    {
      q: 'How do I download and use the app on my Android phone?',
      a: 'You can tap the "Android App / APK" button in the top menu. From there you can either install it directly into your phone home screen with 1 tap, or download the tracker-growth.apk file to use offline.'
    },
    {
      q: 'Which Gemini AI versions can I choose from?',
      a: 'You have full flexibility: choose Gemini 3.8 Flash for fast, smart reasoning and Google Search citations, Gemini 3.1 Flash Lite for instant task breakdown, or Gemini 4 Argon for complex planning.'
    },
    {
      q: 'Can I use this app completely offline?',
      a: 'Yes. All tasks, timer sessions, and goal milestones are stored locally in your browser and on your phone, so you can plan and focus even without an internet connection.'
    },
    {
      q: 'How do I create an account or sign in?',
      a: 'You can sign in with your verified Gmail address (@gmail.com) and a secure password, or tap "Continue with Google" for instant one-click login.'
    },
    {
      q: 'Can I export my task history and goal progress?',
      a: 'Yes! Go to Settings and tap "Export Tasks & Goals as CSV" to download your complete history for Excel, Google Sheets, or backup.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8296FF]/20 text-[#8296FF] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Frequently Asked Questions</h3>
              <p className="text-xs text-[var(--text-secondary)]">Simple answers to common questions</p>
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

        <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {faqs.map((faq, idx) => {
            const isOpenItem = openIdx === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--inset-surface)] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setOpenIdx(isOpenItem ? null : idx);
                  }}
                  className="w-full p-3.5 text-left flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] hover:text-[#8296FF]"
                >
                  <span>{faq.q}</span>
                  {isOpenItem ? <ChevronUp className="w-4 h-4 text-[#8296FF]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                </button>
                {isOpenItem && (
                  <div className="px-3.5 pb-3.5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>Need more help?</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] font-semibold text-xs"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
