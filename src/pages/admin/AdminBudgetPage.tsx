import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, Receipt, CreditCard } from 'lucide-react';
import { EventBudget, Expense, BudgetCategory } from '../../types';
import { budgetService } from '../../services/budgetService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, ProgressBar, Modal, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

export const AdminBudgetPage: React.FC = () => {
  const [budget, setBudget] = useState<EventBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    budgetId: 'bgt-101',
    eventId: 'evt-101',
    category: 'Sound' as BudgetCategory,
    title: '',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    spentBy: 'Dr. Rajesh Sharma',
    status: 'paid' as const,
    notes: '',
  });

  const loadBudget = async () => {
    const bgt = await budgetService.getBudgetByEvent('evt-101');
    const exp = await budgetService.getExpensesByEvent('evt-101');
    if (bgt) setBudget(bgt);
    setExpenses(exp);
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await budgetService.addExpense(formData);
    setIsModalOpen(false);
    loadBudget();
  };

  const totalBudget = budget?.totalBudget || 200000;
  const spent = budget?.spent || 144000;
  const remaining = totalBudget - spent;
  const progressPct = formatPercentage(spent, totalBudget);

  return (
    <PageContainer
      title="Budget & Expense Operations"
      subtitle="Track financial allocations, categories, logged vendor expenses, and remaining funds."
      action={
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Log New Expense
        </Button>
      }
    >
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-400">Total Approved Budget</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalBudget)}</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Allocated to Categories</span>
          <h3 className="text-xl font-bold text-purple-700 mt-1">{formatCurrency(budget?.allocated || 180000)}</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Total Spent</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(spent)}</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Remaining Unspent</span>
          <h3 className="text-xl font-bold text-sky-600 mt-1">{formatCurrency(remaining)}</h3>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span>Overall Budget Utilization</span>
          <span className="text-purple-700">{progressPct}% Spent</span>
        </div>
        <ProgressBar progress={progressPct} color="purple" />
      </Card>

      {/* Category Breakdown & Logged Expenses Table */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Budget Categories</h3>
          <div className="space-y-3 text-xs">
            {budget?.categories.map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>{c.category}</span>
                  <span className="text-slate-500">{formatCurrency(c.spentAmount)} / {formatCurrency(c.allocatedAmount)}</span>
                </div>
                <ProgressBar progress={formatPercentage(c.spentAmount, c.allocatedAmount)} color="purple" size="sm" />
              </div>
            ))}
          </div>
        </Card>

        <div className="md:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Logged Expense Receipts</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title & Notes</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Logged By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-semibold text-slate-900">
                    {exp.title}
                    {exp.notes && <span className="block text-[11px] font-normal text-slate-400">{exp.notes}</span>}
                  </TableCell>
                  <TableCell><Badge variant="purple">{exp.category}</Badge></TableCell>
                  <TableCell className="font-bold text-emerald-600">{formatCurrency(exp.amount)}</TableCell>
                  <TableCell>{exp.spentBy}</TableCell>
                  <TableCell>{formatDate(exp.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Expense Receipt">
        <form onSubmit={handleAddExpense} className="space-y-3">
          <Input label="Expense Title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Stage backdrop printing payment" />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
              options={[
                { value: 'Venue', label: 'Venue' },
                { value: 'Decoration', label: 'Decoration' },
                { value: 'Food', label: 'Food' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Transportation', label: 'Transportation' },
                { value: 'Equipment', label: 'Equipment' },
                { value: 'Photography', label: 'Photography' },
                { value: 'Printing', label: 'Printing' },
                { value: 'Miscellaneous', label: 'Miscellaneous' },
              ]}
            />
            <Input label="Amount (₹)" type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} />
          </div>
          <Input label="Spent By" required value={formData.spentBy} onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })} />

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Log Expense</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
