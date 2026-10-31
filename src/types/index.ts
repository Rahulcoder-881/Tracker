export type DomainType = 'Engineering' | 'Deep Work' | 'Academic' | 'Research' | 'Health';

export type PriorityType = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  email: string;
  username?: string;
  role?: 'admin' | 'user';
  name: string;
  domainFocus: DomainType;
  bio?: string;
  avatarUrl?: string;
  targetDailyHours: number;
  createdAt: string;
  lastLoginAt?: string;
  status?: 'active' | 'suspended';
}

export interface AuthSession {
  token: string;
  user: User;
}

export type MediaCategory = 
  | 'Architecture Diagrams'
  | 'Research Figures'
  | 'Benchmarks'
  | 'Documentation'
  | 'General Assets';

export interface MediaAsset {
  id: string;
  name: string;
  originalName: string;
  category: MediaCategory;
  tags: string[];
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  notes?: string;
  width?: number;
  height?: number;
  createdAt: string;
  userId?: string;
}

export interface Subtask {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
  priority?: PriorityType;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  domain: DomainType;
  priority: PriorityType;
  estimatedMinutes: number;
  spentMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  subtasks: Subtask[];
  linkedGoalId?: string;
  attachedMediaIds?: string[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  weightPercent: number;
}

export interface GrowthGoal {
  id: string;
  title: string;
  quarter: string;
  domain: DomainType;
  targetVelocity: number; // target hours
  currentHours: number;
  milestones: Milestone[];
  strategicRationale: string;
  attachedMediaIds?: string[];
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  domain: DomainType;
  frequency: 'daily' | 'weekdays' | 'weekends';
  streak: number;
  bestStreak: number;
  completedDates: string[]; // List of YYYY-MM-DD
  targetMinutes?: number;
  icon?: string;
  createdAt: string;
  userId?: string;
}

export interface AIInsight {
  headline: string;
  suggestion: string;
  velocityIndex: number;
  sentiment: 'peak' | 'steady' | 'recovery';
  timestamp?: string;
}

export interface ExecutionDay {
  date: string;
  dayName: string;
  dayNumber: number;
  tasksCompleted: number;
  totalTasks: number;
  focusMinutes: number;
  streakActive: boolean;
}

export type SystemRoleType = 'strategic_coach' | 'momentum_pacer' | 'task_extractor' | 'grounded_research';

export type GeminiModelType = 'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  sources?: GroundingSource[];
  isStreaming?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  severity: 'info' | 'warn' | 'critical';
}

export interface SystemConfig {
  defaultModel: GeminiModelType;
  searchGroundingEnabled: boolean;
  maintenanceMode: boolean;
  announcement: string;
  systemCapacityTarget: number;
  lastUpdated: string;
}
