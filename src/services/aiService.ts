import { API_BASE } from '../config/api';

export interface AIProposalAction {
  id: string;
  type: 'team_allocation' | 'budget_plan' | 'vendor_issue';
  title: string;
  summary: string;
  data: Record<string, unknown>;
  status: 'pending' | 'applied' | 'rejected';
}

export interface EventProposalData {
  action: 'CREATE_EVENT_PROPOSAL';
  eventData: {
    name: string;
    description: string;
    category: string;
    venue: string;
    date: string;
    startTime: string;
    endTime: string;
    registrationDeadline: string;
    capacity: number;
    budget: number;
    organizer: string;
    image?: string;
  };
  suggestedTasks?: {
    name: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    department?: string;
  }[];
}

export interface AIMessageResponse {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: string[];
  mode?: 'RAG_RETRIEVAL' | 'LLM_RAG';
  actionProposal?: AIProposalAction;
  proposal?: EventProposalData;
}

export type AssistantRole = 'USER' | 'TEAM' | 'ADMIN';

class AIService {
  /**
   * Sends a query to the RAG-ready backend AI endpoint, passing the user's JWT token if available.
   */
  async askAI(
    prompt: string,
    options?: {
      role?: AssistantRole;
      eventId?: string;
      history?: { sender: 'user' | 'ai'; text: string }[];
    }
  ): Promise<AIMessageResponse> {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt,
        role: options?.role || 'USER',
        eventId: options?.eventId,
        history: options?.history,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'AI Assistant could not respond right now.');
    }

    return data.data as AIMessageResponse;
  }
}

export const aiService = new AIService();
