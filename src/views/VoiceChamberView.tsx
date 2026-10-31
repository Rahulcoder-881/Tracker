import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  PhoneOff, 
  RotateCcw, 
  PlusCircle, 
  Check, 
  ShieldAlert,
  Headphones,
  Sliders,
  AudioWaveform,
  Waves
} from 'lucide-react';
import { sound } from '../utils/audio';
import { Task, DomainType } from '../types';

interface VoiceChamberViewProps {
  onAddExtractedTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const VoiceChamberView: React.FC<VoiceChamberViewProps> = ({
  onAddExtractedTask,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);
  const [voiceModel, setVoiceModel] = useState<'Zephyr' | 'Puck' | 'Aoede'>('Zephyr');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [addedTaskId, setAddedTaskId] = useState<string | null>(null);

  // Transcript logs of live voice session
  const [transcript, setTranscript] = useState<Array<{ id: string; sender: 'user' | 'model'; text: string; time: string }>>([
    {
      id: 'tx-seed-1',
      sender: 'model',
      text: 'Voice Chamber online. Ready for ultra-low latency tactical debriefs. Tap "Connect Voice Session" to speak.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContext16kRef = useRef<AudioContext | null>(null);
  const audioContext24kRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop & cleanup audio
  const stopAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Stop all playing queued audio
    audioQueueRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    audioQueueRef.current = [];

    // Stop microphone tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Close audio contexts
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContext16kRef.current) {
      audioContext16kRef.current.close().catch(() => {});
      audioContext16kRef.current = null;
    }
    if (audioContext24kRef.current) {
      audioContext24kRef.current.close().catch(() => {});
      audioContext24kRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsModelSpeaking(false);
    setVoiceVolume(0);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Helper to convert Float32Array to 16kHz 16-bit PCM Base64
  const floatTo16BitPCMBase64 = (input: Float32Array): string => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play incoming 24kHz raw PCM base64 from Gemini
  const play24kPcmChunk = async (base64Data: string) => {
    try {
      if (!audioContext24kRef.current) {
        audioContext24kRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = audioContext24kRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const sourceNode = ctx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(ctx.destination);

      sourceNode.onended = () => {
        audioQueueRef.current = audioQueueRef.current.filter((s) => s !== sourceNode);
        if (audioQueueRef.current.length === 0) {
          setIsModelSpeaking(false);
        }
      };

      setIsModelSpeaking(true);
      audioQueueRef.current.push(sourceNode);
      sourceNode.start();
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  };

  // Start Voice Session
  const startVoiceSession = async () => {
    sound.playClick();
    setErrorBanner(null);
    setIsConnecting(true);

    try {
      // 1. Establish WebSocket connection to backend /api/live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('Voice Chamber WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        sound.playCompletionChime();

        setTranscript((prev) => [
          ...prev,
          {
            id: `tx-${Date.now()}`,
            sender: 'model',
            text: 'Live channel open (16kHz in / 24kHz out). Voice co-pilot active.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        // 2. Initialize Microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          micStreamRef.current = stream;

          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
          });
          audioContext16kRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(stream);
          const processor = audioCtx.createScriptProcessor(4096, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // Compute volume for visualizer
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setVoiceVolume(Math.min(1, rms * 5));

            // Stream PCM audio chunk
            if (ws.readyState === WebSocket.OPEN && rms > 0.01) {
              const base64Pcm = floatTo16BitPCMBase64(inputData);
              ws.send(JSON.stringify({ audio: base64Pcm }));
            }
          };

          source.connect(processor);
          processor.connect(audioCtx.destination);
        } catch (micErr: any) {
          console.warn('Microphone permission or hardware error:', micErr);
          setErrorBanner('Microphone access restricted. Live simulation mode enabled for audio testing.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            play24kPcmChunk(msg.audio);
          }
          if (msg.interrupted) {
            // Stop current queued model playback
            audioQueueRef.current.forEach((s) => {
              try {
                s.stop();
              } catch {}
            });
            audioQueueRef.current = [];
            setIsModelSpeaking(false);
          }
        } catch {}
      };

      ws.onerror = (err) => {
        console.warn('WebSocket error:', err);
        setErrorBanner('Voice Chamber server connection unavailable. Check network or server.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to start voice chamber.');
      setIsConnecting(false);
    }
  };

  // Convert spoken session into checkpoint
  const handleConvertToCheckpoint = () => {
    if (!onAddExtractedTask) return;
    sound.playClick();

    const todayDate = new Date().toISOString().split('T')[0];
    onAddExtractedTask({
      title: 'Voice Chamber Tactical Debrief Actions',
      description: 'Follow-up actions discussed during real-time Gemini Live voice session.',
      domain: 'Engineering',
      priority: 'high',
      estimatedMinutes: 30,
      spentMinutes: 0,
      completed: false,
      date: todayDate,
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Verify architectural invariants identified in voice session', minutes: 15, completed: false },
        { id: `sub-${Date.now()}-2`, title: 'Execute priority hotfix sprint', minutes: 15, completed: false },
      ],
    });

    setAddedTaskId('voice-task-added');
    sound.playCompletionChime();
    setTimeout(() => setAddedTaskId(null), 3000);
  };

  // Visualizer Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 55;

      // Active state wave amplitude
      const amp = isModelSpeaking ? 30 : isConnected ? 12 + voiceVolume * 40 : 4;

      // Draw glowing concentric energy rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + Math.sin(angle) * amp * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = isModelSpeaking 
        ? 'rgba(167, 139, 250, 0.4)' 
        : isConnected 
          ? 'rgba(130, 150, 255, 0.3)' 
          : 'rgba(152, 166, 188, 0.15)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw secondary orbital ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 22 + Math.cos(angle * 1.5) * amp * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = isModelSpeaking 
        ? 'rgba(53, 201, 154, 0.5)' 
        : isConnected 
          ? 'rgba(167, 139, 250, 0.25)' 
          : 'rgba(152, 166, 188, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer dynamic audio particles/spokes
      const numPoints = 36;
      ctx.beginPath();
      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2 + angle * 0.5;
        const wave = Math.sin(theta * 6 + angle * 4) * amp;
        const r = baseRadius + wave;
        const x = centerX + Math.cos(theta) * r;
        const y = centerY + Math.sin(theta) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = isModelSpeaking ? '#35C99A' : isConnected ? '#8296FF' : '#495973';
      ctx.lineWidth = 2;
      ctx.stroke();

      angle += 0.04;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isConnected, isModelSpeaking, voiceVolume]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 sm:px-6 py-4">
      {/* Chamber Header */}
      <div className="bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#35C99A]/20 to-[#8296FF]/20 border border-[#8296FF]/30 flex items-center justify-center text-[#8296FF]">
              <Radio className="w-5 h-5 text-[#8296FF] animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span>Gemini Live Voice Chamber</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--inset-surface)] text-[#35C99A] border border-[var(--border-subtle)]">
                  gemini-3.8-live
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Bidirectional real-time conversational audio with zero-turn latency
              </p>
            </div>
          </div>

          {/* Voice Character & Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)]">
              <Headphones className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Voice:</span>
              <select
                value={voiceModel}
                onChange={(e) => setVoiceModel(e.target.value as any)}
                className="bg-transparent font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="Zephyr" className="bg-[#172338]">Zephyr (Balanced)</option>
                <option value="Puck" className="bg-[#172338]">Puck (Fast/Direct)</option>
                <option value="Aoede" className="bg-[#172338]">Aoede (Analytical)</option>
              </select>
            </div>

            <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
              isConnected
                ? 'bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/40'
                : 'bg-[var(--inset-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#35C99A] animate-ping' : 'bg-gray-500'}`} />
              <span>{isConnected ? (isModelSpeaking ? 'Gemini Speaking' : 'Listening') : 'Standby'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-yellow-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-yellow-400 font-mono ml-2">×</button>
        </div>
      )}

      {/* Visualizer & Chamber Centerpiece */}
      <div className="flex-1 bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner min-h-[260px]">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-radial from-[#8296FF]/5 via-transparent to-transparent pointer-events-none" />

        {/* Dynamic Canvas Visualizer */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="relative z-10 max-w-full"
        />

        {/* Center Orb Icon */}
        <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isModelSpeaking
              ? 'bg-[#35C99A] text-[#0B1020] shadow-[0_0_30px_rgba(53,201,154,0.6)] scale-110'
              : isConnected
                ? 'bg-[#8296FF] text-[#0B1020] shadow-[0_0_25px_rgba(130,150,255,0.4)]'
                : 'bg-[var(--inset-surface)] text-[var(--text-secondary)]'
          }`}>
            {isModelSpeaking ? (
              <Waves className="w-7 h-7 animate-pulse" />
            ) : isConnected ? (
              <Mic className="w-7 h-7" />
            ) : (
              <Radio className="w-7 h-7" />
            )}
          </div>
        </div>

        {/* Status Callout */}
        <div className="relative z-10 mt-6 text-center">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {isConnected
              ? isModelSpeaking
                ? 'Co-Pilot is speaking at 24kHz...'
                : isMuted
                  ? 'Microphone muted'
                  : 'Listening to your speech (16kHz PCM)...'
              : 'Tap "Connect Voice Session" to initiate live voice bridge'}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono">
            {isConnected ? `Voice Model: ${voiceModel} · Low-Latency Duplex` : 'Powered by Gemini 3.8 Live API'}
          </p>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-xl p-3 shadow-sm">
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <button
              onClick={startVoiceSession}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] font-semibold text-xs sm:text-sm transition-all shadow-sm active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting Live API...' : 'Connect Voice Session'}</span>
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-semibold text-xs sm:text-sm transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          )}

          {isConnected && (
            <button
              onClick={() => {
                sound.playClick();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-300'
                  : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Task Conversion */}
        {onAddExtractedTask && (
          <button
            onClick={handleConvertToCheckpoint}
            disabled={addedTaskId !== null}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              addedTaskId
                ? 'bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/40'
                : 'bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
            }`}
          >
            {addedTaskId ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Checkpoint Created!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5 text-[#8296FF]" />
                <span>Log Spoken Checkpoint</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Transcript Log Stream */}
      <div className="mt-3 bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-xl p-3 max-h-36 overflow-y-auto scrollbar-thin">
        <div className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Live Session Log</span>
          <span className="font-mono text-[10px] text-[var(--text-secondary)]">{transcript.length} items</span>
        </div>
        <div className="space-y-1.5">
          {transcript.map((t) => (
            <div key={t.id} className="text-xs flex items-start gap-2">
              <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded mt-0.5 ${
                t.sender === 'user' ? 'bg-[#8296FF]/20 text-[#8296FF]' : 'bg-[#A78BFA]/20 text-[#A78BFA]'
              }`}>
                {t.sender}
              </span>
              <p className="text-[var(--text-primary)] flex-1">{t.text}</p>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] shrink-0">{t.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
