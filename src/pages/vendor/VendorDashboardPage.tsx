import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  StatCard,
  PillButton,
  Chip,
} from '../../components/ui';

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
      title="Organizing Committee Operations Desk"
      subtitle="Today's task schedule, work assignments, and work proof submission telemetry."
    >
      {/* OC Operations AI Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-[28px] bg-gradient-to-r from-purple-700/85 via-indigo-600/85 to-pink-500/85 backdrop-blur-2xl text-white border border-white/40 shadow-[0_16px_40px_rgba(124,58,237,0.18)]">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>EVENTRA AI · OC Assistant</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Live Duties, Team Roster &amp; Operational Conduct Guide
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
              Have questions about your assigned tasks, work proof submission steps, fellow team members, or campus conduct policies? Ask EVENTRA AI anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <PillButton
              variant="glass"
              onClick={() => navigate('/vendor/ai')}
              icon={<Sparkles className="w-4 h-4 text-purple-600" />}
            >
              Open EVENTRA AI
            </PillButton>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Assigned Events"
          value="2 Events"
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          helperText="Active Campus Fests"
          onClick={() => navigate('/vendor/events')}
        />
        <StatCard
          label="Active Tasks"
          value={activeTasks.length}
          icon={<Briefcase className="w-5 h-5 text-indigo-600" />}
          trend={{ value: `${activeTasks.length} in progress`, type: 'neutral' }}
          onClick={() => navigate('/vendor/tasks')}
        />
        <StatCard
          label="Completed Tasks"
          value={completedTasks.length}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          trend={{ value: 'Verified by Dean', type: 'up' }}
          onClick={() => navigate('/vendor/tasks')}
        />
        <StatCard
          label="Upcoming Deadline"
          value="06:00 PM"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          helperText="Stage Rigging Check"
          trend={{ value: 'Due Today', type: 'down' }}
        />
      </div>

      {/* Today's Work Schedule Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1E1B2E]">Today&apos;s Work Schedule</h3>
          <span className="text-xs font-semibold text-purple-600">Active Campus Duties</span>
        </div>

        <GlassCard lift className="space-y-4 p-5 sm:p-6 border-l-4 border-l-purple-600">
          <div className="flex justify-between items-start gap-3">
            <div>
              <span className="text-xs font-bold text-purple-700 block">10:00 AM – 02:00 PM</span>
              <h4 className="text-base font-bold text-[#1E1B2E] mt-0.5">
                Main Stage JBL Sound &amp; LED Rigging
              </h4>
              <p className="text-xs text-[#8B87A3] mt-0.5">
                TechFest UPES 2026 • MAC Auditorium
              </p>
            </div>
            <Chip variant="purple">In Progress</Chip>
          </div>

          {/* Gradient Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#8B87A3]">Milestone Progress</span>
              <span className="text-purple-700">75%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: '75%',
                  background: 'linear-gradient(90deg, #7C3AED, #A855F7 60%, #FB923C)',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/10">
            <PillButton
              size="sm"
              variant="primary"
              onClick={() => navigate('/vendor/submissions')}
            >
              Submit Work Update
            </PillButton>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
};
