import { EventBudget, Expense } from '../types';

export const mockBudgets: EventBudget[] = [
  {
    id: 'bgt-101',
    eventId: 'evt-101',
    eventName: 'TechFest UPES 2026',
    totalBudget: 200000,
    allocated: 180000,
    spent: 144000,
    categories: [
      { category: 'Sound', allocatedAmount: 50000, spentAmount: 45000 },
      { category: 'Decoration', allocatedAmount: 30000, spentAmount: 25000 },
      { category: 'Food', allocatedAmount: 40000, spentAmount: 34000 },
      { category: 'Marketing', allocatedAmount: 20000, spentAmount: 18000 },
      { category: 'Equipment', allocatedAmount: 25000, spentAmount: 12000 },
      { category: 'Miscellaneous', allocatedAmount: 15000, spentAmount: 10000 },
    ],
  },
];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-601',
    budgetId: 'bgt-101',
    eventId: 'evt-101',
    category: 'Sound',
    title: 'Advance payment to Apex Sound & Stage Lights',
    amount: 45000,
    date: '2026-09-15',
    spentBy: 'Dr. Rajesh Sharma',
    status: 'paid',
    notes: '50% advance per signed agreement',
  },
  {
    id: 'exp-602',
    budgetId: 'bgt-101',
    eventId: 'evt-101',
    category: 'Printing',
    title: 'Flex banners and participant ID badges',
    amount: 18000,
    date: '2026-09-17',
    spentBy: 'Vikramaditya Singh',
    status: 'paid',
    notes: 'Receipt uploaded',
  },
  {
    id: 'exp-603',
    budgetId: 'bgt-101',
    eventId: 'evt-101',
    category: 'Food',
    title: 'Catering deposit for lunch packets',
    amount: 34000,
    date: '2026-09-20',
    spentBy: 'Priya Patel',
    status: 'approved',
    notes: 'Royal Crown Catering booking deposit',
  },
];
