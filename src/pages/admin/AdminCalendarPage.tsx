import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { PageContainer } from '../../components/layout';
import { GlassCard, Chip, PillButton } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    eventService.getEvents().then(setEvents);
  }, []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDate();

  return (
    <PageContainer
      title="College Event Operations Calendar"
      subtitle="Visual timeline of scheduled campus events, stage setups, and registration deadlines."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 space-y-5">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neo-raised flex items-center justify-center text-purple-600 border border-white/60">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E1B2E]">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <span className="text-xs text-[#8B87A3]">Active UPES Academic Term</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="w-8 h-8 rounded-full neo-raised flex items-center justify-center text-[#4B4763] hover:text-purple-600 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="w-8 h-8 rounded-full neo-raised flex items-center justify-center text-[#4B4763] hover:text-purple-600 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#8B87A3] py-1">
              {daysOfWeek.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix (Sample 35 cells) */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, idx) => {
                const dayNum = idx - 2; // Offset for month starting on Wednesday
                const isCurrentMonth = dayNum > 0 && dayNum <= 30;
                const isToday = isCurrentMonth && dayNum === today;
                const hasEvent = isCurrentMonth && [8, 14, 22, 28].includes(dayNum);

                return (
                  <div
                    key={idx}
                    className={`h-16 sm:h-20 p-1.5 rounded-2xl flex flex-col justify-between transition-all ${
                      isCurrentMonth
                        ? 'neo-inset hover:bg-white/80'
                        : 'opacity-30 bg-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      {isToday ? (
                        <span className="w-6 h-6 rounded-full btn-primary text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {dayNum}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#1E1B2E] pl-1">
                          {isCurrentMonth ? dayNum : ''}
                        </span>
                      )}

                      {hasEvent && (
                        <span className="w-2 h-2 rounded-full bg-purple-600 shadow-xs" />
                      )}
                    </div>

                    {hasEvent && (
                      <div className="truncate px-1.5 py-0.5 rounded-md bg-purple-500/15 text-[10px] font-bold text-purple-700">
                        {dayNum === 28 ? 'AI Hackathon' : 'Campus Event'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Dark Glass Side Card (Prompt: "Today's Events") */}
        <div>
          <div className="glass-dark p-6 h-full flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-200">
                    Today&apos;s Events
                  </h3>
                </div>
                <span className="text-[11px] text-purple-300 font-semibold">
                  {formatDate(new Date().toISOString().split('T')[0])}
                </span>
              </div>

              {/* Event Cards in Dark Glass */}
              <div className="space-y-3.5">
                {events.length > 0 ? (
                  events.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white leading-snug">{evt.name}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                          {evt.category}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-purple-200/80">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-300" />
                          <span>{evt.startTime} - {evt.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-purple-300" />
                          <span>{evt.venue}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-purple-300/70 py-6 text-center">
                    No active timeline sessions today.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-purple-300 flex items-center justify-between">
              <span>UPES Operations Desk</span>
              <span className="text-emerald-400 font-bold">● Active Sync</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
