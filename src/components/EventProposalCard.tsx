import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { EventProposalData } from '../services/aiService';
import { eventService } from '../services/eventService';
import { taskService } from '../services/taskService';
import { TaskPriority } from '../types';
import { Badge, Button } from './ui';

interface EventProposalCardProps {
  proposal: EventProposalData;
  onEventCreated?: (eventId: string, eventName: string) => void;
}

export const EventProposalCard: React.FC<EventProposalCardProps> = ({
  proposal,
  onEventCreated,
}) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { eventData, suggestedTasks = [] } = proposal;

  const handleApproveAndCreate = async () => {
    setIsCreating(true);
    setErrorMessage(null);

    try {
      // 1. Create the Event in PostgreSQL
      const created = await eventService.createEvent({
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        venue: eventData.venue,
        date: eventData.date,
        startTime: eventData.startTime || '09:00 AM',
        endTime: eventData.endTime || '05:00 PM',
        registrationDeadline: eventData.registrationDeadline || eventData.date,
        capacity: Number(eventData.capacity) || 100,
        budget: Number(eventData.budget) || 10000,
        organizer: eventData.organizer || 'School of Computer Science & OC',
        image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        status: 'upcoming',
      });

      // 2. Automatically seed the initial tasks if proposed
      if (suggestedTasks.length > 0 && created && created.id) {
        for (const t of suggestedTasks) {
          try {
            const normalizedPriority = (
              t.priority?.toLowerCase() === 'high' ? 'high' : t.priority?.toLowerCase() === 'low' ? 'low' : 'medium'
            ) as TaskPriority;

            await taskService.createTask({
              name: t.name,
              description: t.description || 'Initial operational task created by Faculty AI Architect.',
              eventId: created.id,
              eventName: created.name,
              priority: normalizedPriority,
              status: 'Pending',
              deadline: `${eventData.date} ${eventData.startTime || '09:00 AM'}`,
              assignedToName: 'Unassigned OC Member',
              assignedToId: 'unassigned',
              assignedType: 'member',
            });
          } catch (taskErr) {
            console.warn('Failed to seed suggested task:', taskErr);
          }
        }
      }

      setCreatedEventId(created.id);
      onEventCreated?.(created.id, created.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to publish event to database.';
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-3 bg-white text-slate-900 rounded-2xl border-2 border-purple-200/90 shadow-md p-4 space-y-3.5 transition-all">
      {/* Header Badge & Title */}
      <div className="flex items-start justify-between gap-2 border-b border-purple-50 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>AI Event Proposal Blueprint</span>
          </div>
          <h4 className="font-bold text-sm text-slate-900">{eventData.name}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-2">{eventData.description}</p>
        </div>
        <Badge variant="purple">{eventData.category}</Badge>
      </div>

      {/* Grid of Planned Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-2.5 bg-slate-50/80 rounded-xl text-[11px]">
        <div className="space-y-0.5">
          <span className="text-slate-400 block text-[10px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-purple-500" /> Date
          </span>
          <span className="font-semibold text-slate-800">{eventData.date}</span>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-400 block text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" /> Time
          </span>
          <span className="font-semibold text-slate-800">
            {eventData.startTime} - {eventData.endTime}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-400 block text-[10px] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" /> Venue
          </span>
          <span className="font-semibold text-slate-800 truncate block" title={eventData.venue}>
            {eventData.venue}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-slate-400 block text-[10px] flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-500" /> Capacity
          </span>
          <span className="font-semibold text-slate-800">{eventData.capacity} Seats</span>
        </div>
      </div>

      {/* Budget & Organizer Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-purple-50/60 rounded-xl text-xs border border-purple-100/60">
        <div className="flex items-center gap-1.5 text-purple-900 font-medium">
          <DollarSign className="w-3.5 h-3.5 text-purple-600" />
          <span>Estimated Budget:</span>
          <strong className="text-purple-700 font-bold">₹{Number(eventData.budget).toLocaleString('en-IN')}</strong>
        </div>
        <div className="text-[11px] text-slate-500">
          Organizer: <strong className="text-slate-700">{eventData.organizer}</strong>
        </div>
      </div>

      {/* Suggested Initial Tasks */}
      {suggestedTasks.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
            <span>Recommended Initial Tasks ({suggestedTasks.length})</span>
          </span>
          <div className="space-y-1">
            {suggestedTasks.map((t, tIdx) => (
              <div
                key={tIdx}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70 text-[11px]"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 block">{t.name}</span>
                  <span className="text-[10px] text-slate-500 block">{t.description}</span>
                </div>
                <Badge variant={t.priority === 'High' ? 'rose' : 'purple'}>
                  {t.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error message if creation failed */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        {createdEventId ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Event Created &amp; Published to Campus Calendar!</span>
            </div>
            <button
              onClick={() => navigate(`/admin/events/${createdEventId}`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer text-[11px]"
            >
              <span>View in Operations Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400">
              Review details before committing to the campus database
            </span>
            <Button
              size="sm"
              onClick={handleApproveAndCreate}
              disabled={isCreating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
              icon={
                isCreating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )
              }
            >
              {isCreating ? 'Creating Event...' : 'Approve & Create Event Live'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
