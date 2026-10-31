import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Plus, 
  Check, 
  Calendar, 
  Award, 
  Compass, 
  Sparkles, 
  Clock, 
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { GrowthGoal, Milestone, DomainType, MediaAsset } from '../types';
import { sound } from '../utils/audio';

interface GrowthTrajectoryProps {
  goals: GrowthGoal[];
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onAddGoal: (newGoal: GrowthGoal) => void;
  allMedia?: MediaAsset[];
  onOpenAttachmentPicker?: (goal: GrowthGoal) => void;
}

export const GrowthTrajectory: React.FC<GrowthTrajectoryProps> = ({
  goals,
  onToggleMilestone,
  onAddGoal,
  allMedia = [],
  onOpenAttachmentPicker,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [rationale, setRationale] = useState('');
  const [domain, setDomain] = useState<DomainType>('Engineering');
  const [targetVelocity, setTargetVelocity] = useState(60);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const totalTargetHours = goals.reduce((acc, g) => acc + g.targetVelocity, 0);
  const totalCompletedHours = goals.reduce((acc, g) => acc + g.currentHours, 0);
  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);
  const completedMilestones = goals.reduce(
    (acc, g) => acc + g.milestones.filter((m) => m.completed).length,
    0
  );

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sound.playClick();
    const newG: GrowthGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      quarter: 'Q4 Execution',
      domain,
      targetVelocity: Number(targetVelocity) || 50,
      currentHours: 0,
      strategicRationale: rationale.trim() || 'Accelerate mastery trajectory and strategic execution.',
      milestones: [
        { id: `m-${Date.now()}-1`, title: 'Define core specification and baseline architecture', targetDate: 'Nov 15', completed: false, weightPercent: 30 },
        { id: `m-${Date.now()}-2`, title: 'Implement MVP prototype and stress benchmark', targetDate: 'Nov 30', completed: false, weightPercent: 40 },
        { id: `m-${Date.now()}-3`, title: 'Ship production release and peer audit review', targetDate: 'Dec 15', completed: false, weightPercent: 30 }
      ]
    };
    onAddGoal(newG);
    setTitle('');
    setRationale('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8296FF]">
            <Compass className="w-4 h-4" />
            <span>Quarterly Growth Arcs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
            Growth Trajectory & OKRs
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Systematic progression frameworks decoupled from short-term noise.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs sm:text-sm font-semibold hover:bg-[#8296FF]/90 transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Growth Arc</span>
        </button>
      </div>

      {/* Aggregate Trajectory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">Active Growth Arcs</span>
          <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
            {goals.length}
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">In Flight</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">Hours Invested</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tabular-nums text-[#8296FF]">
              {totalCompletedHours}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono tabular-nums">
              /{totalTargetHours}h
            </span>
          </div>
          <span className="text-[11px] text-[#35C99A] mt-1 block font-mono">
            {totalTargetHours > 0 ? Math.round((totalCompletedHours / totalTargetHours) * 100) : 0}% Target Reached
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">Key Milestones</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tabular-nums text-[#35C99A]">
              {completedMilestones}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono tabular-nums">
              /{totalMilestones}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Verified Output</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
          <span className="text-[11px] font-medium text-[var(--text-secondary)]">Cadence Rating</span>
          <div className="text-2xl font-bold tabular-nums text-[#A78BFA] mt-1">
            Optimal
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">Compound Pace</span>
        </div>
      </div>

      {/* Growth Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentHours / goal.targetVelocity) * 100));
          const completedCount = goal.milestones.filter((m) => m.completed).length;
          const attachedMedia = allMedia.filter((m) => (goal.attachedMediaIds || []).includes(m.id));

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] p-5 space-y-4 hover:border-[var(--border-medium)] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[#8296FF]">
                      {goal.domain}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">·</span>
                    <span className="text-xs text-[var(--text-secondary)] font-mono">
                      {goal.quarter}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-semibold text-[#35C99A] tabular-nums">
                    {percent}% Velocity
                  </span>
                </div>

                {/* Title & Strategic Rationale */}
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug">
                    {goal.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {goal.strategicRationale}
                  </p>
                </div>

                {/* Attached Media Previews */}
                {attachedMedia.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                      Architecture & Benchmark Assets ({attachedMedia.length})
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {attachedMedia.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setPreviewMediaUrl(m.dataUrl)}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF] cursor-pointer shrink-0"
                        >
                          <div className="w-7 h-7 rounded overflow-hidden flex items-center justify-center">
                            <img src={m.dataUrl} alt={m.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <span className="text-[11px] text-[var(--text-primary)] font-medium max-w-[120px] truncate">
                            {m.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono tabular-nums">
                    <span>{goal.currentHours}h completed</span>
                    <span>{goal.targetVelocity}h target</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--inset-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#8296FF] to-[#35C99A] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    <span>Critical Milestones</span>
                    <span className="font-mono tabular-nums">
                      {completedCount}/{goal.milestones.length}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {goal.milestones.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors ${
                          m.completed
                            ? 'bg-[var(--inset-surface)]/60 border-[var(--border-subtle)] text-[var(--text-secondary)]'
                            : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                        }`}
                      >
                        <button
                          onClick={() => {
                            sound.playCompletionChime();
                            onToggleMilestone(goal.id, m.id);
                          }}
                          className={`w-4 h-4 rounded-[0.2rem] mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                            m.completed
                              ? 'bg-[#35C99A] text-[#0B1020]'
                              : 'border border-[rgba(255,255,255,0.25)] hover:border-[#8296FF]'
                          }`}
                        >
                          {m.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <span className={`block truncate ${m.completed ? 'line-through' : ''}`}>
                            {m.title}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-[var(--text-secondary)] shrink-0 tabular-nums">
                          {m.targetDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                {onOpenAttachmentPicker && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenAttachmentPicker(goal);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#8296FF] hover:underline"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Attach Asset</span>
                  </button>
                )}
                <span className="text-[11px] text-[#A78BFA] font-medium ml-auto">Trajectory Active</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox for preview */}
      {previewMediaUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div className="max-w-3xl max-h-[85vh] bg-[var(--card-surface)] rounded-2xl p-4 border border-[var(--border-medium)] flex flex-col items-center">
            <img src={previewMediaUrl} alt="Preview" className="max-h-[75vh] max-w-full object-contain rounded-lg" />
            <button
              onClick={() => setPreviewMediaUrl(null)}
              className="mt-3 px-4 py-1.5 rounded-lg bg-[var(--inset-surface)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Close Lightbox
            </button>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-4 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Launch Quarterly Growth Arc
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Arc Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Database Kernel in Rust"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Strategic Rationale / Compounding Thesis
                </label>
                <textarea
                  rows={2}
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Why this matters for your 12-month trajectory..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as DomainType)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Health">Health</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Target Hours
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    value={targetVelocity}
                    onChange={(e) => setTargetVelocity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#8296FF] text-[#0B1020] rounded-lg hover:bg-[#8296FF]/90 transition-all"
                >
                  Create Arc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
