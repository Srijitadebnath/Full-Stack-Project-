import { Conversation, Message } from '../types';
import { mockConversations, mockMessages } from '../data/mockMessages';

class ChatService {
  private conversations: Conversation[] = [...mockConversations];
  private messagesMap: Record<string, Message[]> = { ...mockMessages };

  async getConversations(): Promise<Conversation[]> {
    return Promise.resolve([...this.conversations]);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Promise.resolve(this.messagesMap[conversationId] || []);
  }

  async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: 'Just now',
    };

    if (!this.messagesMap[conversationId]) {
      this.messagesMap[conversationId] = [];
    }
    this.messagesMap[conversationId].push(newMessage);

    // Update conversation last message
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = message.content;
      conv.lastMessageTimestamp = 'Just now';
    }

    return Promise.resolve(newMessage);
  }
}

export const chatService = new ChatService();
