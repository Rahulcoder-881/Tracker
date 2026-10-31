import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import { sound } from '../utils/audio';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('tg_cookie_consent');
    if (!consent) {
      // Show after a brief delay
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    sound.playClick();
    localStorage.setItem('tg_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    sound.playClick();
    localStorage.setItem('tg_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#8296FF]/15 text-[#8296FF] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-[var(--text-primary)]">
            Privacy &amp; Cookie Consent
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            We use minimal cookies for local workspace sessions and privacy-friendly analytics. Do you accept?
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 rounded-lg bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-bold transition-all shadow-xs"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-medium transition-all"
            >
              Essential Only
            </button>
          </div>
        </div>
        <button
          onClick={handleDecline}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
