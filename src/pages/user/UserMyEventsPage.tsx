import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { Registration } from '../../types';
import { registrationService } from '../../services/registrationService';
import { Card, Badge, Button } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserMyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [myRegs, setMyRegs] = useState<Registration[]>([]);

  useEffect(() => {
    registrationService.getRegistrations().then(setMyRegs);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/user/home')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Events
          </Button>
          <h1 className="text-xl font-bold text-slate-900">My Registered Events</h1>
        </div>

        <div className="space-y-4">
          {myRegs.map((r) => (
            <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{r.eventName}</h3>
                  <Badge variant="purple">Registered</Badge>
                </div>
                <p className="text-xs text-slate-500">Registration ID: {r.id} • Student ID: {r.studentId}</p>
                <p className="text-xs text-purple-700 font-medium pt-1">Registered on {formatDate(r.registrationDate)}</p>
              </div>

              <div className="shrink-0 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/user/calendar')}>
                  View Updates
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
