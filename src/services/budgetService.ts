import { EventBudget, Expense } from '../types';

const API_BASE = 'http://localhost:5000/api';

class BudgetService {
  // Fetch real event budget from PostgreSQL database
  async getBudgetByEvent(eventId: string): Promise<EventBudget | undefined> {
    try {
      const res = await fetch(`${API_BASE}/budget/${eventId}`);
      const result = await res.json();
      if (result.success && result.data?.budget) {
        return result.data.budget;
      }
      return undefined;
    } catch (err) {
      console.error('Failed to fetch event budget from database:', err);
      return undefined;
    }
  }

  // Fetch real event expenses from PostgreSQL database
  async getExpensesByEvent(eventId: string): Promise<Expense[]> {
    try {
      const res = await fetch(`${API_BASE}/budget/${eventId}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data?.expenses)) {
        return result.data.expenses;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch event expenses from database:', err);
      return [];
    }
  }

  // Admin logs new expense directly in PostgreSQL
  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: expense.eventId,
        budget_id: expense.budgetId,
        category: expense.category,
        title: expense.title,
        amount: expense.amount,
        spent_by: expense.spentBy,
        notes: expense.notes,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to log expense in database');
    }

    return {
      ...expense,
      id: result.data?.id || `exp-${Date.now()}`,
    };
  }
}

export const budgetService = new BudgetService();
