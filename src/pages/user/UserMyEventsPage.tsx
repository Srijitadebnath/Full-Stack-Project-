import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import { Registration } from '../../types';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { Card, Badge, Button } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserMyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      if (!u?.email) {
        setIsLoggedIn(false);
        setMyRegs([]);
        return;
      }
      setIsLoggedIn(true);
      registrationService.getRegistrations(u.email).then(setMyRegs);
    });
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate('/user/home')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-slate-900">My Registered Events</h1>
        </div>

        {!isLoggedIn ? (
          <Card className="p-8 text-center space-y-3">
            <Ticket className="w-8 h-8 text-purple-500 mx-auto" />
            <p className="text-xs text-slate-600">Sign in with your UPES student email to view your personal event passes.</p>
            <Button size="sm" onClick={() => navigate('/login')}>Sign In Now</Button>
          </Card>
        ) : myRegs.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">You have not registered for any events yet.</p>
            <Button size="sm" variant="outline" onClick={() => navigate('/user/home')}>Discover Events</Button>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
};
