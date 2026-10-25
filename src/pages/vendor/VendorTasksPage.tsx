import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, ProgressBar } from '../../components/ui';

export const VendorTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    taskService.getTasks().then(setTasks);
  }, []);

  const handleUpdateProgress = async (taskId: string, newProgress: number) => {
    await taskService.updateTaskStatus(taskId, newProgress === 100 ? 'Completed' : 'In Progress', newProgress);
    const updated = await taskService.getTasks();
    setTasks(updated);
  };

  return (
    <PageContainer
      title="My Assigned Work Tasks"
      subtitle="View work items assigned specifically to your team with actions to start, update progress, or submit photo/voice updates."
    >
      <div className="space-y-4">
        {tasks.map((tsk) => (
          <Card key={tsk.id} className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{tsk.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{tsk.description}</p>
                <span className="text-[11px] text-purple-600 font-medium block mt-1">Event: {tsk.eventName} • Deadline: {tsk.deadline}</span>
              </div>
              <Badge variant={tsk.status === 'Completed' ? 'emerald' : 'purple'}>{tsk.status}</Badge>
            </div>

            <ProgressBar progress={tsk.progress} color="purple" showLabel />

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateProgress(tsk.id, Math.min(100, tsk.progress + 25))}
              >
                +25% Progress
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/vendor/submissions')}
                icon={<Upload className="w-3.5 h-3.5" />}
              >
                Submit Update
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
