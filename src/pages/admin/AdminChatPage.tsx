import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  MessageSquare,
  CheckCheck,
  Search,
  Users,
  Shield,
  Sparkles,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { chatService } from '../../services/chatService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Avatar, Badge, Button } from '../../components/ui';

export const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to extract the logged-in user's institutional identity and designation
  const getSenderProfile = () => {
    const roleLower = currentUser?.role?.toLowerCase() || 'team';
    const rawName = currentUser?.name?.trim() || (roleLower === 'admin' ? 'Dr. Rajesh Sharma' : 'OC Member');

    let designation = 'OC Member';
    if (roleLower === 'admin') {
      designation = 'Faculty Admin & Dean';
    } else if (currentUser?.department) {
      designation = `${currentUser.department} OC`;
    }

    const displayName = rawName.includes('(') ? rawName : `${rawName} (${designation})`;
    const senderId = currentUser?.id || currentUser?.email || 'usr-campus';
    const senderRole: 'admin' | 'team' = roleLower === 'admin' ? 'admin' : 'team';

    return { senderId, displayName, senderRole, designation };
  };

  // WhatsApp-style Sent vs Received: Check if message was actually sent by the logged-in user
  const isMessageFromMe = (msg: Message): boolean => {
    if (!currentUser) return false;

    // 1. Direct ID match
    if (currentUser.id && msg.senderId && String(msg.senderId) === String(currentUser.id)) {
      return true;
    }

    // 2. Direct Email match
    if (currentUser.email && msg.senderId && String(msg.senderId).toLowerCase() === currentUser.email.toLowerCase()) {
      return true;
    }

    // 3. Sender Name match
    if (currentUser.name && msg.senderName) {
      const userClean = currentUser.name.trim().toLowerCase();
      const senderClean = msg.senderName.trim().toLowerCase();

      // Matches if sender name begins with logged-in user's name (e.g. "Shweta Arya (OC Member)")
      if (senderClean.startsWith(userClean)) {
        return true;
      }

      // Check first name tokens
      const firstName = userClean.split(/\s+/)[0];
      if (firstName && firstName.length > 2 && senderClean.startsWith(firstName)) {
        return true;
      }
    }

    return false;
  };

  // Initial load: fetch conversations from PostgreSQL & current logged-in user
  useEffect(() => {
    const init = async () => {
      try {
        const [convs, user] = await Promise.all([
          chatService.getConversations(),
          authService.getCurrentUser(),
        ]);
        setConversations(convs);
        setCurrentUser(user);

        if (convs.length > 0) {
          // If logged in as an OC member, prefer the Central Operations Hub or Dean's Desk
          const preferredConv = convs.find(
            (c) => c.id === 'conv-hub' || c.id === 'conv-dean'
          );
          setActiveConvId(preferredConv ? preferredConv.id : convs[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize messenger:', err);
      }
    };
    init();
  }, []);

  // When active conversation changes, load its message history
  useEffect(() => {
    if (!activeConvId) return;

    const loadMessages = async () => {
      try {
        const msgs = await chatService.getMessages(activeConvId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load messages for conversation:', activeConvId, err);
      }
    };

    loadMessages();

    // Auto-poll for new incoming messages every 4 seconds (WhatsApp live sync)
    const interval = setInterval(async () => {
      try {
        const [freshMsgs, freshConvs] = await Promise.all([
          chatService.getMessages(activeConvId),
          chatService.getConversations(),
        ]);
        setMessages(freshMsgs);
        setConversations(freshConvs);
      } catch {
        // Suppress background poll errors during idle blips
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  // Send message using the current logged-in profile
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const profile = getSenderProfile();

    try {
      const sentMsg = await chatService.sendMessage(activeConvId, {
        conversationId: activeConvId,
        senderId: profile.senderId,
        senderName: profile.displayName,
        senderRole: profile.senderRole,
        content: textToSend,
        type: 'text',
      });

      // Optimistically append sent message
      setMessages((prev) => [...prev, sentMsg]);

      // Refresh left sidebar list to update preview and timestamp
      const updatedConvs = await chatService.getConversations();
      setConversations(updatedConvs);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Search filter across channel names and last messages
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.participantName.toLowerCase().includes(q) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  const profile = getSenderProfile();

  return (
    <PageContainer
      title="Campus Operations Messenger"
      subtitle="Real-time two-way WhatsApp channel between Faculty Administration and Organizing Committee Leads."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[720px] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: WhatsApp Channels & Search (col-span-4)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/40">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Campus Channels
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentUser?.role?.toUpperCase() === 'ADMIN' ? 'Faculty Admin Desk' : 'OC Department Console'}
                </p>
              </div>
            </div>

            <Badge variant="purple" size="sm">
              {conversations.length} Active
            </Badge>
          </div>

          {/* WhatsApp Search Bar */}
          <div className="p-3 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels or contacts..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-purple-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No active channels found matching "{searchQuery}".</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConvId === conv.id;
                const isHub = conv.id === 'conv-hub';
                const isDean = conv.id === 'conv-dean';

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-3.5 sm:p-4 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-purple-50/90 border-l-4 border-purple-600 shadow-xs'
                        : 'hover:bg-slate-100/70 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {isHub ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
                          <Users className="w-5 h-5" />
                        </div>
                      ) : isDean ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm font-bold text-xs">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                      ) : (
                        <Avatar name={conv.participantName} size="md" status="online" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-purple-950' : 'text-slate-900'}`}>
                            {conv.participantName}
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                          {conv.lastMessageTimestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        {isHub && (
                          <span className="text-[9px] font-semibold text-purple-700 bg-purple-100/80 px-1.5 py-0.2 rounded shrink-0">
                            Central Hub
                          </span>
                        )}
                        {isDean && (
                          <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded shrink-0">
                            Dean Desk
                          </span>
                        )}
                        <p className="text-xs text-slate-500 truncate font-normal">
                          {conv.lastMessage || 'No messages yet.'}
                        </p>
                      </div>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: WhatsApp Active Chat Window (col-span-8)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 flex flex-col bg-[#efeae2]/30 relative">
          
          {activeConv ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs z-10">
                <div className="flex items-center gap-3">
                  {activeConv.id === 'conv-hub' ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : activeConv.id === 'conv-dean' ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  ) : (
                    <Avatar name={activeConv.participantName} size="md" status="online" />
                  )}

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {activeConv.participantName}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      {activeConv.id === 'conv-hub'
                        ? 'All OC Committee Leads & Faculty Live'
                        : 'Active Institutional Channel'}
                    </p>
                  </div>
                </div>

                {/* Logged In User Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span className="font-semibold truncate max-w-[200px]">
                    {profile.displayName}
                  </span>
                </div>
              </div>

              {/* Messages Stream (WhatsApp Wallpaper Background) */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5">
                
                {/* Security Advisory Badge */}
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[11px] font-medium shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Official UPES operations log • Communications stored for fest reporting.</span>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Start a conversation with {activeConv.participantName}.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    // Strict identity check: is this message from the logged in user?
                    const isMe = isMessageFromMe(msg);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm space-y-1.5 shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                          }`}
                        >
                          {/* Sender Label and Timestamp */}
                          <div className={`flex justify-between items-center text-[10px] gap-3 ${
                            isMe ? 'text-purple-200 font-semibold' : 'text-slate-500'
                          }`}>
                            <span className={`font-bold ${isMe ? 'text-white' : 'text-purple-700'}`}>
                              {isMe ? 'You' : msg.senderName}
                            </span>
                            <span className="font-mono text-[10px] opacity-80 shrink-0">
                              {msg.timestamp}
                            </span>
                          </div>

                          {/* Message Body */}
                          <p className="leading-relaxed whitespace-pre-wrap font-normal">
                            {msg.content}
                          </p>

                          {/* Double Checkmark for Sent Messages */}
                          {isMe && (
                            <div className="flex justify-end pt-0.5 text-purple-200">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 z-10"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Type a message to ${activeConv.participantName}... (Press Enter to send)`}
                  className="flex-1 bg-slate-100/70 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-purple-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={!inputMessage.trim() || isSending}
                  icon={<Send className="w-3.5 h-3.5" />}
                  className="rounded-xl px-4 py-2.5"
                >
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <h4 className="text-sm font-semibold text-slate-700">No Channel Selected</h4>
              <p className="text-xs">Pick a channel from the left sidebar to start communicating.</p>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
