import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { Card, Button } from '../../components/ui';

export const VendorAIPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello Aarav! Ask me about your assigned tasks, schedule, or report an issue.' },
  ]);
  const [prompt, setPrompt] = useState('');

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: prompt },
      { sender: 'ai', text: `I have noted your request: "${prompt}". Your stage sound setup task is 75% complete and due today at 6:00 PM.` },
    ]);
    setPrompt('');
  };

  return (
    <PageContainer title="Vendor AI Assistant" subtitle="Ask questions regarding your work schedule or report delayed tasks.">
      <Card className="max-w-2xl mx-auto h-[500px] flex flex-col p-0 overflow-hidden">
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-purple-900">Vendor Operations Assistant</h3>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-2xl text-xs max-w-md ${
                  m.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-50 text-slate-800 border border-slate-100'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAsk} className="p-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Summarize my pending tasks..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
          />
          <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
            Ask
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
};
