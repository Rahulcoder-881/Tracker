import React from 'react';
import { 
  Settings, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsViewProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  targetDailyHours: number;
  setTargetDailyHours: (hours: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onResetData: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDark,
  setIsDark,
  targetDailyHours,
  setTargetDailyHours,
  soundEnabled,
  setSoundEnabled,
  onResetData,
  onExportJson,
  onExportCsv,
}) => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* View Header */}
      <div className="pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8296FF]">
          <Settings className="w-4 h-4" />
          <span>System Architecture</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
          Platform Configuration & Calibration
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          Tune sensory acoustics, visual contrast layers, and target execution velocity.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="space-y-6">
        {/* Visual Theme Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Visual Contrast & Surface Mode
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Obsidian slate `#0B1020` or crisp daylight `#F5F7FC`
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[var(--inset-surface)] rounded-xl border border-[var(--border-subtle)] self-start sm:self-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsDark(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#8296FF] text-[#0B1020] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Slate</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsDark(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !isDark
                    ? 'bg-[#8296FF] text-[#0B1020] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>

        {/* Acoustic Feedback & Sound Engine */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#A78BFA]" />
                <span>Synthesized Web Audio Feedback</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Tactile micro-click haptics, milestone chimes, and ambient pink noise generator.
              </p>
            </div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sound.setSoundEnabled(next);
                if (next) sound.playClick();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border self-start sm:self-auto ${
                soundEnabled
                  ? 'bg-[#35C99A]/20 border-[#35C99A] text-[#35C99A]'
                  : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'Enabled' : 'Muted'}</span>
            </button>
          </div>
        </div>

        {/* Daily Capacity Goal */}
        <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Daily Deep Work Capacity Target
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Calibrates cognitive fatigue index and velocity pacing calculations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step={0.5}
                min={1}
                max={12}
                value={targetDailyHours}
                onChange={(e) => setTargetDailyHours(Number(e.target.value))}
                className="w-20 px-3 py-1.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] tabular-nums font-mono text-center focus:outline-none focus:border-[#8296FF]"
              />
              <span className="text-xs text-[var(--text-secondary)] font-medium">hours / day</span>
            </div>
          </div>
        </div>

        {/* Data Management & State Export */}
        <div className="p-5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8296FF]" />
            <span>Workspace Persistence & Portability</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Export complete state payload for offline archival or reset to initial template.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onExportCsv();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8296FF]/20 to-[#35C99A]/20 hover:from-[#8296FF]/30 hover:to-[#35C99A]/30 border border-[#8296FF]/40 text-xs font-semibold text-[var(--text-primary)] transition-all shadow-xs group"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#35C99A] group-hover:scale-110 transition-transform" />
              <span>Export Task & Goal CSV</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--inset-surface)] text-[#8296FF] font-mono">
                Analysis Ready
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onExportJson();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#8296FF]" />
              <span>Export Workspace JSON</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                if (window.confirm('Reset all checkpoints, metrics, and goals to high-agency template?')) {
                  onResetData();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--inset-surface)] hover:bg-[#F47783]/10 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[#F47783] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Template</span>
            </button>
          </div>
        </div>

        {/* Design System Metadata */}
        <div className="p-4 rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
            <Cpu className="w-3.5 h-3.5 text-[#8296FF]" />
            <span>Tracker Growth Platform Spec</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Palette: `#0B1020` Canvas · `#8296FF` Accent · `#A78BFA` Strategic AI · `#35C99A` Success.
            Typography: Utilitarian Inter + JetBrains Mono Tabular Numerals.
          </p>
        </div>
      </div>
    </div>
  );
};
