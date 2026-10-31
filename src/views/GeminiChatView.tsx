import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Search, 
  Cpu, 
  UserCheck, 
  PlusCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  ExternalLink, 
  Bot, 
  User as UserIcon,
  Zap,
  Globe,
  Sliders,
  AlertCircle,
  Terminal,
  Activity,
  Compass,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, SystemRoleType, GeminiModelType, Task, DomainType, User } from '../types';
import { sound } from '../utils/audio';
import { db, doc, setDoc } from '../lib/firebase';

interface GeminiChatViewProps {
  onAddExtractedTask?: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onNavigateToBoard?: () => void;
  currentUser?: User | null;
}

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({
  onAddExtractedTask,
  onNavigateToBoard,
  currentUser,
}) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tg_gemini_chat');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        id: 'msg-seed-1',
        role: 'model',
        content: `### Welcome to Tracker Growth AI Assistant\n\nI can help you plan your day, break big projects into quick tasks, and answer questions using Google Search.\n\nChoose your preferred **Gemini Model** above and ask me anything to get started!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.8-flash',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SystemRoleType>('strategic_coach');
  const [selectedModel, setSelectedModel] = useState<GeminiModelType>('gemini-3.8-flash');
  const [searchGrounding, setSearchGrounding] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedTaskId, setAddedTaskId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages in localStorage
  useEffect(() => {
    localStorage.setItem('tg_gemini_chat', JSON.stringify(messages));
  }, [messages]);

  // Dynamic model routing helper
  const handleRoleChange = (role: SystemRoleType) => {
    setSelectedRole(role);
    sound.playClick();
    if (role === 'strategic_coach') {
      setSelectedModel('gemini-3.8-flash');
      setSearchGrounding(false);
    } else if (role === 'task_extractor') {
      setSelectedModel('gemini-3.1-flash-lite');
      setSearchGrounding(false);
    } else if (role === 'grounded_research') {
      setSelectedModel('gemini-3.8-flash');
      setSearchGrounding(true);
    } else if (role === 'momentum_pacer') {
      setSelectedModel('gemini-3.8-flash');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);
    setErrorBanner(null);

    // Firestore persistence
    if (currentUser?.id) {
      try {
        setDoc(doc(db, 'users', currentUser.id, 'chats', userMsg.id), {
          id: userMsg.id,
          role: userMsg.role,
          content: userMsg.content,
          modelUsed: selectedModel,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
        }, { merge: true }).catch((e) => console.warn('Chat sync offline:', e));
      } catch {}
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          systemRole: selectedRole,
          model: selectedModel,
          searchGrounding,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to receive response from Gemini');
      }

      const data = await response.json();
      sound.playCompletionChime();

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        sources: data.sources || [],
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Sync AI message to Firestore
      if (currentUser?.id) {
        try {
          setDoc(doc(db, 'users', currentUser.id, 'chats', aiMsg.id), {
            id: aiMsg.id,
            role: aiMsg.role,
            content: aiMsg.content,
            modelUsed: aiMsg.modelUsed || selectedModel,
            sources: aiMsg.sources ? JSON.stringify(aiMsg.sources) : '',
            timestamp: new Date().toISOString(),
            userId: currentUser.id,
          }, { merge: true }).catch((e) => console.warn('Chat sync offline:', e));
        } catch {}
      }
    } catch (err: any) {
      console.error('Chat generation error:', err);
      setErrorBanner(err.message || 'An error occurred while contacting Gemini.');
      sound.playAlertTone();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConvertToCheckpoint = (msg: ChatMessage) => {
    if (!onAddExtractedTask) return;
    sound.playClick();

    const firstLine = msg.content
      .split('\n')[0]
      .replace(/[#*`_]/g, '')
      .trim();
    const title = firstLine.length > 5 ? firstLine.slice(0, 60) : 'Execute strategic recommendations';

    const bulletLines = msg.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- ') || l.startsWith('* ') || /^\d+\./.test(l))
      .slice(0, 4)
      .map((l, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: l.replace(/^[-*\d.]\s*/, '').replace(/[*_`]/g, '').slice(0, 60),
        minutes: 20,
        completed: false,
      }));

    const todayDate = new Date().toISOString().split('T')[0];

    onAddExtractedTask({
      title,
      description: msg.content.slice(0, 300),
      domain: (selectedRole === 'grounded_research' ? 'Research' : 'Engineering') as DomainType,
      priority: 'high',
      estimatedMinutes: bulletLines.length ? bulletLines.length * 20 : 45,
      spentMinutes: 0,
      completed: false,
      date: todayDate,
      subtasks: bulletLines,
    });

    setAddedTaskId(msg.id);
    sound.playCompletionChime();
    setTimeout(() => setAddedTaskId(null), 3000);
  };

  const handleClearHistory = () => {
    sound.playClick();
    if (confirm('Clear entire conversation history?')) {
      const resetMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: `### Session Initialized\n\nChoose an execution persona or enter your strategic inquiry below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages([resetMsg]);
    }
  };

  const suggestedPrompts = [
    { label: 'Plan My Day', prompt: 'Break down my daily goals into 4 simple, high-priority tasks with time estimates.' },
    { label: 'Beat Procrastination', prompt: 'Give me a simple 3-step action plan to start working on my most important project right now.' },
    { label: 'Live Web Search', prompt: 'Search and summarize the best practices for mobile app offline storage and speed.' },
    { label: 'Quick Task Breakdown', prompt: 'Turn my rough thoughts into 3 clear, actionable checklist items.' },
  ];

  // Helper to render markdown-like content cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-[#8296FF] mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-bold text-[var(--text-primary)] mt-3 mb-1.5">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8296FF] mt-1.5 shrink-0" />
            <span className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
              {line.replace(/^[-*]\s+/, '')}
            </span>
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1 font-mono text-xs sm:text-sm">
            <span className="text-[#35C99A] font-bold shrink-0">{line.match(/^\d+\./)?.[0]}</span>
            <span className="text-[var(--text-primary)] font-sans">{line.replace(/^\d+\.\s+/, '')}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)]">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100dvh-5rem)] max-w-5xl mx-auto w-full px-2.5 sm:px-6 py-3 sm:py-4 space-y-3 pb-24 lg:pb-6">
      {/* Top Controller Hub */}
      <div className="bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111A2C] border border-[#8296FF]/40 flex items-center justify-center p-1.5 shadow-sm">
              <Bot className="w-5 h-5 text-[#8296FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  Tracker Growth AI Assistant
                </h2>
                <span className="flex items-center gap-1 text-[11px] text-[#35C99A] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#35C99A] animate-pulse" />
                  <span>Online</span>
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Fast answers, daily planning, and live Google web search
              </p>
            </div>
          </div>

          {/* Action & Clear */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#35C99A] bg-[#35C99A]/10 border border-[#35C99A]/25 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-[#35C99A]" />
                <span className="text-[11px] font-medium">Saved to Account</span>
              </div>
            )}

            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--inset-surface)] hover:bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-lg transition-colors font-medium"
              title="Clear conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* PROMINENT GEMINI VERSION SELECTOR */}
        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#8296FF]" />
              <span>Select Gemini Model Version:</span>
            </span>
            <span className="text-[11px] text-[#8296FF] font-medium">
              Active: {selectedModel}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: 'gemini-3.8-flash' as GeminiModelType,
                name: 'Gemini 3.8 Flash',
                desc: 'Fast & Smart (Recommended)',
                badge: 'Recommended',
                badgeColor: 'bg-[#8296FF]/20 text-[#8296FF] border-[#8296FF]/30',
              },
              {
                id: 'gemini-3.1-flash-lite' as GeminiModelType,
                name: 'Gemini 3.1 Flash Lite',
                desc: 'Ultra Fast & Lightweight',
                badge: 'Ultra Fast',
                badgeColor: 'bg-[#35C99A]/20 text-[#35C99A] border-[#35C99A]/30',
              },
              {
                id: 'gemini-4-argon' as GeminiModelType,
                name: 'Gemini 4 Argon',
                desc: 'Deep Thinking',
                badge: 'Advanced',
                badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              },
            ].map((m) => {
              const active = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedModel(m.id);
                  }}
                  className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                    active
                      ? 'bg-[#8296FF]/15 border-[#8296FF] shadow-xs'
                      : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)]/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Zap className={`w-3.5 h-3.5 ${active ? 'text-[#8296FF]' : 'text-[var(--text-secondary)]'}`} />
                      <span className={`text-xs font-bold ${active ? 'text-[#8296FF]' : 'text-[var(--text-primary)]'}`}>
                        {m.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-tight">{m.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Assistant Mode & Live Search Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          {/* Assistant Modes */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#8296FF]" />
              <span>Mode:</span>
            </span>
            {[
              { id: 'strategic_coach', label: 'Goal Planner' },
              { id: 'momentum_pacer', label: 'Daily Pacer' },
              { id: 'task_extractor', label: 'Task Breakdown' },
              { id: 'grounded_research', label: 'Web Search' },
            ].map((r) => {
              const active = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id as SystemRoleType)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-[#8296FF] text-[#0B1020] shadow-sm'
                      : 'bg-[var(--inset-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-subtle)]'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Real-time Google Search toggle */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                sound.playClick();
                setSearchGrounding(!searchGrounding);
                if (!searchGrounding) {
                  setSelectedModel('gemini-3.8-flash');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                searchGrounding
                  ? 'bg-[#35C99A]/15 border-[#35C99A]/40 text-[#35C99A]'
                  : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Ground responses in live Google Search results"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Google Search</span>
              {searchGrounding && <span className="w-1.5 h-1.5 rounded-full bg-[#35C99A] animate-pulse" />}
            </button>
          </div>
        </div>
      </div>

      {/* Error notification banner if any */}
      {errorBanner && (
        <div className="px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner(null)} className="text-red-400 font-bold ml-3">×</button>
        </div>
      )}

      {/* Suggested Quick Prompt Starters */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="p-2.5 rounded-xl bg-[var(--card-surface)] hover:bg-[var(--inset-surface)] border border-[var(--border-subtle)] hover:border-[#8296FF]/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#8296FF] group-hover:text-[#A78BFA] transition-colors">
                  {p.label}
                </span>
                <ArrowUpRight className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-[#8296FF] transition-colors" />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">{p.prompt}</p>
            </button>
          ))}
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8296FF] to-[#A78BFA] flex items-center justify-center text-[#0B1020] shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 transition-all shadow-sm ${
                  isUser
                    ? 'bg-[#8296FF]/15 border border-[#8296FF]/35 text-[var(--text-primary)] rounded-tr-xs'
                    : 'bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-xs'
                }`}
              >
                {/* Message Header Metadata */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]">
                  <span className="font-semibold flex items-center gap-1.5">
                    {isUser ? (
                      <>
                        <UserIcon className="w-3 h-3 text-[#8296FF]" />
                        <span>{currentUser?.name || 'You'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                        <span>Gemini Co-Pilot</span>
                        {msg.modelUsed && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[#bac3ff]">
                            {msg.modelUsed}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums">{msg.timestamp}</span>
                </div>

                {/* Formatted Content */}
                <div className="space-y-1 font-sans">
                  {renderFormattedContent(msg.content)}
                </div>

                {/* Google Search Grounding Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
                    <div className="text-[11px] font-semibold text-[#35C99A] flex items-center gap-1.5 mb-1.5">
                      <Globe className="w-3 h-3" />
                      <span>Verified Google Search Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--inset-surface)] hover:bg-[#35C99A]/15 border border-[var(--border-subtle)] hover:border-[#35C99A]/40 text-[10px] text-[var(--text-secondary)] hover:text-[#35C99A] transition-colors truncate max-w-[260px]"
                        >
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{s.title || s.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Action Bar */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
                        title="Copy text to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#35C99A]" />
                            <span className="text-[#35C99A]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {onAddExtractedTask && (
                      <button
                        onClick={() => handleConvertToCheckpoint(msg)}
                        disabled={addedTaskId === msg.id}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          addedTaskId === msg.id
                            ? 'bg-[#35C99A]/20 text-[#35C99A] border border-[#35C99A]/40'
                            : 'bg-[#8296FF]/15 text-[#8296FF] hover:bg-[#8296FF]/25 border border-[#8296FF]/30'
                        }`}
                      >
                        {addedTaskId === msg.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Logged to Board!</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" />
                            <span>Convert to Checkpoint</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4 text-[#8296FF]" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#8296FF] to-[#A78BFA] flex items-center justify-center text-[#0B1020] shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8296FF] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#A78BFA] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#35C99A] animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                {selectedModel} synthesizing strategic response...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Composer */}
      <div className="sticky bottom-16 lg:bottom-2 bg-[var(--card-surface)] border border-[var(--border-subtle)] rounded-2xl p-2.5 sm:p-3 shadow-md space-y-2 z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${selectedModel} anything (Enter to send, Shift+Enter for newline)...`}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none resize-none px-2 py-1 leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#8296FF] hover:bg-[#8296FF]/90 text-[#0B1020] transition-all disabled:opacity-40 active:scale-95 shrink-0 shadow-sm shadow-[#8296FF]/20"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] px-2 pt-1 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>Model: {selectedModel}</span>
            <span>·</span>
            <span>Grounding: {searchGrounding ? 'Google Search Active' : 'Off'}</span>
          </div>
          <span className="text-[10px]">Enter ↵ to send</span>
        </div>
      </div>
    </div>
  );
};
