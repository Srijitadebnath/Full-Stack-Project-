import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Bell, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { GlassCard, PillButton, Chip } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventService.getEvents().then(setEvents);
  }, []);

  const updates = [
    { title: 'TechFest UPES 2026', note: 'Venue confirmed to Main MAC Auditorium & APG Block', time: '2 hours ago' },
    { title: 'UPES AI Innovation Sprint', note: 'Problem statement released for preliminary round', time: 'Yesterday' },
    { title: 'Cultural Night & Band War', note: 'Audition schedules uploaded to student portal', time: '3 days ago' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
            Campus Calendar &amp; Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted,#8B87A3)] mt-0.5">
            Key dates, venue schedules, and live notifications across UPES events.
          </p>
        </div>
        <PillButton
          variant="glass"
          size="sm"
          onClick={() => navigate('/user/home')}
          className="self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </PillButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Announcements Column */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-5 space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[rgba(124,58,237,0.08)]">
              <div className="w-7 h-7 rounded-lg neo-raised flex items-center justify-center text-purple-600">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] uppercase tracking-wider">
                Event Dispatches
              </h3>
            </div>

            <div className="space-y-3">
              {updates.map((u, i) => (
                <div
                  key={i}
                  className="p-3 bg-white/70 rounded-2xl border border-white/80 neo-raised space-y-1 text-xs"
                >
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-bold text-[var(--color-text-heading,#1E1B2E)]">{u.title}</h4>
                    <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] shrink-0">
                      {u.time}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-body,#4B4763)]">{u.note}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Scheduled Calendar Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[var(--color-text-heading,#1E1B2E)]">
              Upcoming Schedule
            </h2>
            <Chip variant="purple" size="sm">
              {events.length} Events Listed
            </Chip>
          </div>

          <div className="space-y-3.5">
            {events.map((e) => (
              <GlassCard
                key={e.id}
                lift
                onClick={() => navigate(`/user/events/${e.id}`)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer rounded-2xl"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex flex-col items-center justify-center neo-raised shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[var(--color-text-heading,#1E1B2E)]">
                        {e.name}
                      </h4>
                      <Chip variant="purple" size="sm">
                        {e.category}
                      </Chip>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted,#8B87A3)] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        {formatDate(e.date)} ({e.startTime})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        {e.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  <PillButton
                    variant="glass"
                    size="sm"
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>View Pass Info</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </PillButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
