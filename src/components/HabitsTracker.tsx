import React, { useState } from 'react';
import { 
  Flame, 
  Check, 
  Plus, 
  Sparkles, 
  Activity, 
  BookOpen, 
  CheckSquare, 
  Zap, 
  Trash2, 
  Edit3, 
  X, 
  Clock, 
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Habit, DomainType } from '../types';
import { sound } from '../utils/audio';

interface HabitsTrackerProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, date: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit: (habitId: string) => void;
  selectedDate: string; // YYYY-MM-DD
  selectedDomain: DomainType | 'All';
}

const DOMAIN_COLORS: Record<DomainType, { bg: string; text: string; border: string }> = {
  Engineering: { bg: 'bg-[#8296FF]/15', text: 'text-[#8296FF]', border: 'border-[#8296FF]/30' },
  'Deep Work': { bg: 'bg-[#A78BFA]/15', text: 'text-[#A78BFA]', border: 'border-[#A78BFA]/30' },
  Academic: { bg: 'bg-[#35C99A]/15', text: 'text-[#35C99A]', border: 'border-[#35C99A]/30' },
  Research: { bg: 'bg-[#F5B85C]/15', text: 'text-[#F5B85C]', border: 'border-[#F5B85C]/30' },
  Health: { bg: 'bg-[#F47783]/15', text: 'text-[#F47783]', border: 'border-[#F47783]/30' },
};

// Calculate last 7 dates ending at targetDate
function getLast7Days(targetDateStr: string) {
  const dates: { dateStr: string; dayLetter: string; isToday: boolean }[] = [];
  const target = new Date(targetDateStr + 'T00:00:00');
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(target);
    d.setDate(target.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    dates.push({
      dateStr,
      dayLetter,
      isToday: i === 0,
    });
  }
  return dates;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  selectedDate,
  selectedDomain,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // New Habit Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState<DomainType>('Health');
  const [newMinutes, setNewMinutes] = useState<number>(30);

  // Filter habits by domain if selected
  const filteredHabits = habits.filter((h) => 
    selectedDomain === 'All' ? true : h.domain === selectedDomain
  );

  const completedTodayCount = filteredHabits.filter((h) => 
    h.completedDates.includes(selectedDate)
  ).length;

  const totalCount = filteredHabits.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;
  const last7Days = getLast7Days(selectedDate);

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    sound.playCompletionChime();
    onAddHabit({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      domain: newDomain,
      frequency: 'daily',
      targetMinutes: Number(newMinutes) || 20,
      icon: newDomain === 'Health' ? 'Activity' : newDomain === 'Academic' ? 'BookOpen' : 'CheckSquare',
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  const handleApplyPreset = (title: string, domain: DomainType, minutes: number, desc: string) => {
    sound.playClick();
    setNewTitle(title);
    setNewDomain(domain);
    setNewMinutes(minutes);
    setNewDesc(desc);
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-surface)] p-4 sm:p-5 shadow-xs transition-all space-y-4">
      {/* Top Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#F5B85C] flex items-center justify-center shadow-xs">
            <Flame className="w-4 h-4 fill-[#F5B85C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                Daily Habits
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#35C99A]/15 text-[#35C99A] border border-[#35C99A]/30">
                {completedTodayCount}/{totalCount} Done
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Daily recurring routines &amp; streak tracking
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)] transition-colors"
            title={isExpanded ? 'Collapse Habits' : 'Expand Habits'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar across today's habits */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">
            Check-in Progress ({selectedDate})
          </span>
          <span className="text-[11px] font-bold font-mono text-[var(--text-primary)]">
            {percentCompleted}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--inset-surface)] overflow-hidden border border-[var(--border-subtle)]">
          <div 
            className="h-full bg-gradient-to-r from-[#8296FF] to-[#35C99A] transition-all duration-500 rounded-full"
            style={{ width: `${percentCompleted}%` }}
          />
        </div>
      </div>

      {/* Habits List Grid */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1">
          {filteredHabits.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--inset-surface)] text-xs text-[var(--text-secondary)]">
              <p>No habits recorded for this category yet.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 text-[#8296FF] hover:underline font-bold"
              >
                + Add your first habit
              </button>
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const isCheckedToday = habit.completedDates.includes(selectedDate);
              const domainStyle = DOMAIN_COLORS[habit.domain] || DOMAIN_COLORS.Engineering;

              return (
                <div
                  key={habit.id}
                  className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCheckedToday
                      ? 'bg-[var(--card-surface)] border-[#35C99A]/40 shadow-xs'
                      : 'bg-[var(--inset-surface)]/70 hover:bg-[var(--card-surface)] border-[var(--border-subtle)]'
                  }`}
                >
                  {/* Left: Check-in button & Title */}
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    {/* Big Check-in Circle */}
                    <button
                      onClick={() => {
                        onToggleHabit(habit.id, selectedDate);
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 focus:outline-none ${
                        isCheckedToday
                          ? 'bg-[#35C99A] text-[#0B1020] shadow-sm shadow-[#35C99A]/30 scale-105'
                          : 'bg-[var(--card-surface)] hover:bg-[#35C99A]/20 text-transparent hover:text-[#35C99A] border-2 border-[var(--border-medium)] hover:border-[#35C99A]'
                      }`}
                      title={isCheckedToday ? 'Click to uncheck' : 'Click to complete today'}
                    >
                      <Check className={`w-4 h-4 stroke-[3] ${isCheckedToday ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />
                    </button>

                    {/* Title, Category & Description */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold ${
                          isCheckedToday ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {habit.title}
                        </span>
                        
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${domainStyle.bg} ${domainStyle.text} ${domainStyle.border}`}>
                          {habit.domain}
                        </span>

                        {habit.targetMinutes && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--text-secondary)]">
                            <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                            <span>{habit.targetMinutes}m</span>
                          </span>
                        )}
                      </div>

                      {habit.description && (
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Streak Badge & 7-Day Mini Heatmap */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                    {/* Mini 7-Day Dot Matrix */}
                    <div className="flex items-center gap-1 bg-[var(--card-surface)] px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg border border-[var(--border-subtle)]">
                      {last7Days.map((day, idx) => {
                        const isDone = habit.completedDates.includes(day.dateStr);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-0.5 sm:gap-1">
                            <span className="text-[8px] sm:text-[9px] font-mono text-[var(--text-secondary)]">
                              {day.dayLetter}
                            </span>
                            <div 
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                                isDone
                                  ? 'bg-[#35C99A] ring-2 ring-[#35C99A]/20 scale-105'
                                  : day.isToday
                                  ? 'border-2 border-dashed border-[#8296FF] bg-transparent'
                                  : 'bg-[var(--border-medium)]'
                              }`}
                              title={`${day.dateStr}: ${isDone ? 'Completed' : 'Not completed'}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Streak Count Indicator */}
                    <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#F5B85C]">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#F5B85C] animate-pulse" />
                      <div className="text-left">
                        <span className="text-xs font-bold font-mono leading-none">
                          {habit.streak}d
                        </span>
                        <span className="block text-[8px] text-[#F5B85C]/80 font-medium uppercase leading-none">
                          Streak
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (confirm(`Remove habit "${habit.title}"?`)) {
                          onDeleteHabit(habit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div 
            className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#8296FF]/15 text-[#8296FF] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                    Create New Daily Habit
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Track recurring daily routines &amp; streak momentum
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsAddModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Quick Presets:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { title: 'Morning Exercise', domain: 'Health' as DomainType, minutes: 30, desc: 'Cardio, stretching, or workout session' },
                  { title: 'Technical Reading', domain: 'Academic' as DomainType, minutes: 25, desc: 'Read 15-20 pages of documentation or papers' },
                  { title: 'Code Review & Refactor', domain: 'Engineering' as DomainType, minutes: 30, desc: 'Review pull requests and clean architecture' },
                  { title: 'Hydration & Walk', domain: 'Health' as DomainType, minutes: 20, desc: 'Outdoor walk and drinking 2.5L water' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.title, preset.domain, preset.minutes, preset.desc)}
                    className="p-2 rounded-xl bg-[var(--inset-surface)] hover:bg-[#8296FF]/15 border border-[var(--border-subtle)] hover:border-[#8296FF]/40 text-left transition-all group"
                  >
                    <span className="text-[11px] font-bold text-[var(--text-primary)] group-hover:text-[#8296FF] block">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {preset.minutes}m · {preset.domain}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateHabit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Daily Exercise, Reading 20 mins, Meditation"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Category Domain
                  </label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as DomainType)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  >
                    <option value="Health">Health</option>
                    <option value="Academic">Academic</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                    Target Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Description / Motivation (Optional)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Build cardiovascular endurance and morning energy"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-bold transition-all disabled:opacity-40 shadow-xs"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
