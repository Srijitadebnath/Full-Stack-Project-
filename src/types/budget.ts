export type BudgetCategory =
  | 'Venue'
  | 'Decoration'
  | 'Food'
  | 'Marketing'
  | 'Transportation'
  | 'Equipment'
  | 'Sound'
  | 'Lighting'
  | 'Photography'
  | 'Printing'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  budgetId: string;
  eventId: string;
  category: BudgetCategory;
  title: string;
  amount: number;
  date: string;
  spentBy: string;
  status: 'paid' | 'pending' | 'approved';
  receiptUrl?: string;
  notes?: string;
}

export interface EventBudget {
  id: string;
  eventId: string;
  eventName: string;
  totalBudget: number;
  allocated: number;
  spent: number;
  categories: {
    category: BudgetCategory;
    allocatedAmount: number;
    spentAmount: number;
  }[];
}
