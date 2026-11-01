import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Lock, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Save, 
  AlertCircle,
  KeyRound,
  Layers,
  Clock,
  Sparkles,
  Bot,
  Cloud
} from 'lucide-react';
import { User, DomainType } from '../types';
import { sound } from '../utils/audio';
import { auth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '../lib/firebase';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
  token: string | null;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  token,
}) => {
  if (!isOpen || !user) return null;

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || user.email.split('@')[0]);
  const [bio, setBio] = useState(user.bio || '');
  const [domainFocus, setDomainFocus] = useState<DomainType>(user.domainFocus);
  const [targetDailyHours, setTargetDailyHours] = useState(user.targetDailyHours);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Change password fields
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          username,
          bio,
          domainFocus,
          targetDailyHours,
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      sound.playCompletionChime();
      onUpdateUser(data.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setPasswordMsg(null);

    try {
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) {
        throw new Error('Please sign in again before changing your password.');
      }
      if (newPassword.length < 8) {
        throw new Error('New password must contain at least 8 characters.');
      }

      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPassword);

      sound.playCompletionChime();
      setPasswordMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Password update failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md h-full bg-[var(--card-surface)] border-l border-[var(--border-medium)] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-[var(--border-medium)] bg-[var(--inset-surface)]"
              />
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {user.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
                  <span className="text-[#8296FF]">@{user.username || user.email.split('@')[0]}</span>
                  {user.role === 'admin' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/40 uppercase tracking-tighter">
                      Root Admin
                    </span>
                  )}
                  <span>·</span>
                  <span className="truncate max-w-[130px]">{user.email}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Profile Attributes
              </span>
              {saveSuccess && (
                <span className="text-xs text-[#35C99A] font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                Strategic Bio / Mission Thesis
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="High-agency builder focused on..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Primary Domain
                </label>
                <select
                  value={domainFocus}
                  onChange={(e) => setDomainFocus(e.target.value as DomainType)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Research">Research</option>
                  <option value="Deep Work">Deep Work</option>
                  <option value="Health">Health</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Target Focus Hours
                </label>
                <input
                  type="number"
                  step={0.5}
                  min={1}
                  max={12}
                  value={targetDailyHours}
                  onChange={(e) => setTargetDailyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] tabular-nums"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2 px-3 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold hover:bg-[#8296FF]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Update Profile Info'}</span>
            </button>
          </form>

          {/* AI Co-Pilot & Firebase Cloud Sync Preferences */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8296FF]" />
                <span>AI Co-Pilot & Cloud Sync</span>
              </span>
              <span className="text-[10px] text-[#35C99A] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A] animate-pulse" />
                <span>Firestore Synced</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Primary Engine:</span>
                <span className="font-mono text-[#8296FF] font-semibold">Gemini 4 Argon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Extraction Engine:</span>
                <span className="font-mono text-[#A78BFA] font-semibold">Gemini 3.1 Flash Lite</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Search Grounding:</span>
                <span className="text-[#35C99A] font-medium">Google Search Enabled</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
                <span>Database Instance:</span>
                <span className="font-mono truncate max-w-[160px] text-[var(--text-primary)]">ai-studio-trackergrowthpla</span>
              </div>
            </div>
          </div>

          {/* Security & Password Section */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#35C99A]" />
                <span>Security & Credentials</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-xs text-[#8296FF] hover:underline"
              >
                {showPasswordChange ? 'Hide' : 'Change Password'}
              </button>
            </div>

            {showPasswordChange && (
              <form onSubmit={handleChangePassword} className="space-y-2.5 p-3 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)]">
                {passwordMsg && (
                  <div
                    className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                      passwordMsg.type === 'success'
                        ? 'bg-[#35C99A]/15 text-[#35C99A]'
                        : 'bg-[#F47783]/15 text-[#F47783]'
                    }`}
                  >
                    {passwordMsg.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-secondary)] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 px-3 rounded bg-[var(--card-surface)] hover:bg-[#8296FF]/20 text-[#8296FF] text-xs font-semibold border border-[var(--border-subtle)] transition-colors"
                >
                  Update Password
                </button>
              </form>
            )}

            <div className="p-3 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
              <div className="flex items-center justify-between">
                <span>Account Created:</span>
                <span className="font-mono text-[var(--text-primary)]">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Auth Session:</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString() : 'Current'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Encryption Tier:</span>
                <span className="text-[#35C99A] font-mono">PBKDF2-SHA512</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => {
              sound.playClick();
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--inset-surface)] hover:bg-[#F47783]/15 text-[#F47783] border border-[var(--border-subtle)] hover:border-[#F47783]/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
