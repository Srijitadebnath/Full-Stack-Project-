import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
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
      {/* OC Operations AI Banner */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 text-white shadow-xl shadow-purple-950/20 border border-purple-600/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-purple-400/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>EVENTRA OC Operations Assistant</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              Live Duties, Team Roster &amp; Operational Conduct Guide
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Have questions about your assigned tasks, work proof submission steps, fellow team members, or campus conduct policies? Ask your AI assistant anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => navigate('/vendor/ai')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs hover:bg-purple-50 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Open Team AI</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
            </button>
          </div>
        </div>
      </div>

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
