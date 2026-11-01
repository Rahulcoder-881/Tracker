import React, { useState } from 'react';
import { 
  Check, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  Plus,
  Paperclip,
  ExternalLink,
  Image as ImageIcon,
  GripVertical
} from 'lucide-react';
import { Task, Subtask, MediaAsset } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export interface TaskCardProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartFocus: (task: Task) => void;
  onDeconstructWithAI: (task: Task) => Promise<void>;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  allMedia?: MediaAsset[];
  onOpenAttachmentPicker?: (task: Task) => void;
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleTask,
  onToggleSubtask,
  onStartFocus,
  onDeconstructWithAI,
  onDeleteTask,
  onAddSubtask,
  allMedia = [],
  onOpenAttachmentPicker,
  dragHandleProps,
  isDragging = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Attached media objects
  const attachedMedia = allMedia.filter((m) => (task.attachedMediaIds || []).includes(m.id));

  const handleMainToggle = () => {
    if (!task.completed) {
      sound.playCompletionChime();
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#8296FF', '#35C99A', '#A78BFA'],
          disableForReducedMotion: true,
        });
      } catch {}
    } else {
      sound.playClick();
    }
    onToggleTask(task.id);
  };

  const handleSubtaskToggle = (subId: string) => {
    sound.playClick();
    onToggleSubtask(task.id, subId);
  };

  const handleAIDecompose = async () => {
    sound.playClick();
    setIsDeconstructing(true);
    try {
      await onDeconstructWithAI(task);
      setExpanded(true);
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    sound.playClick();
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const domainColorMap: Record<string, string> = {
    Engineering: '#8296FF',
    Research: '#A78BFA',
    'Deep Work': '#35C99A',
    Health: '#F5B85C',
    Academic: '#bac3ff',
  };

  const priorityMap: Record<string, { label: string; bg: string; text: string }> = {
    high: { label: 'High Priority', bg: 'rgba(244, 119, 131, 0.12)', text: '#F47783' },
    medium: { label: 'Medium Priority', bg: 'rgba(245, 184, 92, 0.12)', text: '#F5B85C' },
    low: { label: 'Low Priority', bg: 'rgba(130, 150, 255, 0.12)', text: '#8296FF' },
  };

  const priorityStyle = priorityMap[task.priority] || priorityMap.medium;

  return (
    <div
      className={`group rounded-xl border transition-all p-3.5 sm:p-4 ${
        isDragging
          ? 'bg-[var(--card-surface)] border-[#8296FF] shadow-xl shadow-[#8296FF]/20 ring-2 ring-[#8296FF]/50 scale-[1.01]'
          : task.completed
          ? 'bg-[var(--card-surface)]/60 border-[var(--border-subtle)] opacity-75'
          : 'bg-[var(--card-surface)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] shadow-xs'
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        {/* Grip Handle for Drag-and-Drop Reordering */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 rounded-md text-[var(--text-secondary)] hover:text-[#8296FF] hover:bg-[var(--inset-surface)] transition-all touch-none shrink-0 mt-0.5 opacity-40 hover:opacity-100 group-hover:opacity-100"
            title="Drag to reorder task priority"
            aria-label="Drag handle to reorder task priority"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* High-Contrast Utilitarian Checkbox */}
        <button
          onClick={handleMainToggle}
          aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
          className={`w-5 h-5 rounded-[0.25rem] mt-0.5 flex items-center justify-center shrink-0 transition-all ${
            task.completed
              ? 'bg-[#8296FF] text-[#0B1020] shadow-xs'
              : 'border border-[rgba(255,255,255,0.25)] dark:border-[rgba(255,255,255,0.25)] hover:border-[#8296FF] bg-transparent'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Info & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Domain Pill Tag */}
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: domainColorMap[task.domain] || '#8296FF' }}
              />
              <span>{task.domain}</span>
            </span>

            {/* Priority Status Badge */}
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.text,
              }}
            >
              <span>{task.priority}</span>
            </span>

            {/* Duration Tabular Meta */}
            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 tabular-nums font-mono ml-auto">
              <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
              <span>{task.spentMinutes}/{task.estimatedMinutes}m</span>
            </span>
          </div>

          <h4
            onClick={() => setExpanded(!expanded)}
            className={`text-sm sm:text-base font-medium tracking-tight cursor-pointer select-none leading-snug transition-colors ${
              task.completed
                ? 'line-through text-[var(--text-secondary)]'
                : 'text-[var(--text-primary)] hover:text-[#8296FF]'
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Embedded Media Previews */}
          {attachedMedia.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                Embedded Media Assets ({attachedMedia.length})
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {attachedMedia.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setPreviewMediaUrl(m.dataUrl)}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF] cursor-pointer shrink-0 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-[var(--card-surface)] overflow-hidden flex items-center justify-center">
                      <img src={m.dataUrl} alt={m.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[11px] text-[var(--text-primary)] font-medium max-w-[130px] truncate">
                      {m.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Progress Overview Bar */}
          {totalSubtasks > 0 && (
            <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span className="tabular-nums">
                  {completedSubtasks} of {totalSubtasks} subtasks completed ({subtaskProgress}%)
                </span>
              </button>

              <div className="w-24 h-1.5 bg-[var(--inset-surface)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8296FF] to-[#35C99A] transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 flex-wrap">
          {!task.completed && (
            <button
              onClick={() => {
                sound.playClick();
                onStartFocus(task);
              }}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#8296FF]/15 hover:bg-[#8296FF]/25 text-[#8296FF] font-medium transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden sm:inline">Enter Chamber</span>
              <span className="sm:hidden">Focus</span>
            </button>
          )}

          <button
            onClick={handleAIDecompose}
            disabled={isDeconstructing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3 h-3 text-[#A78BFA] ${isDeconstructing ? 'animate-spin' : ''}`} />
            <span>{isDeconstructing ? 'Deconstructing...' : 'AI Breakdown'}</span>
          </button>

          {onOpenAttachmentPicker && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAttachmentPicker(task);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#8296FF] transition-colors"
              title="Attach or embed media diagram"
            >
              <Paperclip className="w-3 h-3" />
              <span className="hidden sm:inline">Attach Media</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            title={expanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onDeleteTask(task.id);
            }}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[#F47783] transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Subtasks View */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2 bg-[var(--inset-surface)]/60 -mx-4 -mb-4 p-4 rounded-b-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span className="uppercase tracking-wider text-[10px]">Execution Milestones</span>
            <button
              onClick={() => setIsAddingSubtask(!isAddingSubtask)}
              className="text-[#8296FF] hover:underline flex items-center gap-1 text-[11px]"
            >
              <Plus className="w-3 h-3" />
              <span>Add step</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {task.subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs"
              >
                <button
                  onClick={() => handleSubtaskToggle(sub.id)}
                  className={`w-4 h-4 rounded-[0.2rem] flex items-center justify-center shrink-0 transition-all ${
                    sub.completed
                      ? 'bg-[#8296FF] text-[#0B1020]'
                      : 'border border-[rgba(255,255,255,0.25)] hover:border-[#8296FF]'
                  }`}
                >
                  {sub.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                <span
                  className={`flex-1 truncate ${
                    sub.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'
                  }`}
                >
                  {sub.title}
                </span>

                <span className="text-[11px] font-mono text-[var(--text-secondary)] tabular-nums shrink-0">
                  {sub.minutes}m
                </span>
              </div>
            ))}

            {task.subtasks.length === 0 && (
              <div className="py-2 text-center text-xs text-[var(--text-secondary)] italic">
                No subtasks recorded yet. Click "AI Breakdown" to generate tactical steps.
              </div>
            )}
          </div>

          {isAddingSubtask && (
            <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Enter step title (e.g., Audit RPC timeout logic)..."
                autoFocus
                className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-md bg-[#8296FF] text-[#0B1020] text-xs font-semibold"
              >
                Save
              </button>
            </form>
          )}
        </div>
      )}

      {/* Lightbox Modal for Attached Media */}
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
    </div>
  );
};
