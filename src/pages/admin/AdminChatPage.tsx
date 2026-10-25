import React, { useEffect, useState } from 'react';
import { Send, Image, Mic, Paperclip, MessageSquare } from 'lucide-react';
import { Conversation, Message } from '../../types';
import { chatService } from '../../services/chatService';
import { PageContainer } from '../../components/layout';
import { Card, Avatar, Input, Button } from '../../components/ui';

export const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv-801');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const loadData = async () => {
    const convs = await chatService.getConversations();
    setConversations(convs);
    const msgs = await chatService.getMessages(activeConvId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadData();
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    await chatService.sendMessage(activeConvId, {
      conversationId: activeConvId,
      senderId: 'user-admin-1',
      senderName: 'Dr. Rajesh Sharma',
      senderRole: 'admin',
      content: inputMessage,
      type: 'text',
    });

    setInputMessage('');
    loadData();
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <PageContainer
      title="Operations Messenger"
      subtitle="Direct communication line with vendors and organizing committee team leads."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[650px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-0">
        {/* Left Conversation List */}
        <div className="border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                  activeConvId === conv.id ? 'bg-purple-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <Avatar name={conv.participantName} src={conv.participantAvatar} size="md" status="online" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{conv.participantName}</h4>
                    <span className="text-[10px] text-slate-400">{conv.lastMessageTimestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Window */}
        <div className="lg:col-span-2 flex flex-col bg-slate-50/30">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={activeConv?.participantName || 'Chat'} src={activeConv?.participantAvatar} size="md" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{activeConv?.participantName}</h3>
                <span className="text-[11px] text-purple-600 font-medium">{activeConv?.eventName}</span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isAdmin = msg.senderRole === 'admin';
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 ${
                      isAdmin
                        ? 'bg-purple-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] opacity-75 gap-2">
                      <span className="font-semibold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <button type="button" onClick={() => alert('Photo attachment picker')} className="p-2 text-slate-400 hover:text-slate-600">
              <Image className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => alert('Record voice update')} className="p-2 text-slate-400 hover:text-slate-600">
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type message to vendor or OC team..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-purple-500"
            />
            <Button type="submit" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};
