import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ShieldAlert, Users, CheckSquare, Wrench, AlertCircle, RefreshCw } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  PillButton,
  Chip,
  Card,
  Badge,
  Button,
} from '../../components/ui';
import { aiService, AIMessageResponse } from '../../services/aiService';
import { authService } from '../../services/authService';
import { User } from '../../types';

function renderFormattedText(text: string) {
  return text.split('\n').map((line, idx) => {
    if (!line.trim()) {
      return <span key={idx} className="block h-2" />;
    }
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={idx} className="block leading-relaxed">
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-semibold text-slate-900">
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

export const VendorAIPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessageResponse[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setCurrentUser(u);
      const name = u?.name ? u.name.split(' ')[0] : 'Team Member';
      setMessages([
        {
          id: 'team-init',
          sender: 'ai',
          text: `Hello **${name}**! I am your **EVENTRA OC Operations AI Assistant**.\n\nI am connected to your live tasks database, fellow team member roster, and university operational conduct policies. Ask me about your assigned duties, team members, submission steps, or conduct rules!`,
          timestamp: 'Online',
          sources: ['Live Tasks DB', 'OC Roster', 'Campus Policies'],
        },
      ]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    { label: 'My assigned tasks & deadlines', icon: <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> },
    { label: 'Who are my fellow OC team members?', icon: <Users className="w-3.5 h-3.5 text-cyan-600" /> },
    { label: 'How do I submit work proof for my task?', icon: <AlertCircle className="w-3.5 h-3.5 text-emerald-600" /> },
    { label: 'What is the OC disciplinary code and conduct policy?', icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> },
    { label: 'What is the venue maintenance and asset handover protocol?', icon: <Wrench className="w-3.5 h-3.5 text-blue-600" /> },
    { label: 'What is the emergency and first aid protocol?', icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? prompt).trim();
    if (!text || loading) return;

    const userMsg: AIMessageResponse = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setPrompt('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'team-init')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await aiService.askAI(text, {
        role: 'TEAM',
        eventId: currentUser?.assignedEventId,
        history,
      });

      setMessages((prev) => [...prev, res]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Could not fetch response right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Error Handler'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const name = currentUser?.name ? currentUser.name.split(' ')[0] : 'Team Member';
    setMessages([
      {
        id: 'team-init',
        sender: 'ai',
        text: `Chat cleared. Hello **${name}**! How can I assist you with your event duties or policies?`,
        timestamp: 'Online',
        sources: ['Live Tasks DB', 'OC Roster', 'Campus Policies'],
      },
    ]);
  };

  return (
    <PageContainer
      title="OC Operations & Team Assistant"
      subtitle="Grounded in your live assigned tasks, fellow OC roster, and university operational conduct policies."
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Info Bar (Glass Card) */}
        <GlassCard className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/25">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="font-bold text-[#1E1B2E] flex items-center gap-2 text-sm">
                <span>{currentUser?.name || 'OC Member'}</span>
                <Chip variant="purple">{currentUser?.department || 'Operations'}</Chip>
              </div>
              <p className="text-[11px] text-[#8B87A3] mt-0.5">
                Assigned Event: <strong className="text-purple-700">{currentUser?.assignedEventName || 'Active Campus Event'}</strong>
              </p>
            </div>
          </div>
          <PillButton
            variant="glass"
            size="sm"
            onClick={handleClearChat}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Chat
          </PillButton>
        </GlassCard>

        {/* Quick Suggested Prompt Pills */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#8B87A3] uppercase tracking-wider px-1">Common Queries</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.label)}
                disabled={loading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full neo-raised hover:bg-white text-xs text-[#4B4763] hover:text-purple-700 font-semibold transition-all border border-white/80 cursor-pointer disabled:opacity-50"
              >
                {qp.icon}
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window (Glass Panel) */}
        <div className="h-[540px] flex flex-col glass-panel rounded-[28px] border border-white/80 shadow-[0_16px_40px_rgba(124,58,237,0.12)] overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm mt-0.5">
                    ✨
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-xl space-y-2 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <div className="space-y-1">
                    {renderFormattedText(m.text)}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60 text-[10px]">
                    <span className={m.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}>
                      {m.timestamp}
                    </span>
                    {m.sender === 'ai' && m.sources && m.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {m.sources.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm">
                  ✨
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <span>Checking live tasks and consulting campus policy...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-white/60 backdrop-blur-md border-t border-purple-500/10 flex gap-2 items-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about duties, roster, or conduct rules..."
                disabled={loading}
                className="w-full h-11 pl-4 pr-12 neo-inset text-xs sm:text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/35 transition-all rounded-full disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                aria-label="Send prompt"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full btn-primary flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
