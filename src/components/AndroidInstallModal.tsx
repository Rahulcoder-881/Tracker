import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  WifiOff, 
  Zap, 
  Layers, 
  HelpCircle,
  ExternalLink
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
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'apk' | 'guide'>('apk');

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
      setActiveTab('guide');
    }
  };

  const getAbsoluteApkUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/download/android-apk`;
    }
    return '/api/download/android-apk';
  };

  const handleCopyApkLink = () => {
    sound.playClick();
    const url = getAbsoluteApkUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const handleDownloadApk = async () => {
    sound.playClick();
    setDownloadStarted(true);
    setDownloadProgress('Fetching APK package...');

    try {
      // Strategy 1: Fetch binary blob directly (works inside iframe without popup restrictions)
      const res = await fetch('/api/download/android-apk');
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'tracker-growth.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        setDownloadProgress('Download complete! Check your phone Downloads.');
        sound.playCompletionChime();
        return;
      }
    } catch (err) {
      console.warn('Blob download fallback:', err);
    }

    // Strategy 2: Base64 JSON fallback
    try {
      setDownloadProgress('Using direct fallback stream...');
      const res = await fetch('/api/download/android-apk-base64');
      if (res.ok) {
        const data = await res.json();
        if (data.base64) {
          const byteCharacters = atob(data.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/vnd.android.package-archive' });
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'tracker-growth.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
          setDownloadProgress('Download complete! Saved tracker-growth.apk');
          sound.playCompletionChime();
          return;
        }
      }
    } catch (err) {
      console.warn('Base64 fallback:', err);
    }

    // Strategy 3: Standard window location / direct anchor trigger
    const link = document.createElement('a');
    link.href = '/api/download/android-apk';
    link.download = 'tracker-growth.apk';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadProgress('Download initiated via browser.');
    setTimeout(() => setDownloadStarted(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl p-4 sm:p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8296FF] to-[#35C99A] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0B1020] rounded-[10px] flex items-center justify-center text-[#8296FF]">
                <Smartphone className="w-5 h-5 text-[#35C99A]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>Android App &amp; APK Center</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35C99A]/20 text-[#35C99A] font-bold">
                  v1.0.0
                </span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Install on your Android phone to use locally with full offline support.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--inset-surface)] rounded-xl mt-4 border border-[var(--border-subtle)] text-xs">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('direct');
            }}
            className={`py-1.5 font-medium rounded-lg transition-all ${
              activeTab === 'direct'
                ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            1-Tap Install
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('apk');
            }}
            className={`py-1.5 font-medium rounded-lg transition-all ${
              activeTab === 'apk'
                ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Download APK
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('guide');
            }}
            className={`py-1.5 font-medium rounded-lg transition-all ${
              activeTab === 'guide'
                ? 'bg-[var(--card-surface)] text-[var(--text-primary)] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* TAB 1: 1-Tap Direct Install */}
        {activeTab === 'direct' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#8296FF]/10 to-[#35C99A]/10 border border-[#8296FF]/30 space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#35C99A]" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Fast Native Android Experience
                </h4>
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A]" />
                  <span>Runs fullscreen without browser bars (like a downloaded Google Play app)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A]" />
                  <span>Works 100% offline with locally saved tasks, timer, and notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A]" />
                  <span>Adds the high-resolution Tracker Growth logo icon to your home screen</span>
                </li>
              </ul>
            </div>

            {isInstalled ? (
              <div className="p-3.5 rounded-xl bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs text-[#35C99A] flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tracker Growth is already installed on this device!</span>
              </div>
            ) : (
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] text-sm font-bold transition-all shadow-md shadow-[#8296FF]/20 flex items-center justify-center gap-2 group"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install on Android Phone Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}

        {/* TAB 2: Download APK */}
        {activeTab === 'apk' && (
          <div className="mt-4 space-y-3.5">
            <div className="p-4 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">tracker-growth.apk</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    Size: 1.16 MB · Standalone Android Package (v1.0.0)
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#35C99A]/20 text-[#35C99A] flex items-center justify-center font-bold text-xs">
                  APK
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Contains the complete application with all offline functions. Installable directly on any Android phone running Android 8.0 or newer.
              </p>

              {/* Package Included Features List */}
              <div className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-1.5 text-[10px] text-[var(--text-secondary)] font-medium">
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Daily Tasks &amp; Checkpoints</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Daily Habits &amp; Streaks</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Deep Work Focus Timer</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Growth Goals &amp; Milestones</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Gemini AI (Flash/Lite/Argon)</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#35C99A]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>CSV/JSON History Export</span>
                </span>
              </div>
            </div>

            {/* Primary Action Button (Fetch + Blob Download) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDownloadApk}
                className="w-full py-3 px-4 rounded-xl bg-[#35C99A] hover:bg-[#35C99A]/90 text-[#0B1020] text-sm font-bold transition-all shadow-md shadow-[#35C99A]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloadStarted ? (downloadProgress || 'Downloading tracker-growth.apk...') : 'Download tracker-growth.apk (Direct)'}</span>
              </button>

              {/* Direct Native HTML Link Fallback */}
              <a
                href="/api/download/android-apk"
                download="tracker-growth.apk"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playClick()}
                className="w-full py-2.5 px-3 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF]/50 text-xs text-[var(--text-primary)] font-semibold flex items-center justify-center gap-2 transition-all text-center block"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#8296FF]" />
                <span>Alternative: Direct Browser Download Link</span>
              </a>
            </div>

            {/* Copy Link Row */}
            <div className="p-2.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[var(--text-secondary)]">Direct Link for Mobile Browser:</span>
                <button
                  type="button"
                  onClick={handleCopyApkLink}
                  className="text-[#8296FF] hover:underline font-bold flex items-center gap-1"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[#35C99A]" />
                      <span className="text-[#35C99A]">Copied!</span>
                    </>
                  ) : (
                    <span>Copy Link</span>
                  )}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={getAbsoluteApkUrl()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-secondary)] select-all"
              />
            </div>

            {downloadProgress && (
              <p className="text-xs text-center text-[#35C99A] animate-pulse font-medium">
                {downloadProgress}
              </p>
            )}
          </div>
        )}

        {/* TAB 3: Guide */}
        {activeTab === 'guide' && (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-[var(--text-primary)] block">Method 1: Direct from Chrome (Recommended)</span>
              <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)]">
                <li>Open this website in <strong>Google Chrome</strong> on your Android phone.</li>
                <li>Tap the <strong>three dots (⋮)</strong> menu at the top-right.</li>
                <li>Tap <strong>Install App</strong> (or <em>Add to Home Screen</em>).</li>
                <li>The app will install automatically with its own icon on your phone!</li>
              </ol>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] space-y-2">
              <span className="font-bold text-[var(--text-primary)] block">Method 2: From Downloaded APK File</span>
              <ol className="list-decimal list-inside space-y-1 text-[var(--text-secondary)]">
                <li>Download <code className="text-[#8296FF]">tracker-growth.apk</code> from the Download APK tab.</li>
                <li>Tap the completed download in your notifications or phone Files app.</li>
                <li>If prompted, allow &quot;Install from unknown sources&quot; for Chrome or Files.</li>
                <li>Tap <strong>Install</strong> and launch Tracker Growth locally!</li>
              </ol>
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
      </div>
    </div>
  );
};
