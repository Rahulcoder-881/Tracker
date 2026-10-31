import React, { useState } from 'react';
import { Sparkles, RefreshCw, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { AIInsight } from '../types';
import { sound } from '../utils/audio';

interface AiInsightBannerProps {
  insight: AIInsight;
  onRefresh: () => Promise<void>;
  onApplyTacticalAction?: () => void;
}

export const AiInsightBanner: React.FC<AiInsightBannerProps> = ({
  insight,
  onRefresh,
  onApplyTacticalAction,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    sound.playClick();
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-4 sm:p-5 overflow-hidden transition-all ai-glow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left icon with soft ambient glow & content */}
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center shrink-0 text-[#A78BFA] shadow-[0_0_16px_rgba(167,139,250,0.25)] mt-0.5">
            <Sparkles className="w-5 h-5 text-[#A78BFA]" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A78BFA]">
                Cognitive Strategic Insight
              </span>
              <span className="text-xs text-[var(--text-secondary)]">·</span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#35C99A] tabular-nums font-semibold">
                <Zap className="w-3 h-3 fill-[#35C99A]" />
                <span>{insight.velocityIndex}% Velocity</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] tracking-tight leading-snug">
              {insight.headline}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {insight.suggestion}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all font-medium disabled:opacity-50"
            title="Recalibrate cognitive insight via Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A78BFA]' : ''}`} />
            <span className="hidden xs:inline">Recalibrate</span>
          </button>

          {onApplyTacticalAction && (
            <button
              onClick={() => {
                sound.playClick();
                onApplyTacticalAction();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 border border-[#A78BFA]/40 text-xs text-[#cebdff] font-medium transition-all"
            >
              <span>Execute Sprint</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
