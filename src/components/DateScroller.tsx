import React from 'react';
import { ExecutionDay } from '../types';
import { sound } from '../utils/audio';
import { Check, Flame } from 'lucide-react';

interface DateScrollerProps {
  days: ExecutionDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  streakCount: number;
}

export const DateScroller: React.FC<DateScrollerProps> = ({
  days,
  selectedDate,
  onSelectDate,
  streakCount,
}) => {
  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
      {/* Date Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          const isFullyDone = day.totalTasks > 0 && day.tasksCompleted === day.totalTasks;

          return (
            <button
              key={day.date}
              onClick={() => {
                sound.playClick();
                onSelectDate(day.date);
              }}
              className={`min-w-[48px] sm:min-w-[56px] py-2 px-2 rounded-xl flex flex-col items-center justify-center transition-all min-h-[44px] ${
                isSelected
                  ? 'bg-[#8296FF] text-[#0B1020] shadow-md shadow-[#8296FF]/20 font-semibold'
                  : 'bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)]/80 border border-[var(--border-subtle)]'
              }`}
            >
              <span className={`text-[11px] font-medium tracking-tight ${isSelected ? 'text-[#0B1020]' : 'text-[var(--text-secondary)]'}`}>
                {day.dayName}
              </span>
              <span className="text-sm font-bold tabular-nums leading-tight mt-0.5">
                {day.dayNumber}
              </span>

              {/* Status indicator dot or check */}
              <div className="mt-1 flex items-center justify-center h-3">
                {isFullyDone ? (
                  <Check className={`w-3 h-3 ${isSelected ? 'text-[#0B1020]' : 'text-[#35C99A]'}`} />
                ) : day.tasksCompleted > 0 ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-[#0B1020]' : 'bg-[#8296FF]'
                    }`}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-medium)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Daily Momentum Summary */}
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto shrink-0 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] w-full sm:w-auto justify-center sm:justify-start">
          <Flame className="w-4 h-4 text-[#F5B85C]" />
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">{streakCount} Days</span>
          <span className="text-[11px] text-[var(--text-secondary)]">Streak Velocity</span>
        </div>
      </div>
    </div>
  );
};
