import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Sparkles,
  AtSign
} from 'lucide-react';
import { User, DomainType } from '../types';
import { sound } from '../utils/audio';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  db, 
  doc, 
  setDoc 
} from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  const [identifier, setIdentifier] = useState(''); // Verified Gmail ID
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [domainFocus, setDomainFocus] = useState<DomainType>('Engineering');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [honeypot, setHoneypot] = useState(''); // PDF Checklist Item 10: Honeypot spam defense
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 25;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  // Sign in with Google / Gmail ID via Firebase Auth popup
  const handleGoogleSignIn = async () => {
    sound.playClick();
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || 'user@gmail.com',
        username: (fbUser.email ? fbUser.email.split('@')[0] : 'google_user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        name: fbUser.displayName || 'Google Architect',
        avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}`,
        domainFocus: 'Engineering',
        bio: 'Authenticated via Google / Gmail ID with real-time cloud persistence.',
        targetDailyHours: 4.5,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Upsert user profile to Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          ...appUser,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Firestore profile sync note:', dbErr);
      }

      // Exchange a verified Firebase ID token for an application session.
      const idToken = await fbUser.getIdToken();
      const syncRes = await fetch('/api/auth/sync-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: fbUser.displayName, avatarUrl: fbUser.photoURL }),
      });
      const syncData = await syncRes.json();
      if (!syncRes.ok) throw new Error(syncData.error || 'Could not establish an application session.');

      sound.playCompletionChime();
      onAuthSuccess(syncData.token, syncData.user);
      onClose();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, identifier.trim(), password);
        const fbUser = credential.user;
        const idToken = await fbUser.getIdToken();
        const syncRes = await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ name: fbUser.displayName, avatarUrl: fbUser.photoURL }),
        });
        const data = await syncRes.json();
        if (!syncRes.ok) throw new Error(data.error || 'Could not establish an application session.');

        sound.playCompletionChime();
        onAuthSuccess(data.token, data.user);
        onClose();
      } else if (mode === 'register') {
        if (password.length < 8) throw new Error('Password must contain at least 8 characters.');
        if (!email.toLowerCase().endsWith('@gmail.com')) {
          throw new Error('Please use a valid Gmail address ending in @gmail.com.');
        }
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = credential.user;
        await updateProfile(fbUser, { displayName: name });
        await sendEmailVerification(fbUser);
        const appUser: User = {
          id: fbUser.uid,
          email: fbUser.email || email.trim(),
          username: username || (fbUser.email ? fbUser.email.split('@')[0] : 'user').toLowerCase().replace(/[^a-z0-9_-]/g, ''),
          name: fbUser.displayName || name,
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}`,
          domainFocus,
          bio: '',
          targetDailyHours: 4.5,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(doc(db, 'users', fbUser.uid), { ...appUser, updatedAt: new Date().toISOString() }, { merge: true });
        } catch (dbErr) {
          console.warn('Firestore profile sync note:', dbErr);
        }
        const idToken = await fbUser.getIdToken();
        const syncRes = await fetch('/api/auth/sync-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify(appUser),
        });
        const data = await syncRes.json();
        if (!syncRes.ok) throw new Error(data.error || 'Could not establish an application session.');
        sound.playCompletionChime();
        onAuthSuccess(data.token, data.user);
        onClose();
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, identifier.trim());
        setSuccessMsg('Password reset instructions have been sent to the registered email address, if an account exists.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(mode === 'reset' ? newPassword : password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8296FF]/15 border border-[#8296FF]/30 flex items-center justify-center text-[#8296FF]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {mode === 'login' && 'Log In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
                {mode === 'reset' && 'Set New Password'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Tracker Growth · Secure Login with Verified Gmail
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--inset-surface)] rounded-xl mt-4 border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('login');
                setError(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('register');
                setError(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1-Click Google / Gmail Sign-In Button */}
        {(mode === 'login' || mode === 'register') && (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF]/40 text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2.5 shadow-xs group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">
                or enter your Gmail &amp; password
              </span>
              <div className="flex-1 h-px bg-[var(--border-subtle)]" />
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#F47783]/15 border border-[#F47783]/30 text-xs text-[#F47783] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs text-[#35C99A] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{successMsg}</span>
              {mode === 'forgot' && resetToken && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="block mt-1 font-semibold underline text-[#35C99A]"
                >
                  Proceed to Reset Password Form →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Forms */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3.5">
          {/* Honeypot anti-spam hidden field (PDF checklist item 10) */}
          <input
            type="text"
            name="website_hp"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Username *
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="Choose a username"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Verified Gmail Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Main Focus Area
                </label>
                <select
                  value={domainFocus}
                  onChange={(e) => setDomainFocus(e.target.value as DomainType)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                >
                  <option value="Engineering">Software &amp; Engineering</option>
                  <option value="Research">Study &amp; Research</option>
                  <option value="Deep Work">Deep Work &amp; Focus</option>
                  <option value="Health">Health &amp; Fitness</option>
                  <option value="Academic">General Learning</option>
                </select>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Verified Gmail ID *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Registered Gmail Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="email"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] text-[#8296FF] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              {/* Password strength meter on register */}
              {mode === 'register' && password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-mono">
                    <span>Password Security</span>
                    <span>{strength <= 25 ? 'Weak' : strength <= 50 ? 'Moderate' : strength <= 75 ? 'Good' : 'Strong'}</span>
                  </div>
                  <div className="h-1 w-full bg-[var(--inset-surface)] rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${strength}%`,
                        backgroundColor: strength <= 25 ? '#F47783' : strength <= 50 ? '#F5B85C' : '#35C99A',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Recovery Token *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste recovery token"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-mono rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold hover:bg-[#8296FF]/90 transition-all active:scale-[0.98] shadow-md shadow-[#8296FF]/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isLoading && <Sparkles className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {mode === 'login' && 'Log In with Verified Gmail'}
                {mode === 'register' && 'Create Verified Account'}
                {mode === 'forgot' && 'Send Recovery Email'}
                {mode === 'reset' && 'Confirm Password Change'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {mode === 'forgot' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setMode('login');
                  setError(null);
                }}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ← Back to Login
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
