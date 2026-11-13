import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Calendar,
  CheckSquare,
  DollarSign,
  Users,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { aiService, AIMessageResponse } from '../../services/aiService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  PillButton,
  Chip,
  Card,
  Badge,
  Button,
} from '../../components/ui';
import { EventProposalCard } from '../../components/EventProposalCard';

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

export const AdminAIPage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessageResponse[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello Dr. Rajesh Sharma! I am your **EVENTRA Faculty Operations AI Copilot**.\n\nI can analyze real-time event budgets, audit vendor milestones, flag delayed tasks, check seat capacities, and provide structured operational plans (schedules, rounds, budget splits & OC duties) for upcoming campus events.',
      timestamp: 'Online',
      sources: ['Live Events DB', 'Budgets & Expenses', 'Tasks Directory'],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const suggestedPrompts = [
    {
      label: 'How should we structure a 2-day AI Hackathon schedule, rounds, and OC duties at MAC Auditorium?',
      category: 'Event Planning Advisor',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
    },
    {
      label: 'Analyze budget vs expenses for active events',
      category: 'Financial Intelligence',
      icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      label: 'Which tasks or vendors are currently delayed?',
      category: 'Operational Audit',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      label: 'What is our overall seat capacity and registration status across events?',
      category: 'Capacity Audit',
      icon: <Calendar className="w-3.5 h-3.5 text-sky-600" />,
    },
    {
      label: 'Propose work allocations for registered OC members',
      category: 'Team Management',
      icon: <Users className="w-3.5 h-3.5 text-indigo-600" />,
    },
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = (textToSend ?? inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: AIMessageResponse = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'msg-init')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const aiRes = await aiService.askAI(prompt, {
        role: 'ADMIN',
        history,
      });

      setMessages((prev) => [...prev, aiRes]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to AI Assistant.';
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${msg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Error Handler'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: 'Chat reset. Hello Dr. Rajesh Sharma! Ask about live campus budgets, task delays, OC crew, or event planning advice.',
        timestamp: 'Online',
        sources: ['Live Events DB', 'Budgets & Expenses', 'Tasks Directory'],
      },
    ]);
  };

  return (
    <PageContainer
      title="EVENTRA AI • Faculty Operations Copilot"
      subtitle="Real-time campus operational intelligence, live budget auditing, task monitoring, and expert event planning guidance."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Suggested Prompts Sidebar (Glass Card) */}
        <GlassCard className="space-y-3.5 lg:col-span-1 h-fit p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Operational AI</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              title="Reset Chat"
              className="p-1.5 rounded-full text-slate-400 hover:text-purple-600 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#8B87A3] leading-relaxed">
            Click any query below to audit live campus data or request structured event schedules and duty allocations:
          </p>

          <div className="space-y-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(p.label)}
                disabled={loading}
                className="w-full text-left p-3 rounded-2xl neo-inset hover:bg-white/80 text-xs text-[#4B4763] hover:text-[#1E1B2E] transition-all cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 mb-1">
                  {p.icon}
                  <span>{p.category}</span>
                </div>
                <span className="block leading-snug group-hover:text-purple-950 font-medium">
                  &quot;{p.label}&quot;
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* AI Chat Window (Glass Panel) */}
        <div className="lg:col-span-3 flex flex-col glass-panel rounded-[28px] border border-white/80 shadow-[0_16px_40px_rgba(124,58,237,0.12)] overflow-hidden h-[680px]">
          {/* Header */}
          <div className="p-4 border-b border-purple-500/10 bg-white/60 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1E1B2E] flex items-center gap-1.5">
                  <span>EVENTRA Faculty Operations AI</span>
                  <Badge variant="purple">Live Operations</Badge>
                </h3>
                <span className="text-[10px] text-slate-500 font-medium">
                  Connected to Neon PostgreSQL &amp; Local Llama 3.2 1B
                </span>
              </div>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-purple-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs mt-0.5">
                      ✨
                    </div>
                  )}

                  <div
                    className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2 shadow-xs ${
                      isUser
                        ? 'bg-purple-700 text-white rounded-br-none'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(m.text)}
                    </div>

                    {/* Agentic Event Proposal Action Card */}
                    {m.proposal && (
                      <EventProposalCard proposal={m.proposal} />
                    )}

                    {/* Footer Sources */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/70 text-[10px]">
                      <span className={isUser ? 'text-purple-200' : 'text-slate-400'}>
                        {m.timestamp}
                      </span>
                      {!isUser && m.sources && m.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {m.sources.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium text-[9px] border border-purple-100"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-purple-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                  ✨
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  <span>Synthesizing event blueprint and reviewing campus resources...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="p-3.5 bg-white/60 backdrop-blur-md border-t border-purple-500/10 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="e.g. Plan a 2-day Robotics Bootcamp next month at MAC Auditorium for 200 students with ₹45,000 budget..."
                disabled={loading}
                className="w-full h-11 pl-4 pr-12 neo-inset text-xs sm:text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/35 transition-all rounded-full disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
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
