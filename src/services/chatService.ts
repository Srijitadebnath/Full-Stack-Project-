import { Conversation, Message } from '../types';

import { API_BASE } from '../config/api';

class ChatService {
  // 1. Fetch all conversations from PostgreSQL
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching conversations from database:', error);
      return [];
    }
  }

  // 2. Fetch all messages for a specific conversation from PostgreSQL
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching messages from database:', error);
      return [];
    }
  }

  // 3. Send a message and persist directly in PostgreSQL
  async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        content: message.content,
        type: message.type || 'text',
        fileUrl: message.fileUrl,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to send message');
    }

    return result.data;
  }
}

export const chatService = new ChatService();