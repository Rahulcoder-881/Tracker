import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Zap, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Bot,
  Send,
  MessageSquare,
  ArrowDownUp
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, ExecutionDay, AIInsight, DomainType, GrowthGoal, MediaAsset, Habit } from '../types';
import { DateScroller } from '../components/DateScroller';
import { ProgressMeter } from '../components/ProgressMeter';
import { AiInsightBanner } from '../components/AiInsightBanner';
import { TaskCard } from '../components/TaskCard';
import { SortableTaskItem } from '../components/SortableTaskItem';
import { HabitsTracker } from '../components/HabitsTracker';
import { sound } from '../utils/audio';

interface ExecutionBoardProps {
  tasks: Task[];
  days: ExecutionDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  streakCount: number;
  aiInsight: AIInsight;
  onRefreshAIInsight: () => Promise<void>;
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStartFocus: (task: Task) => void;
  onDeconstructWithAI: (task: Task) => Promise<void>;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onOpenAddTask: () => void;
  selectedDomain: DomainType | 'All';
  setSelectedDomain: (d: DomainType | 'All') => void;
  goals: GrowthGoal[];
  onNavigateToTab: (tab: string) => void;
  allMedia?: MediaAsset[];
  onOpenAttachmentPicker?: (task: Task) => void;
  onAddExtractedTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  habits?: Habit[];
  onToggleHabit?: (habitId: string, date: string) => void;
  onAddHabit?: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>) => void;
  onDeleteHabit?: (habitId: string) => void;
  onReorderTasks?: (reorderedTasks: Task[]) => void;
}

export const ExecutionBoard: React.FC<ExecutionBoardProps> = ({
  tasks,
  days,
  selectedDate,
  onSelectDate,
  streakCount,
  aiInsight,
  onRefreshAIInsight,
  onToggleTask,
  onToggleSubtask,
  onStartFocus,
  onDeconstructWithAI,
  onDeleteTask,
  onAddSubtask,
  onOpenAddTask,
  selectedDomain,
  setSelectedDomain,
  goals,
  onNavigateToTab,
  allMedia = [],
  onOpenAttachmentPicker,
  onAddExtractedTask,
  habits = [],
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onReorderTasks,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);

  // Configure pointer and keyboard sensors for smooth, tactile dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required so normal button clicks are never blocked
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Quick extract tasks via Gemini API
  const handleQuickExtract = async (customPrompt?: string) => {
    const promptText = (customPrompt || aiPrompt).trim();
    if (!promptText || isExtracting || !onAddExtractedTask) return;

    sound.playClick();
    setIsExtracting(true);
    setExtractedNotice(null);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `The user wants to plan execution for today (${selectedDate}). Extract 1 to 2 concrete action checkpoints from: "${promptText}". Format each on a new line starting with "CHECKPOINT: <title> | <domain: Engineering, Deep Work, Academic, Research, Health> | <minutes: 15-90>" followed by 2 bullet subtasks.`,
            },
          ],
          systemRole: 'task_extractor',
          model: 'gemini-3.1-flash-lite',
        }),
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();
      const reply = data.reply || '';

      // Parse checkpoints
      const lines = reply.split('\n');
      let created = 0;
      for (const line of lines) {
        if (line.includes('CHECKPOINT:')) {
          const parts = line.replace(/.*CHECKPOINT:\s*/, '').split('|');
          const title = (parts[0] || 'Strategic Sprint Block').trim();
          const domainRaw = (parts[1] || 'Engineering').trim() as DomainType;
          const validDomains: DomainType[] = ['Engineering', 'Deep Work', 'Academic', 'Research', 'Health'];
          const domain = validDomains.includes(domainRaw) ? domainRaw : 'Engineering';
          const minutes = parseInt(parts[2]?.trim() || '45', 10) || 45;

          onAddExtractedTask({
            title,
            description: `Generated via Gemini 3.1 Flash Lite from: "${promptText}"`,
            domain,
            priority: 'high',
            estimatedMinutes: minutes,
            spentMinutes: 0,
            completed: false,
            date: selectedDate,
            subtasks: [
              { id: `st-ex-${Date.now()}-1`, title: 'Define interface and acceptance criteria', minutes: Math.round(minutes * 0.3), completed: false },
              { id: `st-ex-${Date.now()}-2`, title: 'Execute focus implementation block', minutes: Math.round(minutes * 0.7), completed: false },
            ],
          });
          created++;
        }
      }

      if (created === 0) {
        // Fallback default if format differed
        onAddExtractedTask({
          title: promptText.slice(0, 70),
          description: `Extracted via Gemini AI Co-Pilot`,
          domain: 'Engineering',
          priority: 'high',
          estimatedMinutes: 45,
          spentMinutes: 0,
          completed: false,
          date: selectedDate,
          subtasks: [
            { id: `st-ex-${Date.now()}-1`, title: 'Technical blueprint pass', minutes: 15, completed: false },
            { id: `st-ex-${Date.now()}-2`, title: 'Core implementation pass', minutes: 30, completed: false },
          ],
        });
        created = 1;
      }

      sound.playCompletionChime();
      setAiPrompt('');
      setExtractedNotice(`Extracted ${created} checkpoint${created > 1 ? 's' : ''} to board.`);
      setTimeout(() => setExtractedNotice(null), 3500);
    } catch (err: any) {
      sound.playAlertTone();
      setExtractedNotice('Failed to extract checkpoint. Try again.');
      setTimeout(() => setExtractedNotice(null), 3000);
    } finally {
      setIsExtracting(false);
    }
  };

  // Filter tasks for selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completedCount = dayTasks.filter((t) => t.completed).length;
  const totalCount = dayTasks.length;
  const focusMinutes = dayTasks.reduce((acc, curr) => acc + (curr.spentMinutes || 0), 0);

  // Apply search, domain, and status filters
  const filteredTasks = dayTasks.filter((task) => {
    if (selectedDomain !== 'All' && task.domain !== selectedDomain) return false;
    if (statusFilter === 'pending' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle drag-and-drop task reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
      const newIndex = filteredTasks.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        sound.playClick();
        const reordered = arrayMove(filteredTasks, oldIndex, newIndex);
        if (onReorderTasks) {
          onReorderTasks(reordered);
        }
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      {/* Main Execution Column */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Date Selector Strip */}
        <DateScroller
          days={days}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          streakCount={streakCount}
        />

        {/* Daily KPI Executive Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Checkpoints</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {completedCount}
              </span>
              <span className="text-xs text-[var(--text-secondary)] tabular-nums">/{totalCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Deep Work</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-[#8296FF]">
                {focusMinutes}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">min</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Momentum Index</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-[#35C99A]">
                {aiInsight.velocityIndex}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Streak Velocity</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-[#F5B85C]">
                {streakCount}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">days active</span>
            </div>
          </div>
        </div>

        {/* Dynamic Velocity Progress Meter */}
        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)]">
          <ProgressMeter
            label="Day Completion Velocity"
            sublabel="Systematic execution pacing"
            completed={completedCount}
            total={totalCount}
          />
        </div>

        {/* Daily Habits & Streak Tracking Feature */}
        {onToggleHabit && onAddHabit && onDeleteHabit && (
          <HabitsTracker
            habits={habits}
            onToggleHabit={onToggleHabit}
            onAddHabit={onAddHabit}
            onDeleteHabit={onDeleteHabit}
            selectedDate={selectedDate}
            selectedDomain={selectedDomain}
          />
        )}

        {/* Sleek AI Insight Banner */}
        <AiInsightBanner
          insight={aiInsight}
          onRefresh={onRefreshAIInsight}
          onApplyTacticalAction={() => onNavigateToTab('focus')}
        />

        {/* Gemini AI Co-Pilot Quick-Extraction Bar */}
        <div className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#8296FF]/15 text-[#8296FF] flex items-center justify-center">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Gemini Co-Pilot Task Extractor
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--inset-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                gemini-3.1-flash-lite
              </span>
            </div>

            <button
              onClick={() => onNavigateToTab('chat')}
              className="text-[11px] text-[#8296FF] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full Chat</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickExtract();
            }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Plan 2 engineering tasks for database indexing and latency benchmarking..."
              disabled={isExtracting}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-none focus:border-[#8296FF]"
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim() || isExtracting}
              className="px-3.5 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold hover:bg-[#8296FF]/90 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shrink-0"
            >
              {isExtracting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Extract Checkpoint</span>
                  <span className="sm:hidden">Extract</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Prompts & Notice */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <span className="text-[var(--text-secondary)] font-medium shrink-0">Quick Starters:</span>
              {[
                'Extract 2 backend tasks for caching',
                'Plan 45-min Deep Work sprint',
                'Calibrate velocity gap',
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickExtract(p)}
                  disabled={isExtracting}
                  className="px-2 py-0.5 rounded bg-[var(--inset-surface)] hover:bg-[#8296FF]/15 text-[var(--text-secondary)] hover:text-[#8296FF] border border-[var(--border-subtle)] transition-colors whitespace-nowrap shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {extractedNotice && (
              <span className="text-[#35C99A] font-medium animate-in fade-in">
                {extractedNotice}
              </span>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--inset-surface)] rounded-lg border border-[var(--border-subtle)] overflow-x-auto">
            {(['all', 'pending', 'completed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sound.playClick();
                  setStatusFilter(mode);
                }}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize text-center whitespace-nowrap ${
                  statusFilter === mode
                    ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-subtle)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode === 'all' ? `All (${dayTasks.length})` : mode}
              </button>
            ))}
          </div>

          {/* Search box & Add button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter checkpoints..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
              />
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onOpenAddTask();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold hover:bg-[#8296FF]/90 transition-all shrink-0 active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Reordering helper cue */}
        {filteredTasks.length > 1 && (
          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-1">
            <span className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
              <ArrowDownUp className="w-3 h-3 text-[#8296FF]" />
              <span>Drag handle <strong className="text-[var(--text-primary)] font-semibold">⠿</strong> to reorder priorities</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--text-secondary)]/70">
              {filteredTasks.length} checkpoints
            </span>
          </div>
        )}

        {/* Task List Section */}
        <div className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onToggleTask={onToggleTask}
                    onToggleSubtask={onToggleSubtask}
                    onStartFocus={onStartFocus}
                    onDeconstructWithAI={onDeconstructWithAI}
                    onDeleteTask={onDeleteTask}
                    onAddSubtask={onAddSubtask}
                    allMedia={allMedia}
                    onOpenAttachmentPicker={onOpenAttachmentPicker}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {filteredTasks.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-[var(--border-medium)] bg-[var(--card-surface)]/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#8296FF]/10 text-[#8296FF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                {dayTasks.length === 0
                  ? 'No checkpoints scheduled for this day'
                  : 'No tasks match current filter'}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                {dayTasks.length === 0
                  ? 'Log your highest-leverage work blocks to maintain streak velocity.'
                  : 'Clear search filters or switch to "All" view to see all checkpoints.'}
              </p>
              {dayTasks.length === 0 && (
                <button
                  onClick={onOpenAddTask}
                  className="px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#8296FF]/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log First Checkpoint</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Concurrent Desktop 3rd Pane: Growth Objectives & Deep Flow Cockpit */}
      <div className="hidden xl:block w-80 shrink-0 space-y-5">
        {/* Linked Growth Objectives */}
        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#8296FF]" />
              <span>Active Growth Arcs</span>
            </span>
            <button
              onClick={() => onNavigateToTab('trajectory')}
              className="text-[11px] text-[#8296FF] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.round((g.currentHours / g.targetVelocity) * 100);
              return (
                <div key={g.id} className="p-2.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)] truncate max-w-[170px]">
                      {g.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#35C99A] tabular-nums font-semibold">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[var(--card-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8296FF] to-[#35C99A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] block">
                    {g.currentHours} of {g.targetVelocity} targeted hours
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Protocol Quick Access */}
        <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#35C99A]/15 text-[#35C99A] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-primary)] block">
                Deep Work Chamber
              </span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Calibrated focus protocol
              </span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Enter terminal focus chamber with ambient binaural acoustic frequency generator.
          </p>

          <button
            onClick={() => onNavigateToTab('focus')}
            className="w-full py-2 px-3 rounded-lg bg-[var(--inset-surface)] hover:bg-[#8296FF]/20 border border-[var(--border-subtle)] text-xs font-semibold text-[#8296FF] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Enter Focus Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Gemini AI Co-Pilot Cockpit */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#121929] to-[#172338] border border-[rgba(130,150,255,0.25)] space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#8296FF] to-[#A78BFA] text-[#0B1020] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Gemini AI Co-Pilot
                </span>
                <span className="text-[10px] text-[#8296FF] font-mono">
                  Multi-Turn & Grounded
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#35C99A] animate-pulse" />
              <span className="text-[10px] text-[#35C99A] font-semibold">Active</span>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Autonomous execution strategist powered by <strong className="text-[var(--text-primary)]">Gemini 4 Argon</strong> and <strong className="text-[var(--text-primary)]">3.8 Flash</strong> with real-time web search grounding.
          </p>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => onNavigateToTab('chat')}
              className="w-full py-2 px-3 rounded-lg bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Co-Pilot Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateToTab('voice')}
              className="w-full py-2 px-3 rounded-lg bg-[var(--card-surface)] hover:bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Open Live Voice Chamber</span>
            </button>
          </div>
        </div>

        {/* High-Agency Principle Card */}
        <div className="p-4 rounded-xl border border-[rgba(130,150,255,0.15)] bg-gradient-to-br from-[#172338] to-[#111A2C] space-y-2 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#8296FF]">
            Execution Law
          </div>
          <p className="text-[var(--text-secondary)] italic leading-relaxed">
            "Momentum is sustained by eliminating cognitive ambiguity before starting work blocks."
          </p>
        </div>
      </div>
    </div>
  );
};
