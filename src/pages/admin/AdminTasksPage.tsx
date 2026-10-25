import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { taskService } from '../../services/taskService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, ProgressBar, Modal } from '../../components/ui';

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignedToName: 'Sound & Audio OC Team (Aarav Verma)',
    assignedToId: 'user-team-2',
    assignedType: 'member' as const,
    eventId: 'evt-101',
    eventName: 'TechFest UPES 2026',
    deadline: '2026-10-19 18:00',
    priority: 'high' as TaskPriority,
    status: 'Assigned' as TaskStatus,
  });

  const loadTasks = async () => {
    const list = await taskService.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await taskService.createTask(formData);
    setIsModalOpen(false);
    loadTasks();
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'critical': return <Badge variant="rose">Critical Priority</Badge>;
      case 'high': return <Badge variant="amber">High Priority</Badge>;
      case 'medium': return <Badge variant="blue">Medium Priority</Badge>;
      case 'low': return <Badge variant="slate">Low Priority</Badge>;
    }
  };

  return (
    <PageContainer
      title="Work Assignment & Task Tracker"
      subtitle="Assign tasks to organizing committee team members with deadlines and strict status tracking."
      action={
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Assign New Task
        </Button>
      }
    >
      <div className="space-y-3">
        {tasks.map((tsk) => (
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
              <div><span className="text-slate-400 block text-[10px]">Assigned To</span> <span className="font-semibold text-purple-700">{tsk.assignedToName}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Event</span> <span className="font-semibold text-slate-800">{tsk.eventName}</span></div>
              <div><span className="text-slate-400 block text-[10px]">Deadline</span> <span className="font-semibold text-slate-800">{tsk.deadline}</span></div>
            </div>

            <ProgressBar progress={tsk.progress} color={tsk.progress === 100 ? 'emerald' : 'purple'} showLabel />
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Work Task">
        <form onSubmit={handleCreateTask} className="space-y-3">
          <Input label="Task Title" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl p-2.5 outline-none focus:border-purple-500"
            />
          </div>
          <Input label="Assignee Name" required value={formData.assignedToName} onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Deadline" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Publish Task</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
