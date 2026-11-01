/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomDock } from './components/BottomDock';
import { AddTaskModal } from './components/AddTaskModal';
import { AuthModal } from './components/AuthModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { MediaAttachmentPicker } from './components/MediaAttachmentPicker';
import { QuickGeminiDrawer } from './components/QuickGeminiDrawer';
import { ExecutionBoard } from './views/ExecutionBoard';
import { GrowthTrajectory } from './views/GrowthTrajectory';
import { DeepWorkChamber } from './views/DeepWorkChamber';
import { StrategicAudit } from './views/StrategicAudit';
import { MediaCMSView } from './views/MediaCMSView';
import { SettingsView } from './views/SettingsView';
import { GeminiChatView } from './views/GeminiChatView';
import { VoiceChamberView } from './views/VoiceChamberView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { FAQModal } from './components/FAQModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ThankYouModal } from './components/ThankYouModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { NotFoundView } from './components/NotFoundView';
import { ReviewsSection } from './components/ReviewsSection';
import { Task, GrowthGoal, ExecutionDay, AIInsight, DomainType, User, MediaAsset, Habit } from './types';
import { 
  getInitialTasks, 
  INITIAL_GOALS, 
  INITIAL_DAYS, 
  INITIAL_AI_INSIGHT, 
  INITIAL_HABITS,
  getTodayDateString 
} from './data/initialData';
import { sound } from './utils/audio';
import { auth, onAuthStateChanged, db, doc, setDoc, fbSignOut } from './lib/firebase';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tg_theme');
      return stored ? stored === 'dark' : true;
    }
    return true;
  });

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tg_sound');
      return stored !== 'false';
    }
    return true;
  });

  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tg_auth_token');
    }
    return null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_auth_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('today');

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // Domain filter
  const [selectedDomain, setSelectedDomain] = useState<DomainType | 'All'>('All');

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_tasks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return getInitialTasks();
  });

  // Goals state
  const [goals, setGoals] = useState<GrowthGoal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_goals');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_GOALS;
  });

  // Habits state
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_habits');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_HABITS;
  });

  // Media CMS assets state
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  // Days state
  const [days, setDays] = useState<ExecutionDay[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_days');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_DAYS;
  });

  // Streak state
  const [streakCount, setStreakCount] = useState<number>(14);

  // AI Strategic Insight state
  const [aiInsight, setAiInsight] = useState<AIInsight>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_ai_insight');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_AI_INSIGHT;
  });

  // Target daily deep work hours
  const [targetDailyHours, setTargetDailyHours] = useState<number>(4.0);

  // Active task locked in focus chamber
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Modal open state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Attachment Picker Modal State (for binding media to task or goal)
  const [attachTarget, setAttachTarget] = useState<{ type: 'task' | 'goal'; id: string; title: string } | null>(null);

  // Sync theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('tg_theme', 'dark');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      localStorage.setItem('tg_theme', 'light');
    }
  }, [isDark]);

  // Sync sound setting
  useEffect(() => {
    sound.setSoundEnabled(soundEnabled);
    localStorage.setItem('tg_sound', String(soundEnabled));
  }, [soundEnabled]);

  // Persist tasks & goals
  useEffect(() => {
    localStorage.setItem('tg_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tg_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('tg_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('tg_days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('tg_ai_insight', JSON.stringify(aiInsight));
  }, [aiInsight]);

  // Persist auth
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tg_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tg_auth_user');
    }
    if (authToken) {
      localStorage.setItem('tg_auth_token', authToken);
    } else {
      localStorage.removeItem('tg_auth_token');
    }
  }, [currentUser, authToken]);

  // Restore a server session from Firebase Auth whenever the app loads or auth changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setAuthToken(null);
        setCurrentUser(null);
        return;
      }

      try {
        const idToken = await fbUser.getIdToken();
        const response = await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name: fbUser.displayName, avatarUrl: fbUser.photoURL }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Session restoration failed');

        setAuthToken(data.token);
        setCurrentUser((prev) => ({
          ...data.user,
          bio: prev?.bio || data.user.bio || '',
          domainFocus: prev?.domainFocus || data.user.domainFocus || 'Engineering',
          targetDailyHours: prev?.targetDailyHours || data.user.targetDailyHours || 4.5,
        }));
      } catch (error) {
        console.error('Firebase session restoration failed:', error);
        setAuthToken(null);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync user state and checkpoints to Firestore when user is signed in with Firebase
  useEffect(() => {
    if (currentUser?.id && auth.currentUser?.uid === currentUser.id) {
      const syncToFirestore = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.id);
          const { role: _role, ...profileData } = currentUser;
          await setDoc(userDocRef, {
            ...profileData,
            tasksCount: tasks.length,
            goalsCount: goals.length,
            lastSyncedAt: new Date().toISOString(),
          }, { merge: true });
        } catch (e) {
          console.warn('Firestore cloud sync note:', e);
        }
      };
      syncToFirestore();
    }
  }, [tasks, goals, currentUser]);

  // Load Media Assets from CMS Backend
  const loadMediaAssets = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.assets)) {
          setMediaAssets(data.assets);
        }
      }
    } catch (err) {
      console.warn('Failed to load media assets from backend:', err);
    }
  };

  useEffect(() => {
    loadMediaAssets();
  }, []);

  // Update day statistics when tasks change
  useEffect(() => {
    const todayTasks = tasks.filter((t) => t.date === selectedDate);
    const completed = todayTasks.filter((t) => t.completed).length;
    const focusMins = todayTasks.reduce((acc, curr) => acc + (curr.spentMinutes || 0), 0);

    setDays((prev) =>
      prev.map((d) => {
        if (d.date === selectedDate) {
          return {
            ...d,
            tasksCompleted: completed,
            totalTasks: todayTasks.length,
            focusMinutes: focusMins,
            streakActive: completed > 0,
          };
        }
        return d;
      })
    );
  }, [tasks, selectedDate]);

  // Auth Handlers
  const handleAuthSuccess = (token: string, user: User) => {
    setAuthToken(token);
    setCurrentUser(user);
    if (user.targetDailyHours) {
      setTargetDailyHours(user.targetDailyHours);
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } catch {}
    try {
      await fbSignOut(auth);
    } catch {}
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Media CMS Handlers
  const handleUploadMedia = async (assetData: Omit<MediaAsset, 'id' | 'createdAt'>) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify(assetData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload asset');
    setMediaAssets((prev) => [data.asset, ...prev]);
  };

  const handleDeleteMedia = async (id: string) => {
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete asset');
    }
    setMediaAssets((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateMedia = async (id: string, updates: Partial<MediaAsset>) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const res = await fetch(`/api/media/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update asset');
    setMediaAssets((prev) => prev.map((m) => (m.id === id ? data.asset : m)));
  };

  // Screen Embedding Handlers
  const handleAttachToTask = (taskId: string, assetId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const currentAttached = t.attachedMediaIds || [];
          const nextAttached = currentAttached.includes(assetId)
            ? currentAttached.filter((id) => id !== assetId)
            : [...currentAttached, assetId];
          return { ...t, attachedMediaIds: nextAttached };
        }
        return t;
      })
    );
  };

  const handleAttachToGoal = (goalId: string, assetId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const currentAttached = g.attachedMediaIds || [];
          const nextAttached = currentAttached.includes(assetId)
            ? currentAttached.filter((id) => id !== assetId)
            : [...currentAttached, assetId];
          return { ...g, attachedMediaIds: nextAttached };
        }
        return g;
      })
    );
  };

  // Task actions
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          const updatedSubtasks = t.subtasks.map((s) => ({
            ...s,
            completed: nextCompleted,
          }));
          return {
            ...t,
            completed: nextCompleted,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const allDone = nextSubtasks.length > 0 && nextSubtasks.every((s) => s.completed);
          return {
            ...t,
            subtasks: nextSubtasks,
            completed: allDone ? true : t.completed,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeFocusTask?.id === id) {
      setActiveFocusTask(null);
    }
  };

  const handleReorderTasks = (reorderedSubset: Task[]) => {
    setTasks((prev) => {
      const reorderedIds = new Set(reorderedSubset.map((t) => t.id));
      let idx = 0;
      return prev.map((t) => {
        if (reorderedIds.has(t.id)) {
          return reorderedSubset[idx++];
        }
        return t;
      });
    });
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    const newSub = {
      id: `sub-${Date.now()}`,
      title,
      minutes: 15,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t
      )
    );
  };

  // AI Task Decomposition
  const handleDeconstructWithAI = async (task: Task) => {
    try {
      const res = await fetch('/api/ai/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDomain: task.domain,
          estimatedMinutes: task.estimatedMinutes,
        }),
      });

      if (!res.ok) throw new Error('Breakdown failed');
      const data = await res.json();
      if (Array.isArray(data.subtasks)) {
        const formatted = data.subtasks.map((st: any, idx: number) => ({
          id: `sub-${Date.now()}-${idx}`,
          title: st.title || 'Execute step',
          minutes: st.minutes || 15,
          completed: false,
          priority: st.priority || 'medium',
        }));

        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, subtasks: [...t.subtasks, ...formatted] } : t
          )
        );
      }
    } catch (err) {
      console.warn('AI breakdown local fallback:', err);
      const fallbackSteps = [
        { id: `sub-${Date.now()}-1`, title: `Outline technical constraints for ${task.title.slice(0, 20)}`, minutes: 15, completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Core implementation & test harness writeup', minutes: 30, completed: false },
        { id: `sub-${Date.now()}-3`, title: 'Stress test edge conditions & verify invariants', minutes: 20, completed: false },
      ];
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, subtasks: [...t.subtasks, ...fallbackSteps] } : t
        )
      );
    }
  };

  // Add Task with optional instant AI breakdown
  const handleAddTask = async (
    newTaskData: Omit<Task, 'id' | 'completed' | 'spentMinutes' | 'createdAt'> & { subtasks?: Task['subtasks'] },
    autoBreakdown: boolean = false
  ) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
      spentMinutes: 0,
      createdAt: new Date().toISOString(),
      subtasks: newTaskData.subtasks && newTaskData.subtasks.length > 0 ? newTaskData.subtasks : [],
    };

    if (autoBreakdown) {
      try {
        const res = await fetch('/api/ai/breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskTitle: newTask.title,
            taskDomain: newTask.domain,
            estimatedMinutes: newTask.estimatedMinutes,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.subtasks)) {
            newTask.subtasks = data.subtasks.map((st: any, idx: number) => ({
              id: `sub-${Date.now()}-${idx}`,
              title: st.title,
              minutes: st.minutes || 15,
              completed: false,
              priority: st.priority || 'medium',
            }));
          }
        }
      } catch (err) {
        console.warn('Auto breakdown fallback:', err);
      }
    }

    setTasks((prev) => [newTask, ...prev]);
  };

  // Focus Timer actions
  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    setActiveTab('focus');
  };

  const handleLogFocusSession = (minutes: number, taskId?: string) => {
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const nextSpent = (t.spentMinutes || 0) + minutes;
            return {
              ...t,
              spentMinutes: nextSpent,
              completed: nextSpent >= t.estimatedMinutes ? true : t.completed,
            };
          }
          return t;
        })
      );
    }
  };

  // Growth Arc milestone toggle
  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          const completedWeight = updatedMilestones
            .filter((m) => m.completed)
            .reduce((acc, m) => acc + m.weightPercent, 0);
          const computedHours = Math.round((completedWeight / 100) * g.targetVelocity);

          return {
            ...g,
            milestones: updatedMilestones,
            currentHours: Math.max(g.currentHours, computedHours),
          };
        }
        return g;
      })
    );
  };

  const handleAddGoal = (newGoal: GrowthGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  // Habit helper functions
  const calculateHabitStreak = (completedDates: string[]): number => {
    if (!completedDates || completedDates.length === 0) return 0;
    const set = new Set(completedDates);
    const today = getTodayDateString();
    let currentStreak = 0;
    let checkDate = new Date();

    if (set.has(today)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterday = checkDate.toISOString().split('T')[0];
      if (!set.has(yesterday)) {
        return 0;
      }
    }

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (set.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const handleToggleHabit = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDone = h.completedDates.includes(date);
          const newDates = isDone
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];

          const newStreak = calculateHabitStreak(newDates);
          const newBest = Math.max(h.bestStreak, newStreak);

          if (isDone) {
            sound.playClick();
          } else {
            sound.playCompletionChime();
          }

          if (currentUser?.id) {
            try {
              setDoc(doc(db, 'users', currentUser.id, 'habits', h.id), {
                id: h.id,
                title: h.title,
                domain: h.domain,
                completedDates: newDates,
                streak: newStreak,
                bestStreak: newBest,
                updatedAt: new Date().toISOString(),
              }, { merge: true }).catch(() => {});
            } catch {}
          }

          return {
            ...h,
            completedDates: newDates,
            streak: newStreak,
            bestStreak: newBest,
          };
        }
        return h;
      })
    );
  };

  const handleAddHabit = (
    newHabitData: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>
  ) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      userId: currentUser?.id,
    };
    setHabits((prev) => [newHabit, ...prev]);

    if (currentUser?.id) {
      try {
        setDoc(doc(db, 'users', currentUser.id, 'habits', newHabit.id), newHabit, { merge: true }).catch(() => {});
      } catch {}
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // AI Insights recalibration
  const handleRefreshAIInsight = async () => {
    const todayTasks = tasks.filter((t) => t.date === selectedDate);
    const completedCount = todayTasks.filter((t) => t.completed).length;
    const focusMinutes = todayTasks.reduce((acc, curr) => acc + (curr.spentMinutes || 0), 0);

    const domainStats: Record<string, number> = {};
    todayTasks.forEach((t) => {
      domainStats[t.domain] = (domainStats[t.domain] || 0) + 1;
    });

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak: streakCount,
          completedCount,
          totalCount: todayTasks.length,
          focusMinutes,
          domainStats,
        }),
      });

      if (!res.ok) throw new Error('Insights failed');
      const data = await res.json();
      if (data.insight) {
        setAiInsight({
          ...data.insight,
          timestamp: 'Updated just now',
        });
      }
    } catch (err) {
      console.warn('Insight fallback:', err);
      setAiInsight({
        headline: 'Momentum steady: cognitive baseline sustained.',
        suggestion: 'Prioritize single-threaded execution on the primary engineering milestone.',
        velocityIndex: 92,
        sentiment: 'peak',
        timestamp: 'Updated just now',
      });
    }
  };

  // Settings helpers
  const handleResetData = () => {
    const resetTasks = getInitialTasks();
    setTasks(resetTasks);
    setGoals(INITIAL_GOALS);
    setHabits(INITIAL_HABITS);
    setDays(INITIAL_DAYS);
    setAiInsight(INITIAL_AI_INSIGHT);
    setStreakCount(14);
    loadMediaAssets();
  };

  const handleExportJson = () => {
    const exportData = {
      platform: 'Tracker Growth Platform',
      exportDate: new Date().toISOString(),
      user: currentUser,
      streakCount,
      tasks,
      goals,
      habits,
      days,
      mediaAssets,
      aiInsight,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-growth-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export tasks history and goal progress as CSV for external analysis
  const handleExportCsv = () => {
    sound.playClick();
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines: string[] = [];

    // Header Metadata
    lines.push(escapeCsv('TRACKER GROWTH PLATFORM - TASK HISTORY & GOAL PROGRESS AUDIT'));
    lines.push(`${escapeCsv('Generated At')},${escapeCsv(new Date().toISOString())}`);
    lines.push(`${escapeCsv('User Account')},${escapeCsv(currentUser?.email || 'Demo User')}`);
    lines.push(`${escapeCsv('Active Streak')},${escapeCsv(`${streakCount} days`)}`);
    lines.push('');

    // SECTION 1: TASK & CHECKPOINT EXECUTION HISTORY
    lines.push(escapeCsv('=== SECTION 1: TASK & CHECKPOINT EXECUTION HISTORY ==='));
    lines.push([
      'Task ID',
      'Execution Date',
      'Task Title',
      'Domain',
      'Priority',
      'Status',
      'Estimated Minutes',
      'Actual Spent Minutes',
      'Subtasks Count',
      'Subtasks Completed',
      'Subtasks Detail',
      'Linked Goal ID',
      'Created Timestamp'
    ].join(','));

    tasks.forEach((t) => {
      const subTotal = t.subtasks?.length || 0;
      const subDone = t.subtasks?.filter((s) => s.completed).length || 0;
      const subDetails = (t.subtasks || [])
        .map((s) => `[${s.completed ? 'COMPLETED' : 'PENDING'}] ${s.title} (${s.minutes} min)`)
        .join('; ');

      lines.push([
        escapeCsv(t.id),
        escapeCsv(t.date),
        escapeCsv(t.title),
        escapeCsv(t.domain),
        escapeCsv(t.priority),
        escapeCsv(t.completed ? 'Completed' : 'Pending'),
        escapeCsv(t.estimatedMinutes),
        escapeCsv(t.spentMinutes || 0),
        escapeCsv(subTotal),
        escapeCsv(subDone),
        escapeCsv(subDetails),
        escapeCsv(t.linkedGoalId || 'None'),
        escapeCsv(t.createdAt)
      ].join(','));
    });

    lines.push('');
    // SECTION 2: GROWTH GOALS & OKR PROGRESSION
    lines.push(escapeCsv('=== SECTION 2: GROWTH GOALS & OKR PROGRESSION ==='));
    lines.push([
      'Goal ID',
      'Quarter',
      'Goal Title',
      'Domain',
      'Target Velocity (Hours)',
      'Current Spent Hours',
      'Completion Velocity (%)',
      'Total Milestones',
      'Completed Milestones',
      'Milestones Breakdown',
      'Strategic Rationale'
    ].join(','));

    goals.forEach((g) => {
      const totalMs = g.milestones?.length || 0;
      const doneMs = g.milestones?.filter((m) => m.completed).length || 0;
      const pct = Math.round((g.currentHours / (g.targetVelocity || 1)) * 100);
      const msList = (g.milestones || [])
        .map((m) => `[${m.completed ? 'ACHIEVED' : 'IN_PROGRESS'}] ${m.title} (Target: ${m.targetDate})`)
        .join('; ');

      lines.push([
        escapeCsv(g.id),
        escapeCsv(g.quarter),
        escapeCsv(g.title),
        escapeCsv(g.domain),
        escapeCsv(g.targetVelocity),
        escapeCsv(g.currentHours),
        escapeCsv(`${pct}%`),
        escapeCsv(totalMs),
        escapeCsv(doneMs),
        escapeCsv(msList),
        escapeCsv(g.strategicRationale || '')
      ].join(','));
    });

    lines.push('');
    // SECTION 3: DAILY HABITS & RECURRING STREAKS
    lines.push(escapeCsv('=== SECTION 3: DAILY HABITS & RECURRING STREAKS ==='));
    lines.push([
      'Habit ID',
      'Habit Title',
      'Domain',
      'Target Minutes',
      'Current Streak (Days)',
      'Best Streak (Days)',
      'Total Days Completed',
      'Completed Dates List',
      'Description'
    ].join(','));

    habits.forEach((h) => {
      lines.push([
        escapeCsv(h.id),
        escapeCsv(h.title),
        escapeCsv(h.domain),
        escapeCsv(h.targetMinutes || 0),
        escapeCsv(`${h.streak} days`),
        escapeCsv(`${h.bestStreak} days`),
        escapeCsv(h.completedDates.length),
        escapeCsv(h.completedDates.join('; ')),
        escapeCsv(h.description || '')
      ].join(','));
    });

    const csvOutput = lines.join('\r\n');
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-growth-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playCompletionChime();
  };

  // Domain counts for sidebar
  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  const domainCounts: Record<string, number> = {};
  todayTasks.forEach((t) => {
    domainCounts[t.domain] = (domainCounts[t.domain] || 0) + 1;
  });

  // Attached IDs for current picker
  const currentlyAttachedIds = attachTarget
    ? attachTarget.type === 'task'
      ? tasks.find((t) => t.id === attachTarget.id)?.attachedMediaIds || []
      : goals.find((g) => g.id === attachTarget.id)?.attachedMediaIds || []
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas-bg)] text-[var(--text-primary)] transition-colors">
      <div className="flex flex-col flex-1 w-full">
        {/* Strict Top Bar Contract Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          setIsDark={setIsDark}
          onOpenAddTask={() => setIsAddTaskModalOpen(true)}
          streakCount={streakCount}
          user={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileDrawerOpen(true)}
          onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
        />

        {/* Main Workspace Frame */}
        <div className="flex-1 flex w-full">
          {/* Left Navigation Sidebar (Desktop viewports > 1024px) */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedDomain={selectedDomain}
            setSelectedDomain={setSelectedDomain}
            domainCounts={domainCounts}
            totalCompletedToday={todayTasks.filter((t) => t.completed).length}
            totalTasksToday={todayTasks.length}
            mediaCount={mediaAssets.length}
            currentUser={currentUser}
            onOpenAndroidInstall={() => setIsAndroidModalOpen(true)}
          />

          {/* View Routing */}
          <main className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-8">
            {activeTab === 'today' && (
              <ExecutionBoard
                tasks={tasks}
                days={days}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                streakCount={streakCount}
                aiInsight={aiInsight}
                onRefreshAIInsight={handleRefreshAIInsight}
                onToggleTask={handleToggleTask}
                onToggleSubtask={handleToggleSubtask}
                onStartFocus={handleStartFocus}
                onDeconstructWithAI={handleDeconstructWithAI}
                onDeleteTask={handleDeleteTask}
                onAddSubtask={handleAddSubtask}
                onOpenAddTask={() => setIsAddTaskModalOpen(true)}
                selectedDomain={selectedDomain}
                setSelectedDomain={setSelectedDomain}
                goals={goals}
                onNavigateToTab={setActiveTab}
                allMedia={mediaAssets}
                onOpenAttachmentPicker={(task) =>
                  setAttachTarget({ type: 'task', id: task.id, title: task.title })
                }
                onAddExtractedTask={(task) => handleAddTask(task, false)}
                habits={habits}
                onToggleHabit={handleToggleHabit}
                onAddHabit={handleAddHabit}
                onDeleteHabit={handleDeleteHabit}
                onReorderTasks={handleReorderTasks}
              />
            )}

            {activeTab === 'trajectory' && (
              <GrowthTrajectory
                goals={goals}
                onToggleMilestone={handleToggleMilestone}
                onAddGoal={handleAddGoal}
                allMedia={mediaAssets}
                onOpenAttachmentPicker={(goal) =>
                  setAttachTarget({ type: 'goal', id: goal.id, title: goal.title })
                }
              />
            )}

            {activeTab === 'focus' && (
              <DeepWorkChamber
                tasks={tasks.filter((t) => t.date === selectedDate)}
                activeTask={activeFocusTask}
                onSelectActiveTask={setActiveFocusTask}
                onLogFocusSession={handleLogFocusSession}
              />
            )}

            {activeTab === 'chat' && (
              <GeminiChatView
                onAddExtractedTask={(task) => handleAddTask(task, false)}
                onNavigateToBoard={() => setActiveTab('today')}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'voice' && (
              <VoiceChamberView
                onAddExtractedTask={(task) => handleAddTask(task, false)}
              />
            )}

            {activeTab === 'cms' && (
              <MediaCMSView
                assets={mediaAssets}
                onUploadAsset={handleUploadMedia}
                onDeleteAsset={handleDeleteMedia}
                onUpdateAsset={handleUpdateMedia}
                tasks={tasks}
                goals={goals}
                onAttachToTask={handleAttachToTask}
                onAttachToGoal={handleAttachToGoal}
              />
            )}

            {activeTab === 'audit' && (
              <StrategicAudit
                tasks={tasks}
                days={days}
                aiInsight={aiInsight}
                onRefreshAIInsight={handleRefreshAIInsight}
                streakCount={streakCount}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboardView
                currentUser={currentUser}
                authToken={authToken}
                tasks={tasks}
                setTasks={setTasks}
                goals={goals}
                setGoals={setGoals}
                mediaAssets={mediaAssets}
                setMediaAssets={setMediaAssets}
                onNavigateToBoard={() => setActiveTab('today')}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <SettingsView
                  isDark={isDark}
                  setIsDark={setIsDark}
                  targetDailyHours={targetDailyHours}
                  setTargetDailyHours={setTargetDailyHours}
                  soundEnabled={soundEnabled}
                  setSoundEnabled={setSoundEnabled}
                  onResetData={handleResetData}
                  onExportJson={handleExportJson}
                  onExportCsv={handleExportCsv}
                />
                <ReviewsSection />
              </div>
            )}

            {/* Custom 404 Not Found Fallback */}
            {!['today', 'trajectory', 'focus', 'chat', 'voice', 'cms', 'audit', 'admin', 'settings'].includes(activeTab) && (
              <NotFoundView onGoHome={() => setActiveTab('today')} />
            )}

            {/* Clean Footer with PDF Checklist Verified Links */}
            <footer className="mt-auto pt-8 pb-4 px-3 sm:px-6 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#111A2C] border border-[#8296FF]/40 flex items-center justify-center p-0.5 shrink-0">
                    <img src="/logo.svg" alt="Tracker Growth" className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[var(--text-primary)]">Tracker Growth</span>
                  <span>·</span>
                  <span className="hidden xs:inline">Fast offline-ready productivity</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 font-medium">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsAndroidModalOpen(true);
                    }}
                    className="text-[#8296FF] hover:underline transition-colors flex items-center gap-1 font-semibold"
                  >
                    <span>📱 Android APK</span>
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsFAQModalOpen(true);
                    }}
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    FAQ
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsPrivacyModalOpen(true);
                    }}
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    Privacy Policy
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsThankYouModalOpen(true);
                    }}
                    className="text-[#35C99A] hover:underline transition-colors flex items-center gap-1"
                  >
                    <span>✓ Launch Verified</span>
                  </button>
                </div>
              </div>
            </footer>
          </main>
        </div>

        {/* Floating Glass Mobile Bottom Dock (Mobile & Tablet) */}
        <BottomDock activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        selectedDate={selectedDate}
        goals={goals}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* User Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={currentUser}
        onUpdateUser={setCurrentUser}
        onLogout={handleLogout}
        token={authToken}
      />

      {/* Android Install & Direct APK Download Modal */}
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* FAQ & Help Modal */}
      <FAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Verified Launch / Confirmation Modal (Noindex) */}
      <ThankYouModal
        isOpen={isThankYouModalOpen}
        onClose={() => setIsThankYouModalOpen(false)}
        title="15/15 Launch Checklist Completed"
        message="All 15 checklist criteria from the launch audit have been implemented and verified: Custom 404, robots.txt, sitemap.xml, rate limiting + honeypot, Open Graph + Twitter cards, verified Gmail auth, clean words, and Android APK packaging."
      />

      {/* GA4 & Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Media Attachment Picker Modal */}
      {attachTarget && (
        <MediaAttachmentPicker
          isOpen={!!attachTarget}
          onClose={() => setAttachTarget(null)}
          title={attachTarget.title}
          assets={mediaAssets}
          attachedIds={currentlyAttachedIds}
          onToggleAttach={(assetId) => {
            if (attachTarget.type === 'task') {
              handleAttachToTask(attachTarget.id, assetId);
            } else {
              handleAttachToGoal(attachTarget.id, assetId);
            }
          }}
        />
      )}

      {/* Global Floating Quick-Access Gemini Co-Pilot Drawer */}
      <QuickGeminiDrawer
        onAddExtractedTask={(task) => handleAddTask(task, false)}
        currentUser={currentUser}
        onNavigateToFullChat={() => setActiveTab('chat')}
      />
    </div>
  );
}
