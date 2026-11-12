import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  RotateCcw,
  Bot,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { User } from '../types';
import { aiService, AIMessageResponse, AssistantRole } from '../services/aiService';
import { EventProposalCard } from './EventProposalCard';

interface OperationsAIAssistantProps {
  user: User | null;
}

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

export const OperationsAIAssistant: React.FC<OperationsAIAssistantProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const role: AssistantRole = isAdmin ? 'ADMIN' : 'TEAM';
  const firstName = user?.name ? user.name.split(' ')[0] : (isAdmin ? 'Professor' : 'Team Member');

  const defaultWelcomeMessage: AIMessageResponse = {
    id: 'op-ai-welcome',
    sender: 'ai',
    text: isAdmin
      ? `Hello Dr. ${firstName}! I am your **EVENTRA Faculty Operations AI Copilot**.\n\nI can analyze real-time event budgets, audit vendor milestones, flag delayed tasks, and generate work allocation plans for your OC crew.`
      : `Hello ${firstName}! I am your **EVENTRA OC Operations Assistant**.\n\nAsk me about your assigned tasks, deadlines, fellow OC team members, submission rules, or campus conduct policies!`,
    timestamp: 'Online',
    sources: isAdmin
      ? ['Live Events DB', 'Budgets & Expenses', 'Tasks Directory']
      : ['Live Tasks DB', 'OC Roster', 'Campus Policies'],
  };

  const [messages, setMessages] = useState<AIMessageResponse[]>([defaultWelcomeMessage]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const adminPrompts = [
    'Analyze budget vs expenses for active events',
    'Which tasks or vendors are currently delayed?',
    'Propose work allocations for registered OC members',
    'Summarize total registration and seat counts',
  ];

  const teamPrompts = [
    'What are my assigned tasks & deadlines?',
    'Who are my fellow OC team members?',
    'How do I submit work proof for my task?',
    'What is the OC disciplinary code and conduct policy?',
    'What is the venue maintenance and asset return protocol?',
  ];

  const quickPrompts = isAdmin ? adminPrompts : teamPrompts;

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
        .filter((m) => m.id !== 'op-ai-welcome')
        .slice(-6)
        .map((m) => ({ sender: m.sender, text: m.text }));

      const reply = await aiService.askAI(text, {
        role,
        eventId: user?.assignedEventId,
        history: recentHistory,
      });

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unable to reach Operations AI right now.';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Could not reach operations assistant: ${errMsg}. Please check that the server is online.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: ['Error Handler'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([defaultWelcomeMessage]);
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    navigate(isAdmin ? '/admin/ai' : '/vendor/ai');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Expanded Floating AI Assistant Panel */}
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[420px] h-[560px] bg-white rounded-3xl border border-purple-200/90 shadow-2xl shadow-purple-950/25 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center relative shadow-xs">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-200" />
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-800 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <span>{isAdmin ? 'Faculty Operations AI' : 'OC Team Assistant'}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 uppercase tracking-wider font-semibold">
                    {isAdmin ? 'Admin' : 'OC Staff'}
                  </span>
                </h3>
                <p className="text-[10px] text-purple-200 font-medium">
                  {isAdmin
                    ? 'Event Budgets, Tasks & OC Allocation Copilot'
                    : 'Tasks, Roster & Operational Conduct Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                title="Reset Conversation"
                className="p-1.5 rounded-xl hover:bg-white/15 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenFullPage}
                title="Open Full Page View"
                className="p-1.5 rounded-xl hover:bg-white/15 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Panel"
                className="p-1.5 rounded-xl hover:bg-white/15 text-purple-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#faf9fc]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-purple-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs mt-0.5">
                      ✨
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[85%] space-y-1.5 shadow-xs ${
                      isUser
                        ? 'bg-purple-700 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    <div className="space-y-1">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Agentic Event Proposal Action Card */}
                    {msg.proposal && (
                      <EventProposalCard proposal={msg.proposal} />
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/70 text-[10px]">
                      <span className={isUser ? 'text-purple-200' : 'text-slate-400'}>
                        {msg.timestamp}
                      </span>
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {msg.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium text-[9px] border border-purple-100"
                            >
                              {src}
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
              <div className="flex gap-2 justify-start items-center">
                <div className="w-7 h-7 rounded-xl bg-purple-700 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                  ✨
                </div>
                <div className="p-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  <span className="text-[11px]">
                    {isAdmin
                      ? 'Analyzing operations DB & synthesizing proposal...'
                      : 'Consulting tasks roster & campus policy...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-[11px] font-medium border border-slate-200/60 hover:border-purple-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isAdmin
                  ? 'Ask about budgets, tasks, or OC work allocation...'
                  : 'Ask about your duties, roster, or conduct rules...'
              }
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-purple-700 text-white hover:bg-purple-800 disabled:opacity-40 disabled:hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* Floating Launcher Icon in Bottom-Right Corner */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-purple-900/30 hover:shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border border-white/20"
          aria-label="Open AI Operations Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-700 absolute -top-1 -right-1" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold leading-tight">
              {isAdmin ? 'Faculty AI' : 'OC Team AI'}
            </span>
            <span className="block text-[10px] text-purple-200 font-medium leading-tight">
              {isAdmin ? 'Operations Copilot' : 'Duty Assistant'}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
