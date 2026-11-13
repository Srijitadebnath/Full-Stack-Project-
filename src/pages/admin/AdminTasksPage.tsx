import React, { useEffect, useState } from 'react';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  UserCheck,
  Filter,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Event, TeamMember } from '../../types';
import { taskService } from '../../services/taskService';
import { eventService } from '../../services/eventService';
import { teamService } from '../../services/teamService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  PillButton,
  Chip,
  GlassInput,
  Modal,
} from '../../components/ui';

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedToName: '',
    assignedToId: '',
    assignedType: 'member' as const,
    eventId: '',
    eventName: '',
    deadline: '',
    priority: 'high' as TaskPriority,
    status: 'Assigned' as TaskStatus,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [taskList, eventList, teamList] = await Promise.all([
        taskService.getTasks(),
        eventService.getEvents(),
        teamService.getTeamMembers(),
      ]);

      setTasks(taskList);
      setEvents(eventList);
      setTeamMembers(teamList);

      const defaultEvent = eventList[0];
      const defaultMember = teamList[0];

      setFormData((prev) => ({
        ...prev,
        eventId: prev.eventId || (defaultEvent ? defaultEvent.id : ''),
        eventName: prev.eventName || (defaultEvent ? defaultEvent.name : ''),
        assignedToName: prev.assignedToName || (defaultMember ? defaultMember.name : 'OC Operations Team'),
        assignedToId: prev.assignedToId || (defaultMember ? defaultMember.id : 'team-1'),
        deadline:
          prev.deadline ||
          new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16).replace('T', ' '),
      }));
    } catch (err) {
      console.error('Failed to load tasks data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setErrorMessage(null);
    const targetEventId = selectedEventId !== 'all' ? selectedEventId : events[0]?.id || '';
    const targetEvent = events.find((e) => e.id === targetEventId);
    const defaultMember = teamMembers[0];

    setFormData({
      name: '',
      description: '',
      assignedToName: defaultMember ? defaultMember.name : 'OC Operations Team',
      assignedToId: defaultMember ? defaultMember.id : 'team-1',
      assignedType: 'member',
      eventId: targetEventId,
      eventName: targetEvent ? targetEvent.name : '',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16).replace('T', ' '),
      priority: 'high',
      status: 'Assigned',
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete task "${name}"?`)) {
      const ok = await taskService.deleteTask(id);
      if (!ok) {
        alert('Failed to delete task. Please make sure you are logged in as Admin and try again.');
        return;
      }
      setSuccessToast(`Task "${name}" successfully deleted.`);
      setTimeout(() => setSuccessToast(null), 3500);
      loadData();
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage('Task Title is required.');
      return;
    }
    if (!formData.eventId) {
      setErrorMessage('Please select a target Campus Event.');
      return;
    }
    if (!formData.assignedToName.trim()) {
      setErrorMessage('Please assign this task to an OC Member or department.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetEvent = events.find((ev) => ev.id === formData.eventId);
      await taskService.createTask({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        eventName: targetEvent ? targetEvent.name : formData.eventName,
      });

      setIsModalOpen(false);
      setSuccessToast(`Task "${formData.name.trim()}" published to OC team successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);

      setFormData((prev) => ({
        ...prev,
        name: '',
        description: '',
      }));
      await loadData();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to publish task to OC team. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter tasks based on selected event
  const displayedTasks =
    selectedEventId === 'all' ? tasks : tasks.filter((t) => t.eventId === selectedEventId);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <PageContainer
      title="Work Assignment & Task Tracker"
      subtitle="Assign departmental responsibilities and track progress milestones per event."
      action={
        <PillButton
          variant="primary"
          onClick={openCreateModal}
          icon={<Plus className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Assign New Task
        </PillButton>
      }
    >
      {/* Success Notification Banner / Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Event Selector & Filter Bar (Glass Card - Mobile First) */}
      <GlassCard className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neo-raised flex items-center justify-center text-purple-600 shrink-0 border border-white/60">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest block">
              Scope View
            </span>
            <h4 className="text-sm sm:text-base font-bold text-[#1E1B2E]">
              {selectedEventId === 'all'
                ? 'All Campus Events'
                : selectedEvent?.name || 'Selected Event'}
            </h4>
          </div>
        </div>

        <div className="w-full sm:w-80">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Events ({tasks.length} total tasks)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Task List (Responsive Grid / Cards) */}
      <div className="space-y-4">
        {displayedTasks.length === 0 && !isLoading && (
          <GlassCard className="p-8 sm:p-12 text-center text-[#8B87A3] space-y-2 rounded-3xl">
            <CheckSquare className="w-10 h-10 text-purple-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#1E1B2E]">No Tasks Found for this Scope</h4>
            <p className="text-xs text-[#8B87A3] max-w-sm mx-auto">
              {selectedEventId === 'all'
                ? 'No tasks have been assigned yet across any events.'
                : `No tasks assigned yet for ${selectedEvent?.name}. Click 'Assign New Task' to delegate duties.`}
            </p>
          </GlassCard>
        )}

        {displayedTasks.map((tsk) => (
          <GlassCard key={tsk.id} lift className="space-y-3.5 p-4 sm:p-6 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-[#1E1B2E]">{tsk.name}</h4>
                  {tsk.priority === 'critical' ? (
                    <Chip variant="danger" size="sm">
                      Critical
                    </Chip>
                  ) : tsk.priority === 'high' ? (
                    <Chip variant="warning" size="sm">
                      High Priority
                    </Chip>
                  ) : (
                    <Chip variant="info" size="sm">
                      Standard
                    </Chip>
                  )}
                </div>
                <p className="text-xs text-[#4B4763] leading-relaxed">{tsk.description}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Chip
                  variant={
                    tsk.status === 'Completed'
                      ? 'success'
                      : tsk.status === 'In Progress'
                      ? 'purple'
                      : 'warning'
                  }
                  size="sm"
                >
                  {tsk.status}
                </Chip>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(tsk.id, tsk.name)}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Task"
                  aria-label={`Delete task ${tsk.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inset Metadata Grid (Mobile 1 Col, Tablet/Desktop 3 Col) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 neo-inset rounded-2xl text-xs">
              <div>
                <span className="text-[#8B87A3] block text-[10px] font-medium">Assigned OC Member</span>
                <span className="font-bold text-purple-700">{tsk.assignedToName}</span>
              </div>
              <div>
                <span className="text-[#8B87A3] block text-[10px] font-medium">Event Assignment</span>
                <span className="font-bold text-[#1E1B2E]">{tsk.eventName || 'Campus Fest'}</span>
              </div>
              <div>
                <span className="text-[#8B87A3] block text-[10px] font-medium">Deadline</span>
                <span className="font-bold text-[#1E1B2E]">{tsk.deadline}</span>
              </div>
            </div>

            {/* Gradient Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#8B87A3]">Milestone Progress</span>
                <span className="font-bold text-[#1E1B2E]">{tsk.progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200/60 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${tsk.progress}%`,
                    background:
                      tsk.progress === 100
                        ? 'linear-gradient(90deg, #16A34A, #10B981)'
                        : 'var(--brand-gradient, linear-gradient(135deg, #7C3AED, #A855F7 55%, #F472B6))',
                  }}
                />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal to Assign & Publish New Task (Fully Mobile Responsive) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign & Publish New OC Task"
      >
        <div className="max-h-[75vh] overflow-y-auto px-1 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateTask} className="space-y-4">
            {/* Target Event Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                Target Campus Fest / Event <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.eventId}
                onChange={(e) => {
                  const ev = events.find((item) => item.id === e.target.value);
                  setFormData({
                    ...formData,
                    eventId: e.target.value,
                    eventName: ev ? ev.name : '',
                  });
                }}
                className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <GlassInput
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Inspect Main Stage Lighting and Sound Rigging"
              />
            </div>

            {/* Detailed Instructions */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                Detailed Instructions &amp; Checklists
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full neo-inset rounded-2xl p-3 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-[#8B87A3]"
                placeholder="Specify requirements, safety checks, or deliverables for the crew..."
              />
            </div>

            {/* Assignee Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                Assign to OC Member / Lead <span className="text-rose-500">*</span>
              </label>
              {teamMembers.length > 0 ? (
                <select
                  value={formData.assignedToName}
                  onChange={(e) => {
                    const member = teamMembers.find((m) => m.name === e.target.value);
                    setFormData({
                      ...formData,
                      assignedToName: e.target.value,
                      assignedToId: member ? member.id : 'team-1',
                    });
                  }}
                  className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role} • {m.department || 'Operations'})
                    </option>
                  ))}
                </select>
              ) : (
                <GlassInput
                  required
                  value={formData.assignedToName}
                  onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                  placeholder="e.g. Aarav Verma (Sound & Audio Lead)"
                />
              )}
            </div>

            {/* Deadline & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  Deadline Date &amp; Time
                </label>
                <GlassInput
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  placeholder="2026-03-25 18:00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as TaskPriority })
                  }
                  className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical / Urgent</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2.5 border-t border-[rgba(124,58,237,0.08)]">
              <PillButton
                type="button"
                variant="glass"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </PillButton>
              <PillButton
                type="submit"
                variant="primary"
                size="sm"
                loading={isSubmitting}
                className="w-full sm:w-auto"
              >
                Publish Task to OC
              </PillButton>
            </div>
          </form>
        </div>
      </Modal>
    </PageContainer>
  );
};
