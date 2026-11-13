import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, Receipt, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { EventBudget, Expense, BudgetCategory, Event } from '../../types';
import { budgetService } from '../../services/budgetService';
import { eventService } from '../../services/eventService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  StatCard,
  PillButton,
  Chip,
  GlassTable,
  Card,
  Badge,
  Button,
  Input,
  Select,
  ProgressBar,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

export const AdminBudgetPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [budget, setBudget] = useState<EventBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    budgetId: '',
    eventId: '',
    category: 'Sound' as BudgetCategory,
    title: '',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    spentBy: 'Dr. Rajesh Sharma',
    status: 'paid' as const,
    notes: '',
  });

  // Load all events from database on mount
  useEffect(() => {
    const initEvents = async () => {
      setIsLoading(true);
      const evList = await eventService.getEvents();
      setEvents(evList);
      if (evList.length > 0) {
        const firstId = evList[0].id;
        setSelectedEventId(firstId);
        await loadEventBudget(firstId);
      }
      setIsLoading(false);
    };

    initEvents();
  }, []);

  // Load budget and expenses specifically for the selected event
  const loadEventBudget = async (eventId: string) => {
    setSelectedEventId(eventId);
    const bgt = await budgetService.getBudgetByEvent(eventId);
    const exp = await budgetService.getExpensesByEvent(eventId);
    
    setBudget(bgt || null);
    setExpenses(exp || []);

    setFormData(prev => ({
      ...prev,
      eventId: eventId,
      budgetId: bgt?.id || '',
    }));
  };

  const handleEventChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setIsLoading(true);
    await loadEventBudget(newId);
    setIsLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await budgetService.addExpense({
      ...formData,
      eventId: selectedEventId,
      budgetId: budget?.id || '',
    });
    setIsModalOpen(false);
    // Reset title and notes
    setFormData(prev => ({ ...prev, title: '', notes: '' }));
    await loadEventBudget(selectedEventId);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const totalBudget = budget?.totalBudget ?? (selectedEvent?.budget || 0);
  const spent = budget?.spent ?? 0;
  const remaining = Math.max(0, totalBudget - spent);
  const progressPct = totalBudget > 0 ? formatPercentage(spent, totalBudget) : 0;

  return (
    <PageContainer
      title="Event Budget & Expense Operations"
      subtitle="Track financial allocations, categories, logged vendor expenses, and remaining funds per event."
      action={
        <PillButton
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
          disabled={!selectedEventId}
        >
          Log New Expense
        </PillButton>
      }
    >
      {/* 🎯 Event Selector Bar (Glass Card) */}
      <GlassCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neo-raised flex items-center justify-center text-purple-600 shrink-0 border border-white/60">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest block">Selected Campus Event</span>
            <h4 className="text-sm sm:text-base font-bold text-[#1E1B2E]">
              {selectedEvent ? selectedEvent.name : 'Select an Event to View Budget'}
            </h4>
          </div>
        </div>

        <div className="w-full sm:w-80">
          <Select
            value={selectedEventId}
            onChange={handleEventChange}
            options={events.map(ev => ({
              value: ev.id,
              label: `${ev.name} (${formatCurrency(ev.budget || 0)})`
            }))}
          />
        </div>
      </GlassCard>

      {events.length === 0 && !isLoading && (
        <GlassCard className="p-8 text-center text-[#8B87A3] space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h4 className="text-base font-bold text-[#1E1B2E]">No Events Found</h4>
          <p className="text-xs text-[#8B87A3]">Create your first campus event in the Event Operations Hub to begin tracking its budget.</p>
        </GlassCard>
      )}

      {selectedEventId && (
        <>
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Approved Budget"
              value={formatCurrency(totalBudget)}
              icon={<DollarSign className="w-5 h-5 text-purple-600" />}
              helperText={selectedEvent?.name}
            />
            <StatCard
              label="Allocated to Categories"
              value={formatCurrency(budget?.allocated || totalBudget)}
              icon={<CreditCard className="w-5 h-5 text-indigo-600" />}
              helperText="Department Allocation"
            />
            <StatCard
              label="Total Spent"
              value={formatCurrency(spent)}
              icon={<Receipt className="w-5 h-5 text-emerald-600" />}
              trend={{ value: `${expenses.length} receipts`, type: 'up' }}
              helperText="Verified disbursements"
            />
            <StatCard
              label="Remaining Unspent"
              value={formatCurrency(remaining)}
              icon={<DollarSign className="w-5 h-5 text-sky-600" />}
              helperText="Available Balance"
            />
          </div>

          {/* Progress Card */}
          <GlassCard className="p-5 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-[#1E1B2E]">Budget Utilization for {selectedEvent?.name}</span>
              <span className="text-purple-700">{progressPct}% Spent</span>
            </div>
            {/* Pale Track with Gradient Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background:
                    Number(progressPct) > 90
                      ? 'linear-gradient(90deg, #DC2626, #F87171)'
                      : 'linear-gradient(90deg, #FB923C, #C084FC)',
                }}
              />
            </div>
          </GlassCard>

          {/* Category Breakdown & Logged Expenses Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Budget by Category</h3>
              {(!budget?.categories || budget.categories.length === 0) ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                  No categorized expenses logged yet for this event.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {budget.categories.map((c) => (
                    <div key={c.category} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span>{c.category}</span>
                        <span className="text-slate-500">{formatCurrency(c.spentAmount)} / {formatCurrency(c.allocatedAmount)}</span>
                      </div>
                      <ProgressBar progress={formatPercentage(c.spentAmount, c.allocatedAmount)} color="purple" size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Logged Expense Receipts ({expenses.length})
                </h3>
                <span className="text-xs text-slate-400">Event: {selectedEvent?.name}</span>
              </div>

              {expenses.length === 0 ? (
                <div className="p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
                  <h4 className="text-xs font-semibold text-slate-600">No Receipts Logged Yet</h4>
                  <p className="text-[11px] text-slate-400">Click &quot;Log New Expense&quot; above to record venue, sound, food, or marketing expenses for {selectedEvent?.name}.</p>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </>
      )}

      {/* Expense Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Log Expense Receipt — ${selectedEvent?.name || 'Event'}`}
        subtitle="This expense will be debited from this specific event's allocated budget in PostgreSQL."
      >
        <form onSubmit={handleAddExpense} className="space-y-3">
          <Input 
            label="Expense Title" 
            required 
            value={formData.title} 
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            placeholder="e.g. Stage backdrop printing payment" 
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as BudgetCategory })}
              options={[
                { value: 'Sound', label: 'Sound & Audio' },
                { value: 'Venue', label: 'Venue & Staging' },
                { value: 'Decoration', label: 'Decoration & Lighting' },
                { value: 'Food', label: 'Food & Catering' },
                { value: 'Marketing', label: 'Marketing & Banners' },
                { value: 'Transportation', label: 'Transportation' },
                { value: 'Equipment', label: 'Equipment Rental' },
                { value: 'Photography', label: 'Photography / Video' },
                { value: 'Printing', label: 'Printing (Badges, Passes)' },
                { value: 'Miscellaneous', label: 'Miscellaneous' },
              ]}
            />
            <Input 
              label="Amount (₹)" 
              type="number" 
              required 
              value={formData.amount} 
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} 
            />
          </div>
          <Input 
            label="Spent By (Faculty / OC Lead)" 
            required 
            value={formData.spentBy} 
            onChange={(e) => setFormData({ ...formData, spentBy: e.target.value })} 
          />
          <Input 
            label="Additional Notes / Receipt Ref" 
            value={formData.notes || ''} 
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
            placeholder="e.g. Paid via NEFT invoice #8821" 
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Expense Receipt</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
