import React from 'react';
import { AlertCircle, Home, ArrowRight, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface NotFoundViewProps {
  onGoHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onGoHome }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[60vh]">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-[#F47783]/15 text-[#F47783] mx-auto flex items-center justify-center font-mono font-bold text-2xl">
          404
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Page Not Found</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            The page or feature you were looking for doesn&apos;t exist or has moved. Return to your daily tasks below.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="w-full py-3 px-4 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-bold transition-all shadow-md shadow-[#8296FF]/20 flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Back to Daily Tasks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
