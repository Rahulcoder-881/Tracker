import React from 'react';
import { CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  title = 'Action Completed Successfully',
  message = 'Your information has been verified and saved. You can now continue with your focused session.'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-sm rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-6 text-center space-y-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#35C99A]/15 text-[#35C99A] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">{title}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-bold transition-all shadow-md shadow-[#8296FF]/20 flex items-center justify-center gap-1.5"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
