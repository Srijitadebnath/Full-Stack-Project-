import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { aiService, AIMessageResponse, AIProposalAction } from '../../services/aiService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input } from '../../components/ui';

export const AdminAIPage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessageResponse[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Hello Dr. Rajesh Sharma! I am your Smart Event Operations AI Assistant. You can ask me to propose OC team work allocations, generate optimized budgets, or summarize vendor progress.',
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'Create a work allocation plan for the registered OC members.',
    'Prepare a budget structure for this event.',
    'Show me vendors whose work is delayed.',
    'Which tasks need immediate attention?',
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg: AIMessageResponse = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    const aiRes = await aiService.askAI(prompt);
    setMessages((prev) => [...prev, aiRes]);
    setLoading(false);
  };

  const handleProposalAction = (propId: string, status: 'applied' | 'rejected') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.actionProposal && m.actionProposal.id === propId) {
          return {
            ...m,
            actionProposal: { ...m.actionProposal, status },
          };
        }
        return m;
      })
    );
  };

  return (
    <PageContainer
      title="AI Operations Assistant UI"
      subtitle="Interactive frontend preview interface for AI-assisted event workflows."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Suggested Prompts Sidebar */}
        <Card className="space-y-3 lg:col-span-1">
          <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Suggested Prompts</span>
          </div>

          <div className="space-y-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(p)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 text-xs font-medium text-slate-700 transition-all cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>
        </Card>

        {/* AI Chat Window */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-purple-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Operations AI Workflow Interface</h3>
                <span className="text-[10px] text-purple-600 font-medium">Frontend Architecture Preview</span>
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* AI Action Proposal Card Preview */}
                  {m.actionProposal && (
                    <div className="mt-3 p-3.5 bg-white text-slate-900 rounded-xl border border-purple-200/80 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-purple-900">{m.actionProposal.title}</h4>
                        <Badge variant={m.actionProposal.status === 'applied' ? 'emerald' : m.actionProposal.status === 'rejected' ? 'rose' : 'purple'}>
                          {m.actionProposal.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{m.actionProposal.summary}</p>

                      {/* Action buttons */}
                      {m.actionProposal.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProposalAction(m.actionProposal!.id, 'rejected')}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleProposalAction(m.actionProposal!.id, 'applied')}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Apply Proposal
                          </Button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 font-semibold pt-1">
                          ✓ Proposal successfully applied to Operations Database
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 italic">AI is analyzing event dataset...</div>}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="p-3 border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask AI to allocate team members or generate budget structure..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-purple-500"
            />
            <Button type="submit" icon={<Send className="w-3.5 h-3.5" />}>
              Ask AI
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
