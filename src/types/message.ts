export type MessageType = 'text' | 'image' | 'voice' | 'attachment';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'team';
  timestamp: string;
  content: string;
  type: MessageType;
  fileUrl?: string;
  audioDurationSeconds?: number;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: 'team' | 'admin';
  participantAvatar?: string;
  eventId?: string;
  eventName?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}
