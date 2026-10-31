import { Task, GrowthGoal, ExecutionDay, AIInsight, Habit } from '../types';

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Daily Exercise & Mobility',
    description: '30-45 mins cardio, lifting, or mobility recovery',
    domain: 'Health',
    frequency: 'daily',
    streak: 6,
    bestStreak: 21,
    completedDates: ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'],
    targetMinutes: 30,
    icon: 'Activity',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'habit-2',
    title: 'Technical Book & Research Reading',
    description: 'Read 20+ pages of engineering or research literature',
    domain: 'Academic',
    frequency: 'daily',
    streak: 5,
    bestStreak: 14,
    completedDates: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'],
    targetMinutes: 30,
    icon: 'BookOpen',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'habit-3',
    title: 'Code Review & Clean Architecture',
    description: 'Inspect diffs, refactor tech debt, and review architecture',
    domain: 'Engineering',
    frequency: 'daily',
    streak: 6,
    bestStreak: 18,
    completedDates: ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'],
    targetMinutes: 25,
    icon: 'CheckSquare',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'habit-4',
    title: 'Deep Focus Morning Block',
    description: '90 minutes of single-threaded distraction-free work',
    domain: 'Deep Work',
    frequency: 'daily',
    streak: 4,
    bestStreak: 12,
    completedDates: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'],
    targetMinutes: 90,
    icon: 'Flame',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
];

export const INITIAL_GOALS: GrowthGoal[] = [
  {
    id: 'goal-1',
    title: 'Distributed Consensus & Raft Implementation',
    quarter: 'Q4 Execution',
    domain: 'Engineering',
    targetVelocity: 80,
    currentHours: 54,
    strategicRationale: 'Master low-level distributed log replication and RPC partition tolerance.',
    milestones: [
      { id: 'm-1', title: 'Leader Election State Machine & RPC heartbeat tests', targetDate: 'Nov 04', completed: true, weightPercent: 30 },
      { id: 'm-2', title: 'Log Replication & Safety Invariant Testbench', targetDate: 'Nov 12', completed: true, weightPercent: 30 },
      { id: 'm-3', title: 'Snapshotting & Dynamic Membership Configuration', targetDate: 'Nov 24', completed: false, weightPercent: 25 },
      { id: 'm-4', title: 'Jepsen Partition Chaos Benchmarking', targetDate: 'Dec 08', completed: false, weightPercent: 15 }
    ]
  },
  {
    id: 'goal-2',
    title: 'Cognitive Science Monograph on Attention Systems',
    quarter: 'Q4 Execution',
    domain: 'Research',
    targetVelocity: 60,
    currentHours: 38,
    strategicRationale: 'Synthesize working memory bandwidth constraints into computational attention mechanisms.',
    milestones: [
      { id: 'm-2-1', title: 'Literature survey of 42 pre-prints on thalamic gating', targetDate: 'Oct 20', completed: true, weightPercent: 35 },
      { id: 'm-2-2', title: 'Drafting Chapter 2: Sparse Working Memory Allocators', targetDate: 'Nov 06', completed: false, weightPercent: 35 },
      { id: 'm-2-3', title: 'Peer review with lab group & preprint submission', targetDate: 'Nov 28', completed: false, weightPercent: 30 }
    ]
  },
  {
    id: 'goal-3',
    title: 'High-Density Physical Architecture & VO2 Peak',
    quarter: 'Q4 Execution',
    domain: 'Health',
    targetVelocity: 45,
    currentHours: 32,
    strategicRationale: 'Sustain physiological foundation for sustained 60-hour cognitive output weeks.',
    milestones: [
      { id: 'm-3-1', title: 'Threshold Zone 2 Aerobic Base: 180 min/week consistency', targetDate: 'Nov 01', completed: true, weightPercent: 40 },
      { id: 'm-3-2', title: 'Deadlift 2.2x bodyweight structural strength peak', targetDate: 'Nov 18', completed: false, weightPercent: 35 },
      { id: 'm-3-3', title: 'Sleep efficiency index maintained above 88%', targetDate: 'Dec 15', completed: false, weightPercent: 25 }
    ]
  }
];

export const getInitialTasks = (): Task[] => {
  const today = getTodayDateString();
  return [
    {
      id: 'task-1',
      title: 'Implement Raft Log Compaction & Snapshot serialization',
      description: 'Serialize persistent state to disk before truncating prefix log entries up to appliedIndex.',
      domain: 'Engineering',
      priority: 'high',
      estimatedMinutes: 90,
      spentMinutes: 65,
      completed: false,
      date: today,
      linkedGoalId: 'goal-1',
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-1', title: 'Define SnapshotMetadata protobuf schema', minutes: 20, completed: true, priority: 'high' },
        { id: 'sub-2', title: 'Handle InstallSnapshot RPC receiver handler logic', minutes: 35, completed: true, priority: 'high' },
        { id: 'sub-3', title: 'Inject network partition delay in test harness', minutes: 35, completed: false, priority: 'medium' }
      ]
    },
    {
      id: 'task-2',
      title: 'Analyze Miller 1956 vs Cowan 2001 capacity equations',
      description: 'Formalize 4-chunk working memory ceiling in section 3.2 of research draft.',
      domain: 'Research',
      priority: 'high',
      estimatedMinutes: 60,
      spentMinutes: 60,
      completed: true,
      date: today,
      linkedGoalId: 'goal-2',
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-2-1', title: 'Extract mathematical formulations into LaTeX', minutes: 25, completed: true, priority: 'medium' },
        { id: 'sub-2-2', title: 'Draft comparative critique paragraphs', minutes: 35, completed: true, priority: 'high' }
      ]
    },
    {
      id: 'task-3',
      title: 'Deep Work Block 01: Core Algorithm Optimization',
      description: 'Zero distractions, full terminal isolation, memory cache locality tuning.',
      domain: 'Deep Work',
      priority: 'high',
      estimatedMinutes: 50,
      spentMinutes: 50,
      completed: true,
      date: today,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-3-1', title: 'Profile L1/L2 cache misses using perf stat', minutes: 20, completed: true, priority: 'high' },
        { id: 'sub-3-2', title: 'Flatten pointer indirection in node lookup', minutes: 30, completed: true, priority: 'high' }
      ]
    },
    {
      id: 'task-4',
      title: 'Zone 2 Cardio Steady-State (45 min nasal breathing)',
      description: 'Heart rate target 132-142 bpm. Aerobic mitochondrial respiration.',
      domain: 'Health',
      priority: 'medium',
      estimatedMinutes: 45,
      spentMinutes: 0,
      completed: false,
      date: today,
      linkedGoalId: 'goal-3',
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-4-1', title: 'Pre-session dynamic mobility & ankle activation', minutes: 10, completed: false, priority: 'low' },
        { id: 'sub-4-2', title: '35 min continuous watt bike steady pace', minutes: 35, completed: false, priority: 'medium' }
      ]
    },
    {
      id: 'task-5',
      title: 'Review Proof Systems Lecture 08: Interactive Protocols',
      description: 'Zero Knowledge and Arthur-Merlin game verification theorems.',
      domain: 'Academic',
      priority: 'medium',
      estimatedMinutes: 40,
      spentMinutes: 0,
      completed: false,
      date: today,
      createdAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-5-1', title: 'Work through Goldwasser-Micali-Rackoff IP proof', minutes: 25, completed: false, priority: 'medium' },
        { id: 'sub-5-2', title: 'Annotate problem set 4 question 3 edge case', minutes: 15, completed: false, priority: 'low' }
      ]
    }
  ];
};

export const INITIAL_DAYS: ExecutionDay[] = [
  { date: '2026-10-25', dayName: 'Sun', dayNumber: 25, tasksCompleted: 5, totalTasks: 5, focusMinutes: 210, streakActive: true },
  { date: '2026-10-26', dayName: 'Mon', dayNumber: 26, tasksCompleted: 6, totalTasks: 6, focusMinutes: 245, streakActive: true },
  { date: '2026-10-27', dayName: 'Tue', dayNumber: 27, tasksCompleted: 4, totalTasks: 5, focusMinutes: 190, streakActive: true },
  { date: '2026-10-28', dayName: 'Wed', dayNumber: 28, tasksCompleted: 6, totalTasks: 6, focusMinutes: 260, streakActive: true },
  { date: '2026-10-29', dayName: 'Thu', dayNumber: 29, tasksCompleted: 5, totalTasks: 5, focusMinutes: 220, streakActive: true },
  { date: '2026-10-30', dayName: 'Fri', dayNumber: 30, tasksCompleted: 2, totalTasks: 5, focusMinutes: 115, streakActive: true },
  { date: '2026-10-31', dayName: 'Sat', dayNumber: 31, tasksCompleted: 0, totalTasks: 3, focusMinutes: 0, streakActive: false }
];

export const INITIAL_AI_INSIGHT: AIInsight = {
  headline: 'Velocity Trajectory: High momentum on Raft implementation.',
  suggestion: 'Cognitive load is concentrated in distributed systems. Schedule a 45m deep focus sprint now before afternoon fatigue onset.',
  velocityIndex: 94,
  sentiment: 'peak',
  timestamp: 'Updated just now'
};
