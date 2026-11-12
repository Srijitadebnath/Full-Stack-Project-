import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Sparkles, Database, Loader2 } from 'lucide-react';
import { aiService, AIMessageResponse } from '../services/aiService';
import { User } from '../types';

interface StudentAIAssistantProps {
  currentUser: User | null;
}

/**
 * Renders lightweight bold (**text**) and line-break formatting safely inside React JSX.
 */
function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1rem]">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-slate-900">
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

export const StudentAIAssistant: React.FC<StudentAIAssistantProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessageResponse[]>([
    {
      id: 'stu-ai-welcome',
      sender: 'ai',
      text: `Hi ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am the **EVENTRA Student Assistant**. Ask me about live campus event seats, schedules, venues, QR passes, or UPES fest rules.`,
      timestamp: 'Online',
      sources: ['Live Events DB', 'UPES Policy Guide'],
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Open seats right now?',
    'How to get my QR pass?',
    'Entry rules & dress code?',
    currentUser ? 'Show my registered passes' : 'How to join as OC?',
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
          text: `Sorry, I could not connect to the campus database right now (${errMsg}). Please make sure the server is running.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Popped-Out Assistant Window */}
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[390px] h-[530px] bg-white rounded-3xl border border-purple-200/80 shadow-2xl shadow-purple-950/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center relative">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-700 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                  <span>EVENTRA Student AI</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[10px] text-purple-100/90 font-medium">
                  Live Campus DB &amp; Policy Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Minimize Assistant"
              className="p-1.5 rounded-xl hover:bg-white/15 text-purple-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#faf9fc]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-xs space-y-1'
                    }`}
                  >
                    {isUser ? msg.text : renderFormattedText(msg.text)}
                  </div>

                  {/* Retrieved Source Chips for AI replies */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                      <Database className="w-2.5 h-2.5 text-purple-500" />
                      {msg.sources.map((src) => (
                        <span
                          key={src}
                          className="text-[9px] font-semibold text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded-md"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-2xl px-3 py-2 w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking live events &amp; rules...</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick-Tap Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about events, venues, QR passes..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Collapsed Floating Messenger Logo Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open EVENTRA Student Assistant"
          className="group flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xl shadow-purple-700/35 border border-white/20 transition-all hover:scale-105 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-700 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline pr-1">
            EVENTRA AI Help
          </span>
        </button>
      )}
    </div>
  );
};
