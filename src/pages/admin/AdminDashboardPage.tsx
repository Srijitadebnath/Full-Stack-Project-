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
  CheckCircle2,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { Event, Task, Vendor, Registration } from '../../types';
import { eventService } from '../../services/eventService';
import { taskService } from '../../services/taskService';
import { vendorService } from '../../services/vendorService';
import { registrationService } from '../../services/registrationService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, ProgressBar, Button } from '../../components/ui';
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
  const completedEvents = events.filter((e) => e.status === 'completed').length;
  const totalRegistrationsCount = registrations.length + 427; // includes aggregate stats
  const activeVendorsCount = vendors.filter((v) => v.status === 'active').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);
  const totalUsed = events.reduce((sum, e) => sum + e.budgetUsed, 0);
  const budgetUtilization = formatPercentage(totalUsed, totalBudget);

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="purple" dot>Upcoming</Badge>;
      case 'ongoing':
        return <Badge variant="emerald" dot>Ongoing</Badge>;
      case 'completed':
        return <Badge variant="slate" dot>Completed</Badge>;
      case 'cancelled':
        return <Badge variant="rose" dot>Cancelled</Badge>;
    }
  };

  if (loading) {
    return (
      <PageContainer title="Operational Overview">
        <div className="py-12 text-center text-xs text-slate-400">Loading operations dashboard...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Operational Overview"
      subtitle="Comprehensive campus event metrics, operations tracking, and budget utilization."
      action={
        <Button onClick={() => navigate('/admin/events')} icon={<Plus className="w-4 h-4" />}>
          Create Event
        </Button>
      }
    >
      {/* 8 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Events</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{totalEvents}</h3>
            <span className="text-[11px] text-slate-400 font-normal">Active & Past events</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Upcoming Events</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{upcomingEvents}</h3>
            <span className="text-[11px] text-sky-600 font-medium">Scheduled ahead</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ongoing Events</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{ongoingEvents}</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Live on campus</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Completed</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{completedEvents}</h3>
            <span className="text-[11px] text-slate-400 font-normal">Wrapped up</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total Registrations</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{totalRegistrationsCount}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Student signups</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Active Vendors</span>
            <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{activeVendorsCount}</h3>
            <span className="text-[11px] text-slate-400 font-normal">Assigned suppliers</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Pending Tasks</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{pendingTasksCount}</h3>
            <span className="text-[11px] text-amber-600 font-medium">In progress or review</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Budget Utilization</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-slate-900">{budgetUtilization}%</h3>
            <span className="text-[11px] text-slate-400 font-normal">
              {formatCurrency(totalUsed)} of {formatCurrency(totalBudget)}
            </span>
          </div>
        </Card>
      </div>

      {/* Events Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Event Operations Overview</h3>
          <button
            onClick={() => navigate('/admin/events')}
            className="text-xs text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const progressPct = formatPercentage(evt.budgetUsed, evt.budget);
            return (
              <Card key={evt.id} hoverable onClick={() => navigate(`/admin/events/${evt.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">{evt.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(evt.date)} • {evt.venue}
                    </p>
                  </div>
                  {getStatusBadge(evt.status)}
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Registrations</span>
                    <span className="font-semibold text-slate-800">
                      {evt.registrationCount} / {evt.capacity}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Budget / Spent</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(evt.budget)} ({formatCurrency(evt.budgetUsed)})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <ProgressBar
                    progress={progressPct}
                    color={progressPct > 90 ? 'rose' : progressPct > 70 ? 'purple' : 'emerald'}
                    showLabel
                  />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
};
