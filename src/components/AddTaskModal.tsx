import React, { useState } from 'react';
import { X, Sparkles, Clock, Layers, Flag } from 'lucide-react';
import { DomainType, PriorityType, Task, GrowthGoal } from '../types';
import { sound } from '../utils/audio';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'completed' | 'spentMinutes' | 'createdAt'>, autoBreakdown: boolean) => Promise<void>;
  selectedDate: string;
  goals: GrowthGoal[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  selectedDate,
  goals,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<DomainType>('Engineering');
  const [priority, setPriority] = useState<PriorityType>('high');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [linkedGoalId, setLinkedGoalId] = useState<string>('');
  const [autoBreakdown, setAutoBreakdown] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playClick();
    setIsSubmitting(true);
    try {
      await onAddTask(
        {
          title: title.trim(),
          description: description.trim(),
          domain,
          priority,
          estimatedMinutes: Number(estimatedMinutes) || 45,
          date: selectedDate,
          subtasks: [],
          linkedGoalId: linkedGoalId || undefined,
        },
        autoBreakdown
      );
      // Reset
      setTitle('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const domains: DomainType[] = ['Engineering', 'Research', 'Deep Work', 'Health', 'Academic'];
  const priorities: PriorityType[] = ['high', 'medium', 'low'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Create Execution Checkpoint
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Target for {selectedDate}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Task Objective / Checkpoint *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Benchmark Raft log compaction under network partitions"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#8296FF]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Strategic Context / Constraints
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key invariants to uphold, metrics to log, or papers to reference..."
              className="w-full px-3.5 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#8296FF]"
            />
          </div>

          {/* Domain & Priority Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Domain</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as DomainType)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#8296FF]"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5" />
                <span>Priority</span>
              </label>
              <div className="flex gap-1.5">
                {priorities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-[#F47783]/20 border border-[#F47783] text-[#F47783]'
                          : p === 'medium'
                          ? 'bg-[#F5B85C]/20 border border-[#F5B85C] text-[#F5B85C]'
                          : 'bg-[#8296FF]/20 border border-[#8296FF] text-[#8296FF]'
                        : 'bg-[var(--inset-surface)] text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration & Linked Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Target Minutes</span>
              </label>
              <input
                type="number"
                min={5}
                max={480}
                step={5}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs tabular-nums focus:outline-none focus:border-[#8296FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Link to Growth Arc (OKR)
              </label>
              <select
                value={linkedGoalId}
                onChange={(e) => setLinkedGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#8296FF]"
              >
                <option value="">None (Standalone)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Decomposition Toggle */}
          <div className="p-3 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)] block">
                  AI Task Decomposition
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Automatically generate 3-4 granular execution steps via Gemini
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoBreakdown}
              onChange={(e) => setAutoBreakdown(e.target.checked)}
              className="w-4 h-4 accent-[#8296FF] rounded cursor-pointer"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--inset-surface)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-[#0B1020] bg-[#8296FF] hover:bg-[#8296FF]/90 rounded-lg transition-all active:scale-[0.98] shadow-md shadow-[#8296FF]/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Deconstructing...' : 'Log Checkpoint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
