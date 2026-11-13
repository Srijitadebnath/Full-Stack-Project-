import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { PageContainer } from '../../components/layout';
import { GlassCard, Chip, PillButton } from '../../components/ui';

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
          <GlassCard key={tsk.id} lift className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-[#1E1B2E]">{tsk.name}</h4>
                <p className="text-xs text-[#4B4763] mt-0.5">{tsk.description}</p>
                <span className="text-[11px] text-purple-700 font-semibold block mt-1">
                  Event: {tsk.eventName} • Deadline: {tsk.deadline}
                </span>
              </div>
              <Chip variant={tsk.status === 'Completed' ? 'success' : 'purple'}>
                {tsk.status}
              </Chip>
            </div>

            {/* Gradient Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#8B87A3]">Milestone Progress</span>
                <span className="text-purple-700">{tsk.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${tsk.progress}%`,
                    background:
                      tsk.progress === 100
                        ? 'linear-gradient(90deg, #16A34A, #10B981)'
                        : 'linear-gradient(90deg, #7C3AED, #A855F7 60%, #FB923C)',
                  }}
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-purple-500/10">
              <PillButton
                variant="glass"
                size="sm"
                onClick={() => handleUpdateProgress(tsk.id, Math.min(100, tsk.progress + 25))}
              >
                +25% Progress
              </PillButton>
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/vendor/submissions')}
                icon={<Upload className="w-3.5 h-3.5" />}
              >
                Submit Update
              </PillButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageContainer>
  );
};
