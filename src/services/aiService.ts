export interface AIProposalAction {
  id: string;
  type: 'team_allocation' | 'budget_plan' | 'vendor_issue';
  title: string;
  summary: string;
  data: Record<string, unknown>;
  status: 'pending' | 'applied' | 'rejected';
}

export interface AIMessageResponse {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionProposal?: AIProposalAction;
}

class AIService {
  private sampleProposals: Record<string, AIProposalAction> = {
    team: {
      id: 'prop-ai-1',
      type: 'team_allocation',
      title: 'AI Proposed OC Allocation for TechFest 2026',
      summary: 'Assign 4 registered OC members to Registration Desk and 2 to Stage Operations based on skill matching.',
      data: {
        allocations: [
          { name: 'Priya Patel', role: 'Stage Lead', reason: 'Previous stage experience' },
          { name: 'Arjun Reddy', role: 'Registration Desk Head', reason: 'High network proficiency' },
          { name: 'Tanvi Kapoor', role: 'Sponsorship Coordinator', reason: 'School of Business background' },
        ],
      },
      status: 'pending',
    },
    budget: {
      id: 'prop-ai-2',
      type: 'budget_plan',
      title: 'AI Generated Budget Plan for ₹1,70,000 Target',
      summary: 'Optimized budget allocation across categories based on historical campus event spending.',
      data: {
        categories: [
          { category: 'Decoration', amount: 40000 },
          { category: 'Food', amount: 60000 },
          { category: 'Sound', amount: 25000 },
          { category: 'Marketing', amount: 20000 },
          { category: 'Photography', amount: 15000 },
          { category: 'Miscellaneous', amount: 10000 },
        ],
        total: 170000,
      },
      status: 'pending',
    },
  };

  async askAI(prompt: string): Promise<AIMessageResponse> {
    const lower = prompt.toLowerCase();
    let replyText = "I've analyzed your event operations dataset. Everything is currently running smoothly.";
    let proposal: AIProposalAction | undefined = undefined;

    if (lower.includes('work allocation') || lower.includes('oc') || lower.includes('team')) {
      replyText = "Based on registered OC member profiles and event workload, I've prepared a recommended team allocation proposal:";
      proposal = { ...this.sampleProposals.team };
    } else if (lower.includes('budget') || lower.includes('cost') || lower.includes('expense')) {
      replyText = "Here is an AI-generated budget allocation optimized for your target event scale:";
      proposal = { ...this.sampleProposals.budget };
    } else if (lower.includes('delayed') || lower.includes('vendor') || lower.includes('attention')) {
      replyText = "I scanned all vendor tasks. 'Catering Counter Setup' requires attention due to pending cafeteria space confirmation.";
    }

    return Promise.resolve({
      id: `ai-msg-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: 'Just now',
      actionProposal: proposal,
    });
  }
}

export const aiService = new AIService();
