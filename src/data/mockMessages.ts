import { Conversation, Message } from '../types';

export const mockConversations: Conversation[] = [
  {
    id: 'conv-801',
    participantName: 'Aarav Verma (Sound OC Lead)',
    participantRole: 'team',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    eventId: 'evt-101',
    eventName: 'TechFest UPES 2026',
    lastMessage: 'The LED wall power supply is ready for final inspection.',
    lastMessageTimestamp: '10:45 AM',
    unreadCount: 2,
  },
  {
    id: 'conv-802',
    participantName: 'Priya Patel (OC Lead)',
    participantRole: 'team',
    participantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    eventId: 'evt-101',
    eventName: 'TechFest UPES 2026',
    lastMessage: 'All 427 participant badges have been verified.',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
  },
];

export const mockMessages: Record<string, Message[]> = {
  'conv-801': [
    {
      id: 'msg-1',
      conversationId: 'conv-801',
      senderId: 'user-team-2',
      senderName: 'Aarav Verma',
      senderRole: 'team',
      timestamp: '10:30 AM',
      content: 'Hello Sir, we have finished installing the main stage speakers with OC team.',
      type: 'text',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-801',
      senderId: 'user-admin-1',
      senderName: 'Dr. Rajesh Sharma',
      senderRole: 'admin',
      timestamp: '10:38 AM',
      content: 'Great Aarav! Please ensure the decibel levels comply with campus rules after 10 PM.',
      type: 'text',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-801',
      senderId: 'user-team-2',
      senderName: 'Aarav Verma',
      senderRole: 'team',
      timestamp: '10:45 AM',
      content: 'The LED wall power supply is ready for final inspection.',
      type: 'text',
    },
  ],
};
