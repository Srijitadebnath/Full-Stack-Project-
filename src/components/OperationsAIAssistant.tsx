import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Bot,
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
              <strong key={pIdx} className="font-bold text-[#1E1B2E]">
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

  // Fix: Clean greeting so we never repeat "Dr. Dr.!"
  // If user name has "Dr." prefix, extract the name cleanly
  const rawName = user?.name || (isAdmin ? 'Dr. Sharma' : 'Team Member');
  const cleanNameWithoutDr = rawName.replace(/^Dr\.?\s*/i, '').trim();
  const greetingDisplayName = isAdmin ? `Dr. ${cleanNameWithoutDr.split(' ')[0] || 'Sharma'}` : cleanNameWithoutDr.split(' ')[0];

  const defaultWelcomeMessage: AIMessageResponse = {
    id: 'op-ai-welcome',
    sender: 'ai',
    text: isAdmin
      ? `Hello ${greetingDisplayName}! I am your **EVENTRA Faculty Operations AI Copilot**.\n\nI can analyze real-time event budgets, audit vendor milestones, flag delayed tasks, and generate work allocation plans for your OC crew.`
      : `Hello ${greetingDisplayName}! I am your **EVENTRA OC Operations Assistant**.\n\nAsk me about your assigned tasks, deadlines, fellow OC team members, submission rules, or campus conduct policies!`,
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
      const aiReply = await aiService.askAI(text, { role });
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const errorMsg: AIMessageResponse = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving real-time campus data. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        /* Floating Glass Panel (Design Specification: width ~400px, max-height 80vh, radius 28px, blur 24px) */
        <div className="w-[calc(100vw-2.5rem)] sm:w-[400px] h-[580px] max-h-[82vh] glass-panel rounded-[28px] border border-white/80 shadow-[0_20px_60px_-10px_rgba(124,58,237,0.22)] flex flex-col overflow-hidden animate-fade-scale">
          
          {/* Header: Brand Gradient with Glass Shine */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-500 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
            {/* Ambient Shine Overlay */}
            <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center relative shadow-xs">
                {isAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-100" />
                )}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-800 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-wide flex items-center gap-2">
                  <span>EVENTRA AI</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md uppercase tracking-wider font-bold border border-white/30">
                    {isAdmin ? 'ADMIN' : 'OC TEAM'}
                  </span>
                </h3>
                <p className="text-[10px] text-purple-100 font-medium">
                  {isAdmin ? 'Faculty Operations Copilot' : 'OC Operations Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <button
                type="button"
                onClick={handleReset}
                title="Reset Conversation"
                className="p-1.5 rounded-full hover:bg-white/20 text-purple-100 hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenFullPage}
                title="Open Full Page View"
                className="p-1.5 rounded-full hover:bg-white/20 text-purple-100 hover:text-white transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Panel"
                className="p-1.5 rounded-full hover:bg-white/20 text-purple-100 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-[#FAF8FC]/80 to-[#F4F1F9]/90 custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0 flex items-center justify-center font-bold text-xs shadow-xs mt-0.5">
                      ✨
                    </div>
                  )}

                  <div
                    className={`p-3.5 text-xs max-w-[85%] space-y-2 shadow-xs transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-[20px] rounded-tr-sm shadow-purple-600/20'
                        : 'glass-card bg-white/90 text-[#1E1B2E] border border-white/90 rounded-[20px] rounded-tl-sm'
                    }`}
                  >
                    <div className="space-y-1 text-xs">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Agentic Event Proposal Action Card */}
                    {msg.proposal && (
                      <EventProposalCard proposal={msg.proposal} />
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-500/10 text-[10px]">
                      <span className={isUser ? 'text-purple-200' : 'text-[#8B87A3]'}>
                        {msg.timestamp}
                      </span>
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {msg.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 font-semibold text-[9px]"
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

            {/* Typing Indicator with 3 Bouncing Dots */}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shrink-0 flex items-center justify-center text-xs shadow-xs">
                  ✨
                </div>
                <div className="px-4 py-3 rounded-[20px] glass-card text-xs text-[#4B4763] flex items-center gap-2">
                  <span className="text-[11px] font-medium mr-1">
                    {isAdmin ? 'Analyzing campus telemetry' : 'Consulting duties'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce-dot-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce-dot-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce-dot-3" />
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Horizontally Scrollable Suggestion Chips (Prompt: edge fade, hidden scrollbar, neumorphic raised pills) */}
          <div className="relative px-3 py-2 bg-white/60 backdrop-blur-md border-t border-purple-500/10">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(qp)}
                  disabled={loading}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full neo-raised text-[#4B4763] hover:text-purple-700 hover:shadow-md text-[11px] font-semibold border border-white/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Inset Pill Input with Round Gradient Send Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white/80 backdrop-blur-md border-t border-purple-500/10 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAdmin
                    ? 'Ask about budgets, tasks, or OC work allocation...'
                    : 'Ask about duties, roster, or conduct rules...'
                }
                disabled={loading}
                className="w-full h-11 pl-4 pr-11 neo-inset rounded-full text-xs text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/35 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-sm shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Closable Floating Launcher Button (Gradient Circle with Sparkle Icon) */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white rounded-full shadow-[0_10px_25px_rgba(124,58,237,0.35)] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer border border-white/30 backdrop-blur-md"
          aria-label="Open EVENTRA AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-700 absolute -top-1 -right-1" />
          </div>
          <div className="flex items-center gap-2 pr-1">
            <span className="text-xs font-bold tracking-tight">EVENTRA AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider text-purple-100 border border-white/30">
              {isAdmin ? 'ADMIN' : 'OC'}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
