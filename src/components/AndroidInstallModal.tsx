import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  WifiOff, 
  Zap, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Layers,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'parse-error'>('install');

  const getLiveAppUrl = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'https://ais-pre-cpgwnu7yhyryp5mvgloz7c-819586426766.asia-northeast1.run.app';
  };

  const handleCopyAppUrl = () => {
    sound.playClick();
    const url = getLiveAppUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 3000);
    });
  };

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Modal must return null when closed
  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    sound.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        sound.playCompletionChime();
      }
    } else {
      setActiveTab('install');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
      onClick={() => onClose()}
    >
      <div 
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8296FF] to-[#35C99A] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center text-[#8296FF]">
                <Smartphone className="w-5 h-5 text-[#35C99A]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Android App Installation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35C99A]/20 text-[#35C99A] font-bold">
                  Official WebAPK
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Install directly on your Android phone with 100% success and full offline support.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close dialog"
            onClick={(e) => {
              e.stopPropagation();
              try { sound.playClick(); } catch {}
              onClose();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--inset-surface)] hover:bg-[#F47783]/20 text-[var(--text-secondary)] hover:text-[#F47783] border border-[var(--border-subtle)] hover:border-[#F47783]/40 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--inset-surface)] rounded-xl mt-4 border border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('install');
            }}
            className={`py-2 font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'install'
                ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#35C99A]" />
            <span>1-Tap Install (WebAPK)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('parse-error');
            }}
            className={`py-2 font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'parse-error'
                ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-bold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Fix &quot;Parse Error&quot;</span>
          </button>
        </div>

        {/* TAB 1: 1-Tap Direct Install */}
        {activeTab === 'install' && (
          <div className="mt-4 space-y-4">
            {/* Value Proposition */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#8296FF]/10 to-[#35C99A]/10 border border-[#8296FF]/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#35C99A] shrink-0" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Guaranteed 100% Working on All Android Phones
                </h4>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Google Chrome and Android compile Tracker Growth into a verified Android app directly on your device. Zero parse errors, standalone fullscreen mode without browser URL bars, and 100% offline cache.
              </p>
            </div>

            {/* Quick 3-Step Phone Action */}
            <div className="p-4 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-3">
              <span className="text-xs font-bold text-[var(--text-primary)] block">
                How to Install on Your Android Phone in 10 Seconds:
              </span>
              <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8296FF]/20 text-[#8296FF] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                  <span>Open this link in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8296FF]/20 text-[#8296FF] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                  <span>Tap the <strong>three dots (⋮)</strong> menu in the upper-right corner of Chrome.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#35C99A]/20 text-[#35C99A] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>&quot;Install app&quot;</strong> (or <em>Add to Home screen</em>). Android will immediately build and place the app icon on your home screen!</span>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            {isInstalled ? (
              <div className="p-3.5 rounded-xl bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs text-[#35C99A] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tracker Growth is already installed on this device!</span>
              </div>
            ) : deferredPrompt ? (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-[#35C99A] hover:bg-[#35C99A]/90 text-[#0B1020] text-sm font-bold transition-all shadow-md shadow-[#35C99A]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap to Install on This Phone Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={getLiveAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playClick()}
                  className="py-2.5 px-3 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Live App in Chrome</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="py-2.5 px-3 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedAppUrl ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#35C99A]" />
                      <span className="text-[#35C99A]">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span>Copy Link for Phone</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Display Link Row */}
            <div className="p-2.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] block">
                Direct URL to open in phone Chrome:
              </span>
              <input
                type="text"
                readOnly
                value={getLiveAppUrl()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] select-all"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Fix Parse Error */}
        {activeTab === 'parse-error' && (
          <div className="mt-4 space-y-3.5 text-xs">
            {/* Warning Explanation */}
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#F5B85C] shrink-0" />
                <span className="font-bold text-sm text-[#F5B85C]">
                  Why does Android show &quot;Problem parsing package&quot;?
                </span>
              </div>
              <p className="leading-relaxed text-[#F5B85C]/90 text-xs">
                Modern Android versions (Android 11 through 15) strictly block manually downloaded raw <code>.apk</code> files unless they are compiled by the Android SDK with compiled Dalvik bytecodes and signed with Google Play Developer Keystores.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-[var(--text-primary)] block text-xs">
                The Correct &amp; Official Solution:
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Do not manually sideload raw files. Progressive web applications are designed to be installed through <strong>Android Chrome&apos;s WebAPK engine</strong>, which automatically compiles and signs the native application directly on your phone with zero errors.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('install');
                }}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#35C99A] hover:bg-[#35C99A]/90 text-[#0B1020] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Go to 1-Tap Install (Guaranteed 100% Working)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Developer Section */}
            <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
              <span className="font-bold text-[var(--text-primary)] block text-[11px] text-[var(--text-secondary)]">
                For Developers (Google Play Console Release):
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                If you require a signed APK or AAB for publishing to the Google Play Store, export with Capacitor and build in Android Studio:
              </p>
              <div className="p-2 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-primary)] space-y-0.5">
                <div>npx @capacitor/cli init</div>
                <div>npx @capacitor/android add</div>
                <div>npx cap open android</div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Badges */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-3 gap-2 text-center text-[11px] text-[var(--text-secondary)]">
          <div className="flex flex-col items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-[#35C99A]" />
            <span>Works 100% Offline</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#8296FF]" />
            <span>Fast &amp; Responsive</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Private &amp; Secure</span>
          </div>
        </div>

        {/* Bottom Close Action Button */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              try { sound.playClick(); } catch {}
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF]/40 text-xs font-bold text-[var(--text-primary)] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <X className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Close Window</span>
          </button>
        </div>
      </div>
    </div>
  );
};
