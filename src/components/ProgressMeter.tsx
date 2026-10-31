import React from 'react';

interface ProgressMeterProps {
  label?: string;
  sublabel?: string;
  completed: number;
  total: number;
  percentage?: number;
  showNumbers?: boolean;
}

export const ProgressMeter: React.FC<ProgressMeterProps> = ({
  label,
  sublabel,
  completed,
  total,
  percentage,
  showNumbers = true,
}) => {
  const calculatedPercent = percentage !== undefined 
    ? Math.min(100, Math.max(0, percentage))
    : total > 0 
      ? Math.round((completed / total) * 100) 
      : 0;

  return (
    <div className="w-full space-y-1.5">
      {(label || showNumbers) && (
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            {label && <span className="text-[var(--text-primary)]">{label}</span>}
            {sublabel && <span className="text-[11px] text-[var(--text-secondary)]">{sublabel}</span>}
          </div>
          {showNumbers && (
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-mono text-[11px] tabular-nums">
              <span className="text-[var(--text-primary)] font-semibold">{calculatedPercent}%</span>
              <span>({completed}/{total})</span>
            </div>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div className="h-1.5 w-full bg-[var(--inset-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${calculatedPercent}%`,
            background: 'linear-gradient(90deg, #8296FF 0%, #35C99A 100%)',
          }}
        />
      </div>
    </div>
  );
};
