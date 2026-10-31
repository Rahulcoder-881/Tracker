import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  Zap, 
  Flame, 
  PieChart, 
  Layers, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Task, ExecutionDay, AIInsight, DomainType } from '../types';
import { sound } from '../utils/audio';

interface StrategicAuditProps {
  tasks: Task[];
  days: ExecutionDay[];
  aiInsight: AIInsight;
  onRefreshAIInsight: () => Promise<void>;
  streakCount: number;
}

export const StrategicAudit: React.FC<StrategicAuditProps> = ({
  tasks,
  days,
  aiInsight,
  onRefreshAIInsight,
  streakCount,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute domain hours breakdown
  const domainTimeMap: Record<string, number> = {};
  tasks.forEach((t) => {
    domainTimeMap[t.domain] = (domainTimeMap[t.domain] || 0) + (t.spentMinutes || 0);
  });
  const totalTrackedMinutes = Object.values(domainTimeMap).reduce((a, b) => a + b, 0);

  // Completed vs total across all tasks
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const overallCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCopyReport = () => {
    sound.playClick();
    const markdown = `# Tracker Growth Platform - Strategic Executive Audit
Date: ${new Date().toLocaleDateString()}
Current Momentum Streak: ${streakCount} Days
Velocity Index: ${aiInsight.velocityIndex}%

## Strategic Insight
Headline: ${aiInsight.headline}
Recommendation: ${aiInsight.suggestion}

## Weekly Execution Metrics
- Completed Checkpoints: ${completedTasks} / ${totalTasks} (${overallCompletionRate}%)
- Total Deep Work Minutes: ${totalTrackedMinutes} min (${(totalTrackedMinutes / 60).toFixed(1)} hrs)

## Domain Allocation
${Object.entries(domainTimeMap)
  .map(([dom, mins]) => `- ${dom}: ${mins} min (${totalTrackedMinutes > 0 ? Math.round((mins / totalTrackedMinutes) * 100) : 0}%)`)
  .join('\n')}
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAuditRefresh = async () => {
    sound.playClick();
    setIsRefreshing(true);
    try {
      await onRefreshAIInsight();
    } finally {
      setIsRefreshing(false);
    }
  };

  const domainColors: Record<string, string> = {
    Engineering: '#8296FF',
    Research: '#A78BFA',
    'Deep Work': '#35C99A',
    Health: '#F5B85C',
    Academic: '#bac3ff',
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A78BFA]">
            <Activity className="w-4 h-4" />
            <span>Strategic Audit & Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
            Systemic Execution Retrospective
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Macro velocity trends, cognitive load equilibrium, and bottleneck mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card-surface)] hover:bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#35C99A]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Markdown' : 'Copy Audit'}</span>
          </button>

          <button
            onClick={handleAuditRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Run Gemini Calibration</span>
          </button>
        </div>
      </div>

      {/* AI Intelligence Assessment Panel */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#172338] via-[#1a1f30] to-[#111A2C] border border-[rgba(167,139,250,0.3)] shadow-lg relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A78BFA] block">
                Cognitive State Architecture
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                Synthesized by Tracker Growth Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs font-mono text-[#35C99A] tabular-nums font-semibold">
            <Zap className="w-3 h-3 fill-current" />
            <span>{aiInsight.velocityIndex}% Velocity</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            "{aiInsight.headline}"
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-4xl">
            {aiInsight.suggestion}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#35C99A]" />
            <span className="text-[var(--text-secondary)]">Fatigue Index:</span>
            <span className="font-semibold text-[var(--text-primary)]">Nominal (18%)</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F5B85C]" />
            <span className="text-[var(--text-secondary)]">Momentum Consistency:</span>
            <span className="font-semibold text-[var(--text-primary)]">{streakCount} Active Days</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#8296FF]" />
            <span className="text-[var(--text-secondary)]">Cognitive Bandwidth:</span>
            <span className="font-semibold text-[var(--text-primary)]">Unconstrained</span>
          </div>
        </div>
      </div>

      {/* Domain Allocation & Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Bars */}
        <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8296FF]" />
              <span>Cognitive Domain Distribution</span>
            </h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono tabular-nums">
              {(totalTrackedMinutes / 60).toFixed(1)} Total Hours
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(domainColors).map(([dom, color]) => {
              const mins = domainTimeMap[dom] || 0;
              const pct = totalTrackedMinutes > 0 ? Math.round((mins / totalTrackedMinutes) * 100) : 0;
              return (
                <div key={dom} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span>{dom}</span>
                    </span>
                    <span className="font-mono text-[var(--text-secondary)] tabular-nums">
                      {mins}m ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--inset-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Velocity Heatmap / Bar View */}
        <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#35C99A]" />
              <span>7-Day Execution Pacing</span>
            </h3>
            <span className="text-xs text-[var(--text-secondary)]">Velocity Stability</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-44 pt-6 pb-2">
            {days.map((day) => {
              const maxMinutes = 300;
              const heightPercent = Math.min(100, Math.round((day.focusMinutes / maxMinutes) * 100));
              const isToday = day.date === '2026-10-30';

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity mb-1 tabular-nums">
                    {day.focusMinutes}m
                  </span>
                  <div className="w-full max-w-[32px] bg-[var(--inset-surface)] rounded-t-lg overflow-hidden flex flex-col justify-end border border-[var(--border-subtle)] h-28">
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        height: `${heightPercent}%`,
                        background: isToday
                          ? 'linear-gradient(180deg, #8296FF 0%, #35C99A 100%)'
                          : 'rgba(130, 150, 255, 0.45)',
                      }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium mt-2 ${isToday ? 'text-[#8296FF] font-bold' : 'text-[var(--text-secondary)]'}`}>
                    {day.dayName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] tabular-nums">
                    {day.tasksCompleted}/{day.totalTasks}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
