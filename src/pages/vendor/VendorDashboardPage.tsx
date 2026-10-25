import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, ProgressBar } from '../../components/ui';

export const VendorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    taskService.getTasks().then(setTasks);
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== 'Completed');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  return (
    <PageContainer
      title="Vendor & Team Portal"
      subtitle="Today's work schedule, assigned tasks, and quick progress update panel."
    >
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-slate-400">Assigned Events</span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">2 Events</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Active Tasks</span>
          <h3 className="text-xl font-bold text-purple-700 mt-1">{activeTasks.length}</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Completed Tasks</span>
          <h3 className="text-xl font-bold text-emerald-600 mt-1">{completedTasks.length}</h3>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-slate-400">Upcoming Deadline</span>
          <h3 className="text-sm font-bold text-amber-600 mt-1">Today 06:00 PM</h3>
        </Card>
      </div>

      {/* Today's Work Schedule Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Today's Work Schedule</h3>
        <Card className="space-y-3 border-l-4 border-l-purple-600">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-purple-700 font-medium">10:00 AM – 02:00 PM</span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">Main Stage JBL Sound & LED Rigging</h4>
              <p className="text-xs text-slate-500">TechFest UPES 2026 • MAC Auditorium</p>
            </div>
            <Badge variant="purple" dot>In Progress</Badge>
          </div>
          <ProgressBar progress={75} color="purple" showLabel />
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" onClick={() => navigate('/vendor/submissions')}>
              Submit Work Update
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
