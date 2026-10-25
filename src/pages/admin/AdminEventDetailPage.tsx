import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  UserCheck,
  Building2,
  CheckSquare,
  DollarSign,
  FileCheck,
  MessageSquare,
  CalendarDays,
  LayoutDashboard,
} from 'lucide-react';
import { Event, Registration, TeamMember, Vendor, Task, EventBudget, Expense, Submission } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { teamService } from '../../services/teamService';
import { vendorService } from '../../services/vendorService';
import { taskService } from '../../services/taskService';
import { budgetService } from '../../services/budgetService';
import { submissionService } from '../../services/submissionService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Tabs, Button, ProgressBar, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState } from '../../components/ui';
import { formatCurrency, formatDate, formatPercentage } from '../../utils/formatters';

export const AdminEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Related data
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<EventBudget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    if (!eventId) return;
    const fetchEventDetails = async () => {
      const evt = await eventService.getEventById(eventId);
      if (evt) {
        setEvent(evt);
        const [regList, teamList, venList, tskList, bgt, expList, subList] = await Promise.all([
          registrationService.getRegistrationsByEvent(eventId),
          teamService.getTeamMembersByEvent(eventId),
          vendorService.getVendorsByEvent(eventId),
          taskService.getTasksByEvent(eventId),
          budgetService.getBudgetByEvent(eventId),
          budgetService.getExpensesByEvent(eventId),
          submissionService.getSubmissions(),
        ]);
        setRegistrations(regList);
        setTeamMembers(teamList);
        setVendors(venList);
        setTasks(tskList);
        setBudget(bgt || null);
        setExpenses(expList);
        setSubmissions(subList.filter((s) => s.eventId === eventId));
      }
    };
    fetchEventDetails();
  }, [eventId]);

  if (!event) {
    return (
      <PageContainer>
        <div className="py-12 text-center text-xs text-slate-400">Loading event operations hub...</div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'registrations', label: 'Registrations', icon: <Users className="w-3.5 h-3.5" />, badge: registrations.length },
    { id: 'team', label: 'Team', icon: <UserCheck className="w-3.5 h-3.5" />, badge: teamMembers.length },
    { id: 'vendors', label: 'Vendors', icon: <Building2 className="w-3.5 h-3.5" />, badge: vendors.length },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3.5 h-3.5" />, badge: tasks.length },
    { id: 'budget', label: 'Budget', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { id: 'submissions', label: 'Submissions', icon: <FileCheck className="w-3.5 h-3.5" />, badge: submissions.length },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  ];

  return (
    <PageContainer
      title={event.name}
      subtitle={`${formatDate(event.date)} • ${event.venue}`}
      action={
        <Button variant="outline" onClick={() => navigate('/admin/events')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Events
        </Button>
      }
    >
      {/* Event Header Banner Card */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-sm border-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-medium backdrop-blur-xs">
                {event.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/40 text-purple-100 text-[11px] font-medium capitalize">
                Status: {event.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{event.name}</h2>
            <p className="text-xs sm:text-sm text-purple-100/80 max-w-2xl">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs text-xs">
            <div>
              <span className="text-purple-200 block text-[10px]">Registrations</span>
              <span className="font-bold text-white text-sm">{event.registrationCount} / {event.capacity}</span>
            </div>
            <div>
              <span className="text-purple-200 block text-[10px]">Budget Allocated</span>
              <span className="font-bold text-white text-sm">{formatCurrency(event.budget)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 9 Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content Views */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="md:col-span-2 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Event Overview Details</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Date & Time</span>
                  <span className="font-semibold text-slate-800">{formatDate(event.date)} ({event.startTime} - {event.endTime})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Venue</span>
                  <span className="font-semibold text-slate-800">{event.venue}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Registration Deadline</span>
                  <span className="font-semibold text-slate-800">{formatDate(event.registrationDeadline)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Organizing Unit</span>
                  <span className="font-semibold text-slate-800">{event.organizer}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-slate-400 text-xs block mb-1">Overall Operations Progress</span>
                <ProgressBar progress={72} color="purple" showLabel />
              </div>
            </Card>

            <Card className="space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Quick Stats</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">OC Members</span>
                  <span className="font-semibold text-slate-900">{teamMembers.length}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">Assigned Vendors</span>
                  <span className="font-semibold text-slate-900">{vendors.length}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                  <span className="text-slate-500">Total Work Tasks</span>
                  <span className="font-semibold text-slate-900">{tasks.length}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'registrations' && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Course & Year</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableEmptyState title="No registrations yet" description="Student registrations will appear here." />
              ) : (
                registrations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold text-slate-900">{r.userName}</TableCell>
                    <TableCell>{r.course} ({r.year})</TableCell>
                    <TableCell>{r.college}</TableCell>
                    <TableCell>{r.studentId}</TableCell>
                    <TableCell>{formatDate(r.registrationDate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((t) => (
              <Card key={t.id} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                  {t.name.slice(0, 2)}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900 text-sm">{t.name}</h4>
                    <Badge variant="purple">{t.role}</Badge>
                  </div>
                  <p className="text-slate-500">{t.department} • {t.year}</p>
                  <p className="text-purple-700 font-medium">Responsibility: {t.responsibility}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <Card key={v.id} className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900">{v.name}</h4>
                    <span className="text-xs text-slate-400">{v.contactPerson} ({v.phone})</span>
                  </div>
                  <Badge variant="cyan">{v.category}</Badge>
                </div>
                <p className="text-xs text-slate-600">Assigned Work: {v.assignedWork}</p>
                <ProgressBar progress={v.progress} color="purple" showLabel />
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {tasks.map((tsk) => (
              <Card key={tsk.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{tsk.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{tsk.description}</p>
                  <span className="text-[11px] text-purple-600 font-medium block mt-1">Assigned to: {tsk.assignedToName}</span>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Badge variant={tsk.status === 'Completed' ? 'emerald' : 'amber'}>{tsk.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'budget' && (
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Event Budget Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block">Total Budget</span>
                <span className="text-base font-bold text-slate-900">{formatCurrency(event.budget)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Spent</span>
                <span className="text-base font-bold text-emerald-600">{formatCurrency(event.budgetUsed)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Remaining</span>
                <span className="text-base font-bold text-purple-600">{formatCurrency(event.budget - event.budgetUsed)}</span>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <Card key={sub.id} className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-slate-900">{sub.taskName}</h4>
                  <Badge variant="blue">{sub.type} update</Badge>
                </div>
                <p className="text-xs text-slate-600">{sub.description}</p>
                <span className="text-[11px] text-slate-400">Submitted by {sub.submittedByName} • {sub.submissionTime}</span>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <Card className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">Event Operations Messenger</h4>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/admin/chat')}>
              Open Central Chat Console
            </Button>
          </Card>
        )}

        {activeTab === 'calendar' && (
          <Card className="text-center py-8">
            <CalendarDays className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800">Event Timeline & Deadlines</h4>
            <p className="text-xs text-slate-400 mt-1">Scheduled Date: {formatDate(event.date)} ({event.startTime} - {event.endTime})</p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
