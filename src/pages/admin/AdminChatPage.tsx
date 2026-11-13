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
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[720px] glass-panel rounded-[28px] border border-white/80 shadow-[0_16px_40px_rgba(124,58,237,0.12)] overflow-hidden">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: Glass Sidebar Channels & Search (col-span-4)*/}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-purple-500/10 flex flex-col bg-white/40">
          
          {/* Header */}
          <div className="p-4 border-b border-purple-500/10 bg-white/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#1E1B2E] uppercase tracking-wider">
                  Campus Channels
                </h3>
                <p className="text-[11px] text-[#8B87A3] font-medium">
                  {currentUser?.role?.toUpperCase() === 'ADMIN' ? 'Faculty Admin Desk' : 'OC Department Console'}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-700">
              {conversations.length} Active
            </span>
          </div>

          {/* Neumorphic Inset Search Bar */}
          <div className="p-3 bg-white/30 border-b border-purple-500/10">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B87A3] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels or contacts..."
                className="w-full h-10 pl-10 pr-3 neo-inset text-xs text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all rounded-full"
              />
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto divide-y divide-purple-500/8 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8B87A3] space-y-2">
                <MessageSquare className="w-8 h-8 text-purple-300 mx-auto" />
                <p>No active channels found matching &quot;{searchQuery}&quot;.</p>
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
                        ? 'bg-white/95 neo-raised border-l-4 border-purple-600 shadow-xs'
                        : 'hover:bg-white/60 border-l-4 border-transparent'
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
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-purple-950 font-extrabold' : 'text-[#1E1B2E]'}`}>
                            {conv.participantName}
                          </h4>
                        </div>
                        <span className="text-[10px] text-[#8B87A3] font-mono shrink-0 ml-1">
                          {conv.lastMessageTimestamp}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        {isHub && (
                          <span className="text-[9px] font-bold text-purple-700 bg-purple-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Central Hub
                          </span>
                        )}
                        {isDean && (
                          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                            Dean Desk
                          </span>
                        )}
                        <p className="text-xs text-[#8B87A3] truncate font-normal">
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
        {/* RIGHT PANEL: Glass Message Area (col-span-8)             */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 flex flex-col bg-white/20 relative">
          
          {activeConv ? (
            <>
              {/* Active Conversation Top Bar */}
              <div className="p-3.5 sm:p-4 border-b border-purple-500/10 bg-white/60 backdrop-blur-md flex items-center justify-between shadow-xs z-10">
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
                    <h3 className="text-sm font-bold text-[#1E1B2E] leading-snug">
                      {activeConv.participantName}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      {activeConv.id === 'conv-hub'
                        ? 'All OC Committee Leads & Faculty Live'
                        : 'Active Institutional Channel'}
                    </p>
                  </div>
                </div>

                {/* Logged In User Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full neo-raised border border-white/80 text-purple-900 text-xs">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span className="font-bold truncate max-w-[200px]">
                    {profile.displayName}
                  </span>
                </div>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar">
                
                {/* Security Advisory Badge */}
                <div className="flex justify-center mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-800 text-[11px] font-semibold shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Official UPES operations log • Communications stored for fest reporting.</span>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#8B87A3] space-y-2">
                    <MessageSquare className="w-8 h-8 text-purple-300 mx-auto" />
                    <p>Start a conversation with {activeConv.participantName}.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = isMessageFromMe(msg);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md p-4 text-xs sm:text-sm space-y-1.5 shadow-xs transition-all ${
                            isMe
                              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-[22px] rounded-tr-sm shadow-purple-600/20'
                              : 'glass-card bg-white/95 text-[#1E1B2E] border border-white/90 rounded-[22px] rounded-tl-sm'
                          }`}
                        >
                          {/* Sender Label and Timestamp */}
                          <div className={`flex justify-between items-center text-[10px] gap-3 ${
                            isMe ? 'text-purple-200 font-semibold' : 'text-[#8B87A3]'
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

              {/* Message Input Bar (Neumorphic Inset with Round Gradient Send Button) */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white/60 backdrop-blur-md border-t border-purple-500/10 flex items-center gap-2.5 z-10"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Type a message to ${activeConv.participantName}... (Press Enter to send)`}
                    className="w-full h-11 pl-4 pr-12 neo-inset text-xs sm:text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/35 transition-all rounded-full"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    aria-label="Send message"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full btn-primary flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8B87A3] space-y-2">
              <MessageSquare className="w-10 h-10 text-purple-300" />
              <h4 className="text-sm font-bold text-[#1E1B2E]">No Channel Selected</h4>
              <p className="text-xs">Pick a channel from the left sidebar to start communicating.</p>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
