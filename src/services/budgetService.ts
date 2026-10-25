import { EventBudget, Expense } from '../types';
import { mockBudgets, mockExpenses } from '../data/mockBudget';

class BudgetService {
  private budgets: EventBudget[] = [...mockBudgets];
  private expenses: Expense[] = [...mockExpenses];

  async getBudgetByEvent(eventId: string): Promise<EventBudget | undefined> {
    const budget = this.budgets.find((b) => b.eventId === eventId);
    return Promise.resolve(budget ? { ...budget } : undefined);
  }

  async getExpensesByEvent(eventId: string): Promise<Expense[]> {
    return Promise.resolve(this.expenses.filter((e) => e.eventId === eventId));
  }

  async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    this.expenses.unshift(newExpense);

    // Update budget spent amount
    const budget = this.budgets.find((b) => b.eventId === expense.eventId);
    if (budget) {
      budget.spent += expense.amount;
    }
    return Promise.resolve(newExpense);
  }
}

export const budgetService = new BudgetService();
