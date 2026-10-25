import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Bell } from 'lucide-react';
import { Event } from '../../types';
import { eventService } from '../../services/eventService';
import { Card, Badge, Button } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    eventService.getEvents().then(setEvents);
  }, []);

  const updates = [
    { title: 'TechFest UPES 2026', note: 'Venue confirmed to Main MAC Auditorium & APG Block', time: '2 hours ago' },
    { title: 'TechFest UPES 2026', note: 'Registration closes in 3 days', time: 'Yesterday' },
    { title: 'AI & Future Tech Hackathon', note: 'Event schedule and problem statements released', time: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/user/home')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Events
          </Button>
          <h1 className="text-xl font-bold text-slate-900">Event Calendar & Live Updates</h1>
        </div>

        {/* Live Updates */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Event Announcements</h3>
          <div className="space-y-2">
            {updates.map((u, i) => (
              <Card key={i} className="p-3.5 flex items-start gap-3 bg-purple-50/40 border-purple-100">
                <Bell className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-xs font-bold text-purple-900">{u.title}</h4>
                    <span className="text-[10px] text-slate-400">{u.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{u.note}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar Events List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Scheduled Calendar Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => (
              <Card key={e.id} className="space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{e.name}</h4>
                  <Badge variant="purple">{formatDate(e.date)}</Badge>
                </div>
                <p className="text-xs text-slate-500">{e.venue} ({e.startTime})</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
