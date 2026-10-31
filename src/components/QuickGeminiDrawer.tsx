import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  ChevronUp, 
  ChevronDown, 
  PlusCircle, 
  Check, 
  Maximize2, 
  ExternalLink,
  Bot,
  User as UserIcon,
  Globe,
  RotateCcw,
  Copy,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { ChatMessage, SystemRoleType, GeminiModelType, Task, User } from '../types';
import { sound } from '../utils/audio';
import { db, doc, setDoc } from '../lib/firebase';

interface QuickGeminiDrawerProps {
  onAddExtractedTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  currentUser: User | null;
  onNavigateToFullChat: () => void;
}

export const QuickGeminiDrawer: React.FC<QuickGeminiDrawerProps> = ({
  onAddExtractedTask,
  currentUser,
  onNavigateToFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
        id: 'msg-seed-quick',
        role: 'model',
        content: `**Tracker Growth AI Co-Pilot** is standing by.\n\nAsk me to deconstruct goals, pace today's sprint, or extract high-leverage checkpoints directly to your board.`,
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
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('tg_gemini_chat', JSON.stringify(messages));
  }, [messages]);

  // Sync to Firestore if signed in
  const syncMessageToFirestore = async (msg: ChatMessage) => {
    if (currentUser?.id) {
      try {
        const chatDocRef = doc(db, 'users', currentUser.id, 'chats', msg.id);
        await setDoc(chatDocRef, {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          modelUsed: msg.modelUsed || selectedModel,
          sources: msg.sources ? JSON.stringify(msg.sources) : '',
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore chat sync offline note:', err);
      }
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

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    syncMessageToFirestore(userMsg);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          systemRole: selectedRole,
          model: selectedModel,
          searchGrounding,
        }),
      });

      if (!response.ok) {
        throw new Error('Chat response error');
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
      syncMessageToFirestore(aiMsg);
    } catch (err) {
      sound.playAlertTone();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToCheckpoint = (msg: ChatMessage) => {
    sound.playClick();
    const firstLine = msg.content
      .split('\n')[0]
      .replace(/[#*`_]/g, '')
      .trim();
    const title = firstLine.length > 5 ? firstLine.slice(0, 60) : 'Execute strategic checkpoint';

    const bulletLines = msg.content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('- ') || l.startsWith('* ') || /^\d+\./.test(l))
      .slice(0, 3)
      .map((l, i) => ({
        id: `sub-quick-${Date.now()}-${i}`,
        title: l.replace(/^[-*\d.]\s*/, '').replace(/[*_`]/g, '').slice(0, 50),
        minutes: 20,
        completed: false,
      }));

    onAddExtractedTask({
      title,
      description: msg.content.slice(0, 200),
      domain: 'Engineering',
      priority: 'high',
      estimatedMinutes: bulletLines.length ? bulletLines.length * 20 : 45,
      spentMinutes: 0,
      completed: false,
      date: new Date().toISOString().split('T')[0],
      subtasks: bulletLines,
    });

    setAddedIds((prev) => ({ ...prev, [msg.id]: true }));
    sound.playCompletionChime();
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [msg.id]: false }));
    }, 2500);
  };

  return (
    <>
      {/* Floating Trigger Button when Closed */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={() => {
              sound.playClick();
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-[#172338] to-[#1E2E4A] hover:from-[#1E2E4A] hover:to-[#2A3E63] border border-[#8296FF]/40 text-xs font-semibold text-[var(--text-primary)] shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="w-5 h-5 rounded-full bg-[#8296FF]/20 flex items-center justify-center text-[#8296FF] group-hover:rotate-12 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">AI Co-Pilot</span>
            <span className="w-2 h-2 rounded-full bg-[#35C99A] animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Panel when Open */}
      {isOpen && (
        <div 
          className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 w-[92vw] sm:w-[420px] rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] shadow-2xl flex flex-col transition-all overflow-hidden ${
            isMinimized ? 'h-14' : 'h-[520px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[var(--inset-surface)] border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#8296FF]/20 border border-[#8296FF]/30 flex items-center justify-center text-[#8296FF]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">
                  AI Co-Pilot Drawer
                </span>
                <span className="text-[10px] font-mono text-[#8296FF]">
                  {selectedModel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToFullChat();
                  setIsOpen(false);
                }}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[#8296FF] hover:bg-[var(--card-surface)]"
                title="Expand to Full AI Dashboard"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)]"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsOpen(false);
                }}
                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-surface)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Persona Pill Strip */}
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[var(--canvas-bg)] border-b border-[var(--border-subtle)] overflow-x-auto scrollbar-none text-[11px]">
                {[
                  { id: 'strategic_coach', label: 'Coach' },
                  { id: 'momentum_pacer', label: 'Pacer' },
                  { id: 'task_extractor', label: 'Extractor' },
                  { id: 'grounded_research', label: 'Search' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedRole(r.id as any);
                      if (r.id === 'strategic_coach') setSelectedModel('gemini-3.8-flash');
                      if (r.id === 'momentum_pacer') setSelectedModel('gemini-3.8-flash');
                      if (r.id === 'task_extractor') setSelectedModel('gemini-3.1-flash-lite');
                      if (r.id === 'grounded_research') {
                        setSelectedModel('gemini-3.8-flash');
                        setSearchGrounding(true);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-all ${
                      selectedRole === r.id
                        ? 'bg-[#8296FF] text-[#0B1020]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs scrollbar-thin">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-6 h-6 rounded-md bg-[#8296FF]/20 flex items-center justify-center text-[#8296FF] shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl p-2.5 space-y-1.5 ${
                          isUser
                            ? 'bg-[#8296FF]/20 text-[var(--text-primary)] border border-[#8296FF]/30'
                            : 'bg-[var(--inset-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs">
                          {m.content}
                        </p>

                        {!isUser && (
                          <div className="pt-1.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px]">
                            <button
                              onClick={() => {
                                sound.playClick();
                                navigator.clipboard.writeText(m.content);
                                setCopiedId(m.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                            >
                              {copiedId === m.id ? <Check className="w-3 h-3 text-[#35C99A]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              onClick={() => handleConvertToCheckpoint(m)}
                              className="text-[#8296FF] hover:underline flex items-center gap-1 font-semibold"
                            >
                              {addedIds[m.id] ? <Check className="w-3 h-3 text-[#35C99A]" /> : <PlusCircle className="w-3 h-3" />}
                              <span>{addedIds[m.id] ? 'Added!' : '+ Board Checkpoint'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-mono p-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#8296FF] animate-spin" />
                    <span>{selectedModel} synthesizing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-2.5 bg-[var(--inset-surface)] border-t border-[var(--border-subtle)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Co-Pilot or enter checkpoint..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-[var(--card-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl bg-[#8296FF] text-[#0B1020] hover:bg-[#8296FF]/90 transition-all disabled:opacity-40 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
