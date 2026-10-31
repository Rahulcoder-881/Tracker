import React from 'react';
import { 
  CheckSquare, 
  TrendingUp, 
  Timer, 
  Activity, 
  Settings, 
  Layers, 
  Terminal, 
  BrainCircuit, 
  HeartPulse, 
  BookOpen,
  Sparkles,
  Image as ImageIcon,
  Bot,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';
import { DomainType, User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDomain: DomainType | 'All';
  setSelectedDomain: (d: DomainType | 'All') => void;
  domainCounts: Record<string, number>;
  totalCompletedToday: number;
  totalTasksToday: number;
  mediaCount?: number;
  currentUser?: User | null;
  onOpenAndroidInstall?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedDomain,
  setSelectedDomain,
  domainCounts,
  totalCompletedToday,
  totalTasksToday,
  mediaCount = 0,
  currentUser,
  onOpenAndroidInstall,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'dharamveersharma8809' || currentUser?.email === 'dharamveersharma8809@gmail.com';

  const mainNav = [
    { id: 'today', label: 'Daily Tasks', icon: CheckSquare, badge: `${totalCompletedToday}/${totalTasksToday}` },
    { id: 'trajectory', label: 'Growth Goals', icon: TrendingUp },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'chat', label: 'AI Assistant', icon: Bot, badge: 'Gemini' },
    { id: 'voice', label: 'Voice Assistant', icon: Radio, badge: 'Live' },
    { id: 'cms', label: 'Notes & Files', icon: ImageIcon, badge: `${mediaCount}` },
    { id: 'audit', label: 'Progress & Stats', icon: Activity },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, badge: 'ADMIN' }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const domains: { type: DomainType | 'All'; label: string; icon: any; color: string }[] = [
    { type: 'All', label: 'All Domains', icon: Layers, color: '#8296FF' },
    { type: 'Engineering', label: 'Engineering', icon: Terminal, color: '#8296FF' },
    { type: 'Research', label: 'Research', icon: BrainCircuit, color: '#A78BFA' },
    { type: 'Deep Work', label: 'Deep Work', icon: Timer, color: '#35C99A' },
    { type: 'Health', label: 'Health & Vitality', icon: HeartPulse, color: '#F5B85C' },
    { type: 'Academic', label: 'Academic', icon: BookOpen, color: '#bac3ff' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[var(--border-subtle)] bg-[var(--canvas-bg)] p-4 space-y-6">
      {/* Workspace Context Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
          Workspace
        </div>
        <nav className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#8296FF]/15 text-[#8296FF] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8296FF]' : 'text-[var(--text-secondary)]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)] bg-[var(--inset-surface)] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Focus Categories Section */}
      <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
        <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-secondary)] tracking-wider uppercase flex items-center justify-between">
          <span>Categories</span>
        </div>
        <div className="space-y-0.5">
          {domains.map((dom) => {
            const isSelected = selectedDomain === dom.type;
            const count = dom.type === 'All' ? totalTasksToday : (domainCounts[dom.type] || 0);

            return (
              <button
                key={dom.type}
                onClick={() => {
                  sound.playClick();
                  setSelectedDomain(dom.type);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isSelected
                    ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-medium border border-[var(--border-subtle)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)]/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: dom.color }}
                  />
                  <span className="truncate">{dom.label}</span>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Android Mobile App Card */}
      {onOpenAndroidInstall && (
        <div className="mt-auto p-3.5 rounded-xl border border-[#35C99A]/30 bg-[var(--card-surface)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)]">Android App</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#35C99A]/20 text-[#35C99A]">
              APK v1.0
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Use Tracker Growth locally on your phone with full offline support.
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onOpenAndroidInstall();
            }}
            className="w-full py-1.5 px-2.5 rounded-lg bg-[#35C99A] hover:bg-[#35C99A]/90 text-[#0B1020] text-xs font-bold transition-all text-center"
          >
            Install / Download APK
          </button>
        </div>
      )}
    </aside>
  );
};
