import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { Card, Badge, Button } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserEventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (eventId) eventService.getEventById(eventId).then((e) => setEvent(e || null));
  }, [eventId]);

  if (!event) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading event details...</div>;
  }

  return (
    <div className="min-h-screen bg-[#faf9fc]">
      {/* Top Bar */}
      <nav className="h-16 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/user/home')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Events
        </Button>
        <span className="text-xs font-semibold text-slate-700">Student Portal</span>
      </nav>

      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Banner Card */}
        <Card className="overflow-hidden p-0">
          <div className="h-64 w-full bg-slate-100 relative">
            <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4">
              <Badge variant="purple" dot>{event.status}</Badge>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{event.category}</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{event.name}</h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{event.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-purple-50/60 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <div><span className="text-slate-400 block text-[10px]">Date & Time</span><span className="font-semibold text-slate-900">{formatDate(event.date)}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                <div><span className="text-slate-400 block text-[10px]">Venue</span><span className="font-semibold text-slate-900">{event.venue}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div><span className="text-slate-400 block text-[10px]">Registration Deadline</span><span className="font-semibold text-slate-900">{formatDate(event.registrationDeadline)}</span></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Organized by {event.organizer}</span>
                <p className="text-[11px] text-slate-400">{event.registrationCount} / {event.capacity} seats filled</p>
              </div>
              <Button size="lg" onClick={() => navigate(`/user/register/${event.id}`)}>
                Register Now
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
