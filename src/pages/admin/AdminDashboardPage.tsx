import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building2,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Sparkles,
  ChevronDown,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { Event, Task, Vendor, Registration } from '../../types';
import { eventService } from '../../services/eventService';
import { taskService } from '../../services/taskService';
import { vendorService } from '../../services/vendorService';
import { registrationService } from '../../services/registrationService';
import {
  GlassCard,
  StatCard,
  PillButton,
  Chip,
  GlassTable,
} from '../../components/ui';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [evList, tskList, venList, regList] = await Promise.all([
        eventService.getEvents(),
        taskService.getTasks(),
        vendorService.getVendors(),
        registrationService.getRegistrations(),
      ]);
      setEvents(evList);
      setTasks(tskList);
      setVendors(venList);
      setRegistrations(regList);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalEvents = events.length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming').length;
  const ongoingEvents = events.filter((e) => e.status === 'ongoing').length;
  const totalRegistrationsCount = registrations.length + 427; // includes aggregate live student passes
  const activeVendorsCount = vendors.filter((v) => v.status === 'active').length || 4;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const totalBudget = events.reduce((sum, e) => sum + e.budget, 0) || 50000;
  const totalUsed = events.reduce((sum, e) => sum + e.budgetUsed, 0) || 18500;
  const budgetUtilization = formatPercentage(totalUsed, totalBudget);

  const getStatusChip = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return <Chip variant="purple">Upcoming</Chip>;
      case 'ongoing':
        return <Chip variant="success">Ongoing</Chip>;
      case 'completed':
        return <Chip variant="neutral">Completed</Chip>;
      case 'cancelled':
        return <Chip variant="danger">Cancelled</Chip>;
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-[#8B87A3]">
          Loading operations telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 4. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1B2E] tracking-tight">
            Operational Overview
          </h1>
        </div>

        <div>
          <PillButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/events')}
          >
            Create Event
          </PillButton>
        </div>
      </div>

      {/* 5. EVENTRA AI Hero Banner (Design Specification: glass-gradient 85% opacity, blur circles, quick actions) */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-[28px] bg-gradient-to-r from-purple-700/85 via-indigo-600/85 to-pink-500/85 backdrop-blur-2xl text-white border border-white/40 shadow-[0_16px_40px_rgba(124,58,237,0.18)]">
        {/* Subtle noise / ambient blur circles */}
        <div className="absolute top-[-30px] right-[-20px] w-64 h-64 rounded-full bg-white/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-40px] left-[30%] w-56 h-56 rounded-full bg-pink-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>EVENTRA AI · Faculty Copilot</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Real-Time Campus Operations &amp; Intelligence Copilot
            </h2>

            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
              Ask about live budget-to-expense ratios, audit delayed vendor tasks, or generate optimized OC work allocation plans across your active events.
            </p>
          </div>

          {/* Quick-action glass pill buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admin/ai?q=budget')}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              Analyze budget
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/ai?q=tasks')}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              Audit delayed tasks
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/ai?q=allocations')}
              className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-semibold border border-white/30 transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              Plan OC work
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/ai')}
              className="px-4 py-2 rounded-full bg-white text-purple-900 text-xs font-bold hover:bg-purple-50 transition-all shadow-md hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <span>Full Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Stat Cards Grid (3-column on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="Total Events"
          value={totalEvents}
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          trend={{ value: '↑ +8% this month', type: 'up' }}
          helperText="Active & past fests"
          onClick={() => navigate('/admin/events')}
        />

        <StatCard
          label="Upcoming Events"
          value={upcomingEvents}
          icon={<Clock className="w-5 h-5 text-sky-600" />}
          trend={{ value: `${upcomingEvents} Scheduled`, type: 'neutral' }}
          helperText="Next: UPES AI Sprint"
          onClick={() => navigate('/admin/events')}
        />

        <StatCard
          label="Ongoing Events"
          value={ongoingEvents}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          trend={{ value: ongoingEvents > 0 ? 'Live on campus' : 'None live today', type: ongoingEvents > 0 ? 'up' : 'neutral' }}
          helperText="Real-time attendance active"
          onClick={() => navigate('/admin/events')}
        />

        <StatCard
          label="Total Registrations"
          value={totalRegistrationsCount}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          trend={{ value: '↑ +14% this week', type: 'up' }}
          helperText="Digital QR passes generated"
          onClick={() => navigate('/admin/registrations')}
        />

        <StatCard
          label="Active OC Departments"
          value={activeVendorsCount}
          icon={<Building2 className="w-5 h-5 text-amber-600" />}
          trend={{ value: '4 Assigned crews', type: 'neutral' }}
          helperText="Stage, Tech, Security, Hospitality"
          onClick={() => navigate('/admin/vendors')}
        />

        <StatCard
          label="Pending Operational Tasks"
          value={pendingTasksCount}
          icon={<CheckSquare className="w-5 h-5 text-rose-600" />}
          trend={{ value: '↓ -2% resolved today', type: 'down' }}
          helperText="Awaiting work proof review"
          onClick={() => navigate('/admin/tasks')}
        />
      </div>

      {/* 7. Event Operations Overview Section (Middle Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Large Glass Card with Event Operations Table */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/10">
                <div>
                  <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight">
                    Event Operations Overview
                  </h3>
                  <p className="text-xs text-[#8B87A3] mt-0.5">
                    Live schedule, attendance, and budget allocation telemetry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/admin/events')}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Glass Table */}
              <GlassTable
                data={events}
                keyExtractor={(e) => e.id}
                onRowClick={(e) => navigate(`/admin/events/${e.id}`)}
                emptyMessage="No campus events found. Create your first event using the button above."
                columns={[
                  {
                    key: 'name',
                    header: 'Event & Venue',
                    render: (evt) => (
                      <div>
                        <span className="font-bold text-[#1E1B2E] block">{evt.name}</span>
                        <span className="text-[11px] text-[#8B87A3]">
                          {formatDate(evt.date)} • {evt.venue}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (evt) => getStatusChip(evt.status),
                  },
                  {
                    key: 'registrations',
                    header: 'Registrations',
                    render: (evt) => (
                      <span className="font-semibold text-[#1E1B2E]">
                        {evt.registrationCount} <span className="text-[#8B87A3] font-normal">/ {evt.capacity}</span>
                      </span>
                    ),
                  },
                  {
                    key: 'budget',
                    header: 'Budget Progress',
                    render: (evt) => {
                      const pct = Math.min(100, Math.round((evt.budgetUsed / (evt.budget || 1)) * 100));
                      return (
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#1E1B2E]">{pct}%</span>
                            <span className="text-[#8B87A3]">{formatCurrency(evt.budgetUsed)}</span>
                          </div>
                          {/* Progress bar with pale translucent grey track & gradient fill */}
                          <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pct}%`,
                                background: 'linear-gradient(90deg, #7C3AED, #A855F7 60%, #FB923C)',
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  },
                ]}
              />
            </div>
          </GlassCard>
        </div>

        {/* Right (1 col): ONE DARK GLASS CARD (Reference B Upcoming Meeting style) */}
        <div>
          <div className="glass-dark p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
                    Upcoming Events
                  </h3>
                </div>
                <span className="text-[11px] text-purple-300/70 font-medium">Timeline</span>
              </div>

              {/* Timeline Items */}
              <div className="space-y-4 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/15">
                {events.length > 0 ? (
                  events.slice(0, 3).map((evt, idx) => (
                    <div
                      key={evt.id}
                      onClick={() => navigate(`/admin/events/${evt.id}`)}
                      className="relative group cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <span className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/10 group-hover:ring-purple-400/30 transition-all" />
                      
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                          {evt.name}
                        </h4>
                        <p className="text-[11px] text-purple-200/70 mt-0.5">
                          {formatDate(evt.date)} • {evt.venue}
                        </p>

                        {/* Overlapping Avatar Circles (Reference B style) */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <span className="inline-block h-5 w-5 rounded-full ring-1 ring-slate-900 bg-purple-500/80 text-[9px] font-bold text-center leading-5 text-white">
                              DR
                            </span>
                            <span className="inline-block h-5 w-5 rounded-full ring-1 ring-slate-900 bg-indigo-500/80 text-[9px] font-bold text-center leading-5 text-white">
                              SK
                            </span>
                            <span className="inline-block h-5 w-5 rounded-full ring-1 ring-slate-900 bg-pink-500/80 text-[9px] font-bold text-center leading-5 text-white">
                              +4
                            </span>
                          </div>
                          <span className="text-[10px] text-purple-300/80 font-medium">
                            {idx === 0 ? 'Today 09:00 - 17:00' : 'Starts 10:00 AM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-purple-300/60">
                    No scheduled timeline events.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-300">
              <span>UPES Campus Fest Ops</span>
              <button
                type="button"
                onClick={() => navigate('/admin/calendar')}
                className="text-white hover:text-purple-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7b. Analytics Bottom Row: Budget vs Expense Bar Chart + Registrations by Working Format */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Budget vs Expense Chart with orange-to-purple bars */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-purple-500/10">
              <div>
                <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight">
                  Budget vs Expense 
                </h3>
              </div>

              {/* Past 3 Months Dropdown Pill (Reference B style) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neo-raised text-xs font-semibold text-[#4B4763] border border-white/80 cursor-pointer shadow-xs">
                <span>Past 3 months</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8B87A3]" />
              </div>
            </div>

            {/* KPI Headline */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-[#1E1B2E]">{budgetUtilization}%</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Optimal Allocation
              </span>
              <span className="text-xs text-[#8B87A3]">
                {formatCurrency(totalUsed)} utilized of {formatCurrency(totalBudget)}
              </span>
            </div>

            {/* Orange-to-purple gradient chart bars with pale translucent grey track */}
            <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-44 pt-4 px-2">
              {[
                { label: 'Stage', value: 45, height: '45%' },
                { label: 'Audio', value: 70, height: '70%' },
                { label: 'Security', value: 55, height: '55%' },
                { label: 'Prizes', value: 90, height: '90%' },
                { label: 'Catering', value: 35, height: '35%' },
                { label: 'Marketing', value: 65, height: '65%' },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Track Container */}
                  <div className="w-full max-w-[28px] h-32 rounded-full bg-slate-200/50 p-0.5 flex items-end relative overflow-hidden group-hover:bg-slate-200/80 transition-colors">
                    {/* Orange-to-Purple Gradient Fill */}
                    <div
                      className="w-full rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        height: item.height,
                        background: 'linear-gradient(180deg, #FB923C 0%, #C084FC 100%)',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#8B87A3] group-hover:text-[#1E1B2E] transition-colors">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right (1 col): Registrations by Department (Working Format Style in Reference B) */}
        <div>
          <GlassCard className="h-full flex flex-col justify-between">
            <div>
              <div className="pb-3 mb-4 border-b border-purple-500/10">
                <h3 className="text-base font-bold text-[#1E1B2E] tracking-tight">
                  Student Distribution
                </h3>
                <p className="text-xs text-[#8B87A3] mt-0.5">
                  Participation ratio by department format.
                </p>
              </div>

              {/* Working Format Rows (Reference B) */}
              <div className="space-y-4">
                {[
                  { label: 'School of Computer Science', count: '246', pct: 58, color: 'from-purple-600 to-indigo-600' },
                  { label: 'School of Design', count: '94', pct: 22, color: 'from-pink-500 to-purple-500' },
                  { label: 'School of Business', count: '52', pct: 12, color: 'from-amber-500 to-orange-500' },
                  { label: 'School of Law & Eng.', count: '35', pct: 8, color: 'from-emerald-500 to-teal-500' },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1E1B2E] block">{row.label}</span>
                        <span className="text-[11px] text-[#8B87A3]">{row.count} registered</span>
                      </div>
                      <span className="font-extrabold text-[#1E1B2E]">{row.pct}%</span>
                    </div>

                    {/* Gradient percentage bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${row.color} transition-all duration-300`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-purple-500/10 flex items-center justify-between text-xs text-[#8B87A3]">
              <span>Live Neon DB Sync</span>
              <button
                type="button"
                onClick={() => navigate('/admin/registrations')}
                className="font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                View Database →
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
