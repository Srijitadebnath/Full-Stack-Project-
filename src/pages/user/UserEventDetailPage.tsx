import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Users, Building, ShieldCheck } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { GlassCard, PillButton, Chip } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (eventId) eventService.getEventById(eventId).then((e) => setEvent(e || null));
  }, [eventId]);

  if (!event) {
    return (
      <div className="py-24 text-center text-xs text-[var(--color-text-muted,#8B87A3)]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading event details...
      </div>
    );
  }

  const remainingSeats = event.capacity - event.registrationCount;
  const isFull = remainingSeats <= 0;
  const fillPercentage = Math.min(100, Math.round((event.registrationCount / (event.capacity || 1)) * 100));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb Action */}
      <div className="flex items-center justify-between">
        <PillButton
          variant="glass"
          size="sm"
          onClick={() => navigate('/user/home')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events Hub</span>
        </PillButton>
        <Chip variant="purple" size="sm">
          {event.category}
        </Chip>
      </div>

      {/* Main Glass Event Card */}
      <GlassCard className="overflow-hidden p-0 rounded-3xl">
        <div className="h-72 sm:h-80 w-full bg-slate-100 relative overflow-hidden">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Chip variant={isFull ? 'danger' : 'purple'} dot size="md">
              {isFull ? 'Sold Out' : event.status}
            </Chip>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase">
              {event.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 drop-shadow-sm">
              {event.name}
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted,#8B87A3)]">
              Event Overview
            </h2>
            <p className="text-sm text-[var(--color-text-body,#4B4763)] leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Metadata Grid (Neumorphic Inset) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl neo-inset">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                  Date &amp; Schedule
                </span>
                <span className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)]">
                  {formatDate(event.date)} ({event.startTime})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                  Campus Venue
                </span>
                <span className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)]">
                  {event.venue}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl neo-raised flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                  Registration Cutoff
                </span>
                <span className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)]">
                  {formatDate(event.registrationDeadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Seat Filling Capacity Bar */}
          <div className="space-y-2 p-4 rounded-2xl bg-white/50 border border-white/80">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--color-text-heading,#1E1B2E)]">
                Registration Capacity
              </span>
              <span className="font-semibold text-purple-700">
                {event.registrationCount} / {event.capacity} seats filled ({fillPercentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${fillPercentage}%`,
                  background: 'var(--chart-bar-gradient, linear-gradient(180deg, #FB923C, #C084FC))',
                }}
              />
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-[rgba(124,58,237,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-medium text-[var(--color-text-muted,#8B87A3)] block">
                Organized by UPES Student Affairs &amp; {event.organizer}
              </span>
              <span className="text-[11px] text-purple-700 font-semibold">
                Instant digital entry QR pass generated upon registration
              </span>
            </div>
            <PillButton
              variant="primary"
              size="lg"
              disabled={isFull}
              onClick={() => navigate(`/user/register/${event.id}`)}
              className="w-full sm:w-auto"
            >
              {isFull ? 'Seats Full' : 'Register for Pass →'}
            </PillButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
