import React, { useState } from 'react';
import { UserCheck, Clock, MapPin } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button } from '../../components/ui';

export const VendorAttendancePage: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const handleToggleAttendance = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setIsCheckedIn(false);
    }
  };

  return (
    <PageContainer
      title="Event Attendance & Venue Check-In"
      subtitle="Simulate on-site venue check-in and check-out tracking for vendor team members."
    >
      <Card className="max-w-md mx-auto text-center space-y-4 p-6">
        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
          <UserCheck className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900">TechFest UPES 2026</h3>
          <p className="text-xs text-slate-500 mt-0.5">MAC Main Auditorium • Stage Sound Setup</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
          <span className="text-slate-400 block">Current Status</span>
          <Badge variant={isCheckedIn ? 'emerald' : 'slate'} dot>
            {isCheckedIn ? `Checked In at ${checkInTime}` : 'Checked Out / Not Checked In'}
          </Badge>
        </div>

        <Button
          onClick={handleToggleAttendance}
          variant={isCheckedIn ? 'danger' : 'primary'}
          className="w-full"
        >
          {isCheckedIn ? 'Check Out from Venue' : 'Check In to Venue'}
        </Button>
      </Card>
    </PageContainer>
  );
};
