import React, { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Database,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { aiService, AIMessageResponse } from '../services/aiService';
import { authService } from '../services/authService';
import { User } from '../types';

interface StudentAIAssistantProps {
  currentUser?: User | null;
}

/**
 * Renders lightweight bold (**text**) and line-break formatting safely inside React JSX.
 */
function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1.1rem]">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[var(--color-text-heading,#1E1B2E)]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
        })}
      </span>
    );
  });
}

export const StudentAIAssistant: React.FC<StudentAIAssistantProps> = ({ currentUser: propUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(propUser ?? null);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      authService.getCurrentUser().then(setUser);
    }
  }, [propUser]);

  const cleanFirstName = user?.name
    ? user.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim().split(' ')[0]
    : '';

  const initialWelcome: AIMessageResponse = {
    id: 'stu-ai-welcome',
    sender: 'ai',
    text: `Hello ${cleanFirstName || 'Student'}! I am your **EVENTRA Campus Copilot**.\n\nI can verify real-time seat availability, lookup campus venue schedules, show your digital QR passes, or guide you through joining the Fest Committee.`,
    timestamp: 'Live',
    sources: ['Live Events DB', 'UPES Portal Regulations'],
  };

  const [messages, setMessages] = useState<AIMessageResponse[]>([initialWelcome]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Available seats right now?',
    'How do I get my QR pass?',
    'Upcoming hackathons & fests',
    'How to apply for OC Team?',
  ];

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt ?? input).trim();
    if (!text || loading) return;

    const userMsg: AIMessageResponse = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const recentHistory = messages
        .filter((m) => m.id !== 'stu-ai-welcome')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const reply = await aiService.askAI(text, {
        role: 'USER',
        history: recentHistory,
      });
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unable to reach Campus AI right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `Sorry, I could not query the live events database (${errMsg}). Please check back shortly.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([initialWelcome]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Popped-Out Assistant Window */}
      {isOpen ? (
        <div
          className={`${
            isExpanded
              ? 'w-[calc(100vw-2.5rem)] sm:w-[500px] h-[640px]'
              : 'w-[calc(100vw-2.5rem)] sm:w-[410px] h-[540px]'
          } glass-panel rounded-3xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 transition-all`}
        >
          {/* Header with Brand Gradient and Glass Shine */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#C084FC] text-white flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#7C3AED] absolute -bottom-0.5 -right-0.5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold tracking-tight">EVENTRA AI</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                    Student
                  </span>
                </div>
                <p className="text-[11px] text-purple-100 font-medium">Campus Events &amp; Passes Copilot</p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize width' : 'Expand width'}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F5FB]/70 backdrop-blur-md">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] px-4 py-3 text-xs leading-relaxed ${
                      isUser
                        ? 'btn-primary text-white rounded-3xl rounded-br-xs shadow-[0_4px_16px_rgba(124,58,237,0.25)]'
                        : 'bg-white/90 backdrop-blur-md text-[var(--color-text-body,#4B4763)] border border-white/90 rounded-3xl rounded-bl-xs shadow-[0_4px_16px_rgba(124,58,237,0.05)] space-y-1'
                    }`}
                  >
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>

                  {/* Sources as tiny tinted chips */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 px-2">
                      <Database className="w-3 h-3 text-purple-600" />
                      {msg.sources.map((src) => (
                        <span
                          key={src}
                          className="text-[9px] font-semibold text-purple-700 bg-purple-100/70 border border-purple-200/50 px-2 py-0.5 rounded-full"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator with 3 Bouncing Dots */}
            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white/90 backdrop-blur-md border border-white/90 rounded-2xl rounded-bl-xs w-fit shadow-xs">
                <span className="text-xs text-purple-700 font-semibold mr-1">Consulting Campus DB</span>
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick-Action Suggestion Pills (Horizontally scrollable with edge fade) */}
          <div className="px-3 py-2 bg-white/70 backdrop-blur-md border-t border-white/80 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-purple-700 border border-white/80 neo-raised transition-all cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar with Inset Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white/90 backdrop-blur-md border-t border-white/80 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, venues, seats, QR passes..."
              className="flex-1 neo-inset rounded-full px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] placeholder:text-[var(--color-text-muted,#8B87A3)] bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full btn-primary flex items-center justify-center text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Collapsed Floating Pill Launcher */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open EVENTRA Student Assistant"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full btn-primary text-white shadow-[0_10px_24px_rgba(124,58,237,0.35)] hover:shadow-[0_14px_30px_rgba(124,58,237,0.45)] transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#7C3AED] absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">EVENTRA AI Help</span>
        </button>
      )}
    </div>
  );
};
