import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Clock, AlertTriangle, CheckCircle2, Calendar, UserCheck, Filter } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Event, TeamMember } from '../../types';
import { taskService } from '../../services/taskService';
import { eventService } from '../../services/eventService';
import { teamService } from '../../services/teamService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, ProgressBar, Modal } from '../../components/ui';

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    const [taskList, eventList, teamList] = await Promise.all([
      taskService.getTasks(),
      eventService.getEvents(),
      teamService.getTeamMembers(),
    ]);

    setTasks(taskList);
    setEvents(eventList);
    setTeamMembers(teamList);

    if (eventList.length > 0 && !formData.eventId) {
      setFormData(prev => ({
        ...prev,
        eventId: eventList[0].id,
        eventName: eventList[0].name,
        assignedToName: teamList.length > 0 ? teamList[0].name : 'OC Operations Team',
        assignedToId: teamList.length > 0 ? teamList[0].id : 'team-1',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16).replace('T', ' '),
      }));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEvent = events.find(ev => ev.id === formData.eventId);
    await taskService.createTask({
      ...formData,
      eventName: targetEvent ? targetEvent.name : formData.eventName,
    });
    setIsModalOpen(false);
    setFormData(prev => ({
      ...prev,
      name: '',
      description: '',
    }));
    await loadData();
  };

  // Filter tasks based on selected event
  const displayedTasks = selectedEventId === 'all'
    ? tasks
    : tasks.filter(t => t.eventId === selectedEventId);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical': return <Badge variant="rose">Critical Priority</Badge>;
      case 'high': return <Badge variant="amber">High Priority</Badge>;
      case 'medium': return <Badge variant="blue">Medium Priority</Badge>;
      case 'low': return <Badge variant="slate">Low Priority</Badge>;
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <PageContainer
      title="Work Assignment & Task Tracker"
      subtitle="Assign departmental responsibilities and track progress milestones per event."
      action={
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Assign New Task
        </Button>
      }
    >
      {/* 🎯 Event Selector & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">Scope View</span>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              {selectedEventId === 'all' ? 'All Campus Events' : (selectedEvent?.name || 'Selected Event')}
            </h4>
          </div>
        </div>

        <div className="w-full sm:w-80">
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            options={[
              { value: 'all', label: `All Events (${tasks.length} total tasks)` },
              ...events.map(ev => ({
                value: ev.id,
                label: ev.name
              }))
            ]}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {displayedTasks.length === 0 && !isLoading && (
          <Card className="p-8 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-800">No Tasks Found for this Scope</h4>
            <p className="text-xs text-slate-400">
              {selectedEventId === 'all' 
                ? "No tasks have been assigned yet across any events." 
                : `No tasks assigned yet for ${selectedEvent?.name}. Click 'Assign New Task' to delegate duties.`}
            </p>
          </Card>
        )}

        {displayedTasks.map((tsk) => (
          <Card key={tsk.id} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-semibold text-slate-900">{tsk.name}</h4>
                  {getPriorityBadge(tsk.priority)}
                </div>
                <p className="text-xs text-slate-500 mt-1">{tsk.description}</p>
              </div>

              <Badge variant={tsk.status === 'Completed' ? 'emerald' : tsk.status === 'In Progress' ? 'purple' : 'amber'}>
                {tsk.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned OC Member</span> 
                <span className="font-semibold text-purple-700">{tsk.assignedToName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Event Assignment</span> 
                <span className="font-semibold text-slate-800">{tsk.eventName || 'Campus Fest'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Deadline</span> 
                <span className="font-semibold text-slate-800">{tsk.deadline}</span>
              </div>
            </div>

            <ProgressBar progress={tsk.progress} color={tsk.progress === 100 ? 'emerald' : 'purple'} showLabel />
          </Card>
        ))}
      </div>

      {/* Modal to Assign New Task */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Work Task">
        <form onSubmit={handleCreateTask} className="space-y-3">
          {/* Target Event Selection */}
          <Select
            label="Assign to Event"
            required
            value={formData.eventId}
            onChange={(e) => {
              const ev = events.find(item => item.id === e.target.value);
              setFormData({
                ...formData,
                eventId: e.target.value,
                eventName: ev ? ev.name : '',
              });
            }}
            options={events.map(ev => ({
              value: ev.id,
              label: ev.name
            }))}
          />

          <Input 
            label="Task Title" 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="e.g. Inspect Main Stage Lighting and Rigging"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Detailed Instructions</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-purple-500"
              placeholder="Specify requirements, safety checks, or deliverables..."
            />
          </div>

          {/* Assignee Selection (from live OC team or custom) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Assign To OC Member</label>
            {teamMembers.length > 0 ? (
              <Select
                value={formData.assignedToName}
                onChange={(e) => {
                  const member = teamMembers.find(m => m.name === e.target.value);
                  setFormData({
                    ...formData,
                    assignedToName: e.target.value,
                    assignedToId: member ? member.id : '',
                  });
                }}
                options={teamMembers.map(m => ({
                  value: m.name,
                  label: `${m.name} (${m.role} - ${m.department || 'Operations'})`
                }))}
              />
            ) : (
              <Input 
                required 
                value={formData.assignedToName} 
                onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })} 
                placeholder="e.g. Aarav Verma (Sound & Audio Lead)"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Deadline (YYYY-MM-DD HH:MM)" 
              value={formData.deadline} 
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
            />
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              options={[
                { value: 'low', label: 'Low Priority' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'high', label: 'High Priority' },
                { value: 'critical', label: 'Critical / Urgent' },
              ]}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Publish Task to OC</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
