import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Radio, 
  Clock, 
  Zap, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import { Task } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface DeepWorkChamberProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectActiveTask: (task: Task | null) => void;
  onLogFocusSession: (minutes: number, taskId?: string) => void;
}

export const DeepWorkChamber: React.FC<DeepWorkChamberProps> = ({
  tasks,
  activeTask,
  onSelectActiveTask,
  onLogFocusSession,
}) => {
  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'binaural' | 'rain' | 'tape'>('off');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preset intervals
  const presets = [
    { label: 'Tactical Sprint', minutes: 15 },
    { label: 'Pomodoro Core', minutes: 25 },
    { label: 'Deep Flow State', minutes: 50 },
    { label: 'Neural Recovery', minutes: 5 },
  ];

  const handleSelectPreset = (mins: number) => {
    sound.playClick();
    setIsRunning(false);
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    sound.playClick();
    if (!isRunning) {
      if (ambientSound !== 'off') {
        sound.startAmbientFocus(ambientSound);
      }
      setIsRunning(true);
    } else {
      sound.stopAmbientFocus();
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsRunning(false);
    sound.stopAmbientFocus();
    setTimeLeft(selectedDuration * 60);
  };

  const handleCompleteSession = () => {
    setIsRunning(false);
    sound.stopAmbientFocus();
    sound.playCompletionChime();
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#8296FF', '#35C99A', '#A78BFA'],
      });
    } catch {}

    const completedMins = selectedDuration;
    onLogFocusSession(completedMins, activeTask?.id);
    setTimeLeft(selectedDuration * 60);
  };

  const handleAmbientChange = (type: 'off' | 'binaural' | 'rain' | 'tape') => {
    sound.playClick();
    setAmbientSound(type);
    if (type === 'off' || !isRunning) {
      sound.stopAmbientFocus();
    } else {
      sound.startAmbientFocus(type);
    }
  };

  // Math for Circular Progress Ring
  const totalSeconds = selectedDuration * 60;
  const progressRatio = (totalSeconds - timeLeft) / totalSeconds;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const minutesDisplay = Math.floor(timeLeft / 60);
  const secondsDisplay = timeLeft % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(secondsDisplay).padStart(2, '0')}`;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8 flex flex-col items-center">
      {/* Title */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[#8296FF] mb-2">
          <Radio className={`w-3.5 h-3.5 ${isRunning ? 'animate-pulse text-[#35C99A]' : ''}`} />
          <span>Cognitive Isolation Protocol</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Deep Work Execution Chamber
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
          Single-task lock-in with synthesized acoustic attenuation.
        </p>
      </div>

      {/* Preset Cadence Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-xl flex-wrap justify-center">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleSelectPreset(preset.minutes)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDuration === preset.minutes
                ? 'bg-[#8296FF] text-[#0B1020] font-semibold shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--inset-surface)]'
            }`}
          >
            {preset.label} ({preset.minutes}m)
          </button>
        ))}
      </div>

      {/* Main Focus Chamber Dial */}
      <div className="relative flex flex-col items-center justify-center p-6">
        <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-[var(--inset-surface)]"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Gradient Active Track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="url(#timerGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8296FF" />
              <stop offset="100%" stopColor="#35C99A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight tabular-nums text-[var(--text-primary)]">
            {formattedTime}
          </span>
          <span className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mt-1 font-semibold">
            {isRunning ? 'Flow State Active' : 'Chamber Ready'}
          </span>
          {activeTask && (
            <span className="text-xs text-[#8296FF] truncate max-w-[200px] mt-2 font-medium">
              {activeTask.title}
            </span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all hover:bg-[var(--inset-surface)]"
          title="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleTimer}
          className={`min-w-[140px] px-6 py-3 rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
            isRunning
              ? 'bg-[var(--card-surface)] border border-[var(--border-medium)] text-[var(--text-primary)] hover:bg-[var(--inset-surface)]'
              : 'bg-[#8296FF] text-[#0B1020] hover:bg-[#8296FF]/90 shadow-[#8296FF]/25'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Block</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Engage Focus</span>
            </>
          )}
        </button>

        <button
          onClick={handleCompleteSession}
          className="w-12 h-12 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[#35C99A] flex items-center justify-center transition-all hover:bg-[var(--inset-surface)]"
          title="Mark Session Completed"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      {/* Active Task Lock-in Drawer */}
      <div className="w-full max-w-xl p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          <span>Locked Checkpoint</span>
          {activeTask && (
            <button
              onClick={() => onSelectActiveTask(null)}
              className="text-[#F47783] hover:underline normal-case text-[11px]"
            >
              Clear Lock
            </button>
          )}
        </div>

        {activeTask ? (
          <div className="p-3 rounded-xl bg-[var(--inset-surface)] border border-[rgba(130,150,255,0.25)] flex items-center justify-between">
            <div className="truncate mr-3">
              <span className="text-xs font-semibold text-[#8296FF] uppercase tracking-wider block">
                {activeTask.domain}
              </span>
              <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                {activeTask.title}
              </h4>
            </div>
            <span className="text-xs font-mono text-[var(--text-secondary)] tabular-nums shrink-0">
              {activeTask.spentMinutes}m logged
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              Select an uncompleted checkpoint to bind focus minutes:
            </p>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {tasks.filter((t) => !t.completed).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectActiveTask(t);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-[var(--inset-surface)] hover:bg-[var(--inset-surface)]/80 border border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-primary)] transition-colors"
                >
                  <span className="truncate">{t.title}</span>
                  <span className="text-[10px] text-[#8296FF] shrink-0 font-medium ml-2">
                    {t.domain}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Synthesized Ambient Audio Generator */}
      <div className="w-full max-w-xl p-4 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Acoustic Isolation Synthesizer</span>
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-mono">
            {ambientSound.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(['off', 'binaural', 'rain', 'tape'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => handleAmbientChange(mode)}
              className={`py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                ambientSound === mode
                  ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#cebdff] font-semibold'
                  : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {mode === 'off' ? 'Mute' : mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
