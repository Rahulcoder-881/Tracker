import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  TrendingUp, 
  Image as ImageIcon, 
  Settings, 
  Activity, 
  KeyRound, 
  Trash2, 
  Edit3, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Search, 
  Cpu, 
  Globe, 
  Clock, 
  Database,
  Lock,
  UserCheck,
  ShieldAlert,
  Server,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { User, Task, GrowthGoal, MediaAsset, DomainType, PriorityType, AuditLogEntry, SystemConfig } from '../types';
import { sound } from '../utils/audio';

interface AdminDashboardViewProps {
  currentUser: User | null;
  authToken: string | null;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  goals: GrowthGoal[];
  setGoals: React.Dispatch<React.SetStateAction<GrowthGoal[]>>;
  mediaAssets: MediaAsset[];
  setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  onNavigateToBoard: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  authToken,
  tasks,
  setTasks,
  goals,
  setGoals,
  mediaAssets,
  setMediaAssets,
  onNavigateToBoard,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tasks' | 'goals' | 'media' | 'engine' | 'audit'>('overview');
  
  // Admin Data State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    defaultModel: 'gemini-3.8-flash',
    searchGroundingEnabled: true,
    maintenanceMode: false,
    announcement: 'Platform active under Root Admin governance.',
    systemCapacityTarget: 5.0,
    lastUpdated: new Date().toISOString(),
  });
  const [stats, setStats] = useState<{
    totalUsers: number;
    activeSessions: number;
    totalMedia: number;
    auditEventsCount: number;
    uptimeSeconds: number;
    systemStatus: string;
  }>({
    totalUsers: 1,
    activeSessions: 1,
    totalMedia: mediaAssets.length,
    auditEventsCount: 0,
    uptimeSeconds: 0,
    systemStatus: 'Operational',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals & Dialog State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');

  // Form state for creating user
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [newUserDomain, setNewUserDomain] = useState<DomainType>('Engineering');

  // Filter state for users
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Filter state for tasks
  const [taskSearch, setTaskSearch] = useState('');
  const [taskDomainFilter, setTaskDomainFilter] = useState<string>('All');

  // Fetch admin overview, users, and audit logs
  const fetchAdminData = async () => {
    if (!authToken) return;
    setIsLoading(true);
    setActionError(null);

    const headers = { Authorization: `Bearer ${authToken}` };

    try {
      const [ovRes, usRes, logRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setStats(ovData.stats);
        if (ovData.config) setSystemConfig(ovData.config);
      }
      if (usRes.ok) {
        const usData = await usRes.json();
        setUsersList(usData.users || []);
      }
      if (logRes.ok) {
        const logData = await logRes.json();
        setAuditLogs(logData.logs || []);
      }
    } catch (err: any) {
      console.warn('Admin fetch error:', err);
      setActionError('Could not sync administrative telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [authToken]);

  // Show temporary flash notification
  const triggerSuccess = (msg: string) => {
    sound.playCompletionChime();
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // User Management Actions
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!authToken) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName,
          username: newUserUsername,
          password: newUserPassword,
          role: newUserRole,
          domainFocus: newUserDomain,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setUsersList((prev) => [data.user, ...prev]);
      setIsAddUserOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserUsername('');
      setNewUserPassword('');
      triggerSuccess(`User @${data.user.username} successfully registered with ${data.user.role} role.`);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!authToken || !editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? data.user : u)));
      setIsEditUserOpen(false);
      triggerSuccess(`Updated attributes for @${data.user.username}.`);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!authToken || !resetTargetUser || !newPasswordValue) return;

    try {
      const res = await fetch(`/api/admin/users/${resetTargetUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ newPassword: newPasswordValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setIsResetPassOpen(false);
      setNewPasswordValue('');
      triggerSuccess(`Password for @${resetTargetUser.username} has been overridden.`);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (user: User) => {
    sound.playClick();
    if (!authToken) return;
    if (user.username === 'dharamveersharma8809') {
      alert('Root Administrator account cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete user @${user.username} (${user.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      setUsersList((prev) => prev.filter((u) => u.id !== user.id));
      triggerSuccess(`User @${user.username} deleted.`);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user');
    }
  };

  // System Configuration Save
  const handleSaveSystemConfig = async () => {
    sound.playClick();
    if (!authToken) return;

    try {
      const res = await fetch('/api/admin/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(systemConfig),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save system config');

      setSystemConfig(data.config);
      triggerSuccess('Global engine parameters updated across platform.');
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to save config');
    }
  };

  // Clear session cache
  const handleClearCache = async () => {
    sound.playClick();
    if (!authToken) return;
    if (!confirm('Purge all active user sessions?')) return;

    try {
      const res = await fetch('/api/admin/maintenance/clear-cache', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear cache');

      triggerSuccess(data.message || 'Session cache purged.');
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to clear cache');
    }
  };

  // Filtered lists
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesDomain = taskDomainFilter === 'All' || t.domain === taskDomainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 overflow-y-auto space-y-6">
      {/* Root Admin Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#172338] via-[#0B1020] to-[#172338] border border-[#8296FF]/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8296FF] to-[#35C99A] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center text-[#8296FF]">
                <ShieldCheck className="w-6 h-6 text-[#35C99A]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Root Governance Dashboard
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/30">
                  ROOT ACTIVE
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                Administrator: <span className="text-[#8296FF] font-semibold">{currentUser?.email || "Verified administrator"}</span> · Full Administrative Oversight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                fetchAdminData();
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-all"
              title="Refresh administrative data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleClearCache}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F47783]/10 hover:bg-[#F47783]/20 border border-[#F47783]/30 text-xs font-semibold text-[#F47783] transition-all"
              title="Flush session cache"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Purge Cache</span>
            </button>
          </div>
        </div>

        {/* Global Announcement Alert Bar */}
        {systemConfig.announcement && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#8296FF]/10 border border-[#8296FF]/25 text-xs text-[#bac3ff] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8296FF] shrink-0" />
            <span className="font-medium">{systemConfig.announcement}</span>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-[#F5B85C]/10 border border-[#F5B85C]/25 text-xs text-[var(--text-secondary)]">
        <strong className="text-[var(--text-primary)]">Firebase account governance:</strong> Create accounts, send password resets, and delete accounts through Firebase Authentication. Admin access is controlled by the Cloud Run <code>ADMIN_EMAILS</code> allowlist. Server-side governance telemetry is currently in-memory and is not durable across Cloud Run restarts or instances.
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs text-[#35C99A] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-[#F47783]/15 border border-[#F47783]/30 text-xs text-[#F47783] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#F47783] font-bold">×</button>
        </div>
      )}

      {/* Administrative Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-subtle)]">
        {[
          { id: 'overview', label: 'Executive Overview', icon: Activity },
          { id: 'users', label: 'User Governance & RBAC', icon: Users, badge: `${usersList.length || 1}` },
          { id: 'tasks', label: 'Workspace Checkpoints', icon: CheckSquare, badge: `${tasks.length}` },
          { id: 'goals', label: 'Strategic OKRs', icon: TrendingUp, badge: `${goals.length}` },
          { id: 'media', label: 'Media Vault', icon: ImageIcon, badge: `${mediaAssets.length}` },
          { id: 'engine', label: 'AI Engine & Calibration', icon: Cpu },
          { id: 'audit', label: 'Security Audit Trail', icon: ShieldAlert, badge: `${auditLogs.length}` },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#8296FF] text-[#0B1020] shadow-sm'
                  : 'bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)] border border-[var(--border-subtle)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-[#0B1020]/20 text-[#0B1020]' : 'bg-[var(--inset-surface)] text-[var(--text-secondary)]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Users</span>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{usersList.length || 1}</div>
              <span className="text-[10px] text-[#35C99A] font-medium">1 Root Admin</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Active Sessions</span>
              <div className="text-2xl font-bold font-mono text-[#8296FF]">{stats.activeSessions || 1}</div>
              <span className="text-[10px] text-[var(--text-secondary)]">PBKDF2 Authenticated</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Checkpoints</span>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{tasks.length}</div>
              <span className="text-[10px] text-[#35C99A] font-medium">{tasks.filter((t) => t.completed).length} Completed</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Quarterly OKRs</span>
              <div className="text-2xl font-bold font-mono text-[#A78BFA]">{goals.length}</div>
              <span className="text-[10px] text-[var(--text-secondary)]">Active Trajectory</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Media Assets</span>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">{mediaAssets.length}</div>
              <span className="text-[10px] text-[#8296FF]">Diagrams & Figures</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-1">
              <span className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">System Uptime</span>
              <div className="text-2xl font-bold font-mono text-[#35C99A]">{Math.floor(stats.uptimeSeconds / 60)}m</div>
              <span className="text-[10px] text-[var(--text-secondary)]">Zero Downtime</span>
            </div>
          </div>

          {/* Quick Overseer Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8296FF]" />
                <span>Rapid User Administration</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Create new user accounts with direct role assignments or manage credentials.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register New User</span>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-3.5 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--card-surface)] transition-all"
                >
                  Manage Users ({usersList.length || 1}) →
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#A78BFA]" />
                <span>AI Governance & Routing Engine</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Primary Model: <span className="font-mono text-[#8296FF] font-semibold">{systemConfig.defaultModel}</span> · Search Grounding: <span className="text-[#35C99A] font-semibold">{systemConfig.searchGroundingEnabled ? 'Enabled' : 'Disabled'}</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveTab('engine')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--card-surface)] transition-all"
                >
                  <Settings className="w-3.5 h-3.5 text-[#8296FF]" />
                  <span>Calibrate AI Dispatch Matrix →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER GOVERNANCE & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Action & Filter Bar */}
          <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="user">Standard Users</option>
              </select>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--card-surface)]">
            <table className="w-full text-left text-xs text-[var(--text-secondary)]">
              <thead className="bg-[var(--inset-surface)] text-[11px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Domain Focus</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-xs text-[var(--text-secondary)]">
                      No users match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isRoot = u.username === 'dharamveersharma8809' || u.email === 'dharamveersharma8809@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-[var(--inset-surface)]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.name}`}
                              alt={u.name}
                              className="w-7 h-7 rounded-full border border-[var(--border-subtle)]"
                            />
                            <div>
                              <span className="font-semibold text-[var(--text-primary)] block leading-tight">
                                {u.name}
                              </span>
                              <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-[var(--text-primary)] font-medium">
                          @{u.username || 'user'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-[#8296FF]/20 text-[#8296FF] border border-[#8296FF]/30'
                              : 'bg-[var(--inset-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                          }`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-primary)]">
                          {u.domainFocus || 'Engineering'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.status === 'suspended'
                              ? 'bg-[#F47783]/20 text-[#F47783]'
                              : 'bg-[#35C99A]/20 text-[#35C99A]'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                sound.playClick();
                                setEditingUser({ ...u });
                                setIsEditUserOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#8296FF] hover:bg-[var(--card-surface)] transition-all"
                              title="Edit user details and role"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                sound.playClick();
                                setResetTargetUser(u);
                                setNewPasswordValue('');
                                setIsResetPassOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#A78BFA] hover:bg-[var(--card-surface)] transition-all"
                              title="Override user password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            {!isRoot && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#F47783] hover:bg-[var(--card-surface)] transition-all"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WORKSPACE CHECKPOINTS OVERSEER */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search across all checkpoints..."
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={taskDomainFilter}
                onChange={(e) => setTaskDomainFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                <option value="All">All Domains</option>
                <option value="Engineering">Engineering</option>
                <option value="Research">Research</option>
                <option value="Deep Work">Deep Work</option>
                <option value="Health">Health</option>
                <option value="Academic">Academic</option>
              </select>

              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToBoard();
                }}
                className="px-3 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all"
              >
                Open Execution Board →
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => {
                      sound.playClick();
                      setTasks((prev) =>
                        prev.map((item) => (item.id === t.id ? { ...item, completed: !item.completed } : item))
                      );
                    }}
                    className="w-4 h-4 accent-[#8296FF] rounded cursor-pointer"
                  />
                  <div className="truncate">
                    <span className={`text-xs font-semibold block truncate ${t.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-secondary)]">
                      <span className="font-mono text-[#8296FF]">{t.domain}</span>
                      <span>·</span>
                      <span className="font-mono">{t.estimatedMinutes}m est</span>
                      <span>·</span>
                      <span className="uppercase text-[10px] px-1.5 rounded bg-[var(--inset-surface)] font-semibold">{t.priority}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setTasks((prev) => prev.filter((item) => item.id !== t.id));
                    triggerSuccess(`Checkpoint "${t.title.slice(0, 30)}..." deleted.`);
                  }}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[#F47783] hover:bg-[var(--inset-surface)] transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STRATEGIC OKRS OVERSEER */}
      {activeTab === 'goals' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Strategic OKR & Growth Objectives</h3>
              <p className="text-xs text-[var(--text-secondary)]">Full administrative CRUD access over all trajectory targets.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                const newGoal: GrowthGoal = {
                  id: `goal-${Date.now()}`,
                  title: 'New Administrative Objective',
                  quarter: 'Q4 2026',
                  domain: 'Engineering',
                  targetVelocity: 120,
                  currentHours: 0,
                  strategicRationale: 'Added via Root Governance console.',
                  milestones: [
                    { id: `m-${Date.now()}-1`, title: 'Initial Architecture Scoping', targetDate: '2026-11-15', completed: false, weightPercent: 50 },
                    { id: `m-${Date.now()}-2`, title: 'Final Benchmark Verification', targetDate: '2026-12-15', completed: false, weightPercent: 50 },
                  ],
                };
                setGoals((prev) => [newGoal, ...prev]);
                triggerSuccess('Created new strategic OKR.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Strategic Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => (
              <div key={g.id} className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--inset-surface)] text-[#A78BFA] border border-[var(--border-subtle)]">
                      {g.quarter} · {g.domain}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1.5">{g.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setGoals((prev) => prev.filter((item) => item.id !== g.id));
                      triggerSuccess('Goal removed.');
                    }}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[#F47783]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{g.strategicRationale}</p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-secondary)]">Velocity Progress</span>
                    <span className="text-[#35C99A] font-bold">{g.currentHours} / {g.targetVelocity} hrs</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--inset-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8296FF] to-[#35C99A]"
                      style={{ width: `${Math.min(100, Math.round((g.currentHours / (g.targetVelocity || 1)) * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{g.milestones.length} Milestones</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      const addHours = Number(prompt(`Add hours logged to "${g.title}":`, '5'));
                      if (!isNaN(addHours) && addHours > 0) {
                        setGoals((prev) =>
                          prev.map((item) => (item.id === g.id ? { ...item, currentHours: item.currentHours + addHours } : item))
                        );
                        triggerSuccess(`Added ${addHours} hrs to goal.`);
                      }
                    }}
                    className="text-[#8296FF] hover:underline font-semibold"
                  >
                    + Log Hours
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: MEDIA CMS VAULT OVERSEER */}
      {activeTab === 'media' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Media Vault Overseer ({mediaAssets.length} Assets)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Administrative inspection of all architecture diagrams and benchmarks.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaAssets.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
                <div className="w-full h-36 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center p-2">
                  <img src={m.dataUrl} alt={m.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{m.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)] font-mono">
                    <span>{m.category}</span>
                    <span>·</span>
                    <span>{Math.round(m.sizeBytes / 1024)} KB</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{m.tags.join(', ')}</span>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMediaAssets((prev) => prev.filter((item) => item.id !== m.id));
                      triggerSuccess(`Asset "${m.name}" deleted.`);
                    }}
                    className="p-1 rounded text-[var(--text-secondary)] hover:text-[#F47783]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AI ENGINE & CALIBRATION */}
      {activeTab === 'engine' && (
        <div className="space-y-6 animate-in fade-in max-w-3xl">
          <div className="p-6 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#8296FF]" />
                <span>Global Gemini AI Dispatch & Engine Calibration</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Controls the routing threshold, model defaults, and external search grounding.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Default Inference Model
                </label>
                <select
                  value={systemConfig.defaultModel}
                  onChange={(e) => setSystemConfig({ ...systemConfig, defaultModel: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended: High-Velocity Strategic Reasoning)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Instant Task Extraction)</option>
                  <option value="gemini-4-argon">gemini-4-argon (Ultra Reasoning · Requires Paid Key)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#35C99A]" />
                    <span>Global Google Search Grounding</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Enable live citations and real-time technical indexing for queries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemConfig.searchGroundingEnabled}
                  onChange={(e) => setSystemConfig({ ...systemConfig, searchGroundingEnabled: e.target.checked })}
                  className="w-5 h-5 accent-[#35C99A] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#F5B85C]" />
                    <span>Maintenance Mode</span>
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">Restricts non-admin users to read-only execution view.</p>
                </div>
                <input
                  type="checkbox"
                  checked={systemConfig.maintenanceMode}
                  onChange={(e) => setSystemConfig({ ...systemConfig, maintenanceMode: e.target.checked })}
                  className="w-5 h-5 accent-[#F5B85C] rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Global System Announcement Banner
                </label>
                <input
                  type="text"
                  value={systemConfig.announcement}
                  onChange={(e) => setSystemConfig({ ...systemConfig, announcement: e.target.value })}
                  placeholder="Platform active under Root Admin governance..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <button
                onClick={handleSaveSystemConfig}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all shadow-md shadow-[#8296FF]/20"
              >
                Apply Engine Calibration Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SECURITY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Security & Governance Audit Trail</h3>
              <p className="text-xs text-[var(--text-secondary)]">Immutable records of authentication events, policy alterations, and model calls.</p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                const a = document.createElement('a');
                a.href = jsonContent;
                a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)]"
            >
              <Download className="w-3.5 h-3.5 text-[#8296FF]" />
              <span>Export Audit JSON</span>
            </button>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.severity === 'critical' ? 'bg-[#F47783] animate-ping' : log.severity === 'warn' ? 'bg-[#F5B85C]' : 'bg-[#35C99A]'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-[var(--text-primary)]">{log.action}</span>
                      <span className="text-[10px] text-[var(--text-secondary)] font-mono">by @{log.actor}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        log.severity === 'critical' ? 'bg-[#F47783]/20 text-[#F47783]' : log.severity === 'warn' ? 'bg-[#F5B85C]/20 text-[#F5B85C]' : 'bg-[#35C99A]/20 text-[#35C99A]'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-[var(--text-secondary)] font-mono block mt-1">Target: {log.target}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#8296FF]" />
              <span>Create New Platform User</span>
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="e.g. alex_dev"
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Email / Gmail Address *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">RBAC Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Domain Focus</label>
                  <select
                    value={newUserDomain}
                    onChange={(e) => setNewUserDomain(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Research">Research</option>
                    <option value="Deep Work">Deep Work</option>
                    <option value="Health">Health</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {isEditUserOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#8296FF]" />
              <span>Modify User @{editingUser.username}</span>
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Role</label>
                  <select
                    value={editingUser.role || 'user'}
                    disabled={editingUser.username === 'dharamveersharma8809'}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Status</label>
                  <select
                    value={editingUser.status || 'active'}
                    disabled={editingUser.username === 'dharamveersharma8809'}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Domain Focus</label>
                <select
                  value={editingUser.domainFocus}
                  onChange={(e) => setEditingUser({ ...editingUser, domainFocus: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Research">Research</option>
                  <option value="Deep Work">Deep Work</option>
                  <option value="Health">Health</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Target Daily Hours</label>
                <input
                  type="number"
                  step={0.5}
                  value={editingUser.targetDailyHours}
                  onChange={(e) => setEditingUser({ ...editingUser, targetDailyHours: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT PASSWORD RESET */}
      {isResetPassOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#A78BFA]" />
              <span>Override User Password</span>
            </h3>

            <p className="text-xs text-[var(--text-secondary)]">
              Direct root administrative override for <span className="font-semibold text-[#8296FF]">@{resetTargetUser.username}</span>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsResetPassOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#A78BFA] text-[#0B1020] text-xs font-bold hover:bg-[#A78BFA]/90"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
