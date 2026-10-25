import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { PageContainer } from '../../components/layout';
import { Card, Badge } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const AdminCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventService.getEvents().then(setEvents);
  }, []);

  return (
    <PageContainer
      title="College Event Operations Calendar"
      subtitle="Visual timeline of scheduled campus events, stage setups, and registration deadlines."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => (
          <Card key={evt.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-900">{evt.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{evt.category}</p>
              </div>
              <Badge variant="purple">{evt.status}</Badge>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-semibold">{formatDate(evt.date)} ({evt.startTime} - {evt.endTime})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>{evt.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Registration Deadline: {formatDate(evt.registrationDeadline)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
