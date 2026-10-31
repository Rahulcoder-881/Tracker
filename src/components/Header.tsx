import React from 'react';
import { Sparkles, Sun, Moon, Plus, Flame, User as UserIcon, Smartphone } from 'lucide-react';
import { sound } from '../utils/audio';
import { User } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenAddTask: () => void;
  streakCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenAndroidInstall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenAddTask,
  streakCount,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenAndroidInstall,
}) => {
  const isAdmin = user?.role === 'admin' || user?.username === 'dharamveersharma8809' || user?.email === 'dharamveersharma8809@gmail.com';

  const navItems = [
    { id: 'today', label: 'Tasks' },
    { id: 'chat', label: 'AI Assistant' },
    { id: 'trajectory', label: 'Goals' },
    { id: 'focus', label: 'Focus Timer' },
    { id: 'settings', label: 'Settings' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin' }] : []),
  ];

  const handleTabClick = (id: string) => {
    sound.playClick();
    setActiveTab(id);
  };

  const handleThemeToggle = () => {
    sound.playClick();
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 border-b border-[var(--border-subtle)] bg-[var(--canvas-bg)]/90 backdrop-blur-md transition-colors">
      {/* Zone 1: Brand logo mark & wordmark */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => handleTabClick('today')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-[#111A2C] border border-[#8296FF]/40 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
              <path d="M 6 22 L 13 15 L 18 19 L 26 9" stroke="#8296FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 20 9 H 26 V 15" stroke="#8296FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="26" cy="9" r="2.5" fill="#35C99A" />
            </svg>
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap block leading-tight">
              Tracker<span className="text-[#8296FF]">Growth</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] font-medium hidden xs:flex items-center gap-1.5 leading-none mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A]" />
              <span>Daily Focus &amp; Goals</span>
            </span>
          </div>
        </button>

        {/* Daily Streak Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[#8296FF] tabular-nums">
          <Flame className="w-3.5 h-3.5 text-[#F5B85C] fill-[#F5B85C]" />
          <span>{streakCount}d Streak</span>
        </div>
      </div>

      {/* Zone 2: Navigation links (Desktop viewports >= 1024px) */}
      <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-[var(--text-secondary)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 relative ${
                isActive
                  ? 'text-[var(--text-primary)] font-semibold'
                  : 'hover:text-[var(--text-primary)]'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8296FF] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Android App Button, Theme, Profile, and Add Task */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Android App & APK Download Button */}
        {onOpenAndroidInstall && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenAndroidInstall();
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-[#35C99A]/15 hover:bg-[#35C99A]/25 border border-[#35C99A]/30 text-xs font-bold text-[#35C99A] transition-all shadow-xs"
            title="Download Android APK or Install App"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android APK</span>
            <span className="sm:hidden text-[11px]">APK</span>
          </button>
        )}

        <button
          onClick={handleThemeToggle}
          aria-label="Toggle theme mode"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5B85C]" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8296FF]" />}
        </button>

        {user ? (
          <button
            onClick={() => {
              sound.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all group"
            title="Manage profile & credentials"
          >
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
              alt={user.name}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[var(--border-subtle)]"
            />
            <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#8296FF] max-w-[80px] truncate hidden md:inline">
              {user.name.split(' ')[0]}
            </span>
            {isAdmin && (
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/40 uppercase tracking-tighter hidden sm:inline">
                Admin
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-[#8296FF]" />
            <span className="hidden xs:inline">Log In</span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            onOpenAddTask();
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] font-bold text-xs sm:text-sm tracking-tight transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden text-xs">Add</span>
        </button>
      </div>
    </header>
  );
};
