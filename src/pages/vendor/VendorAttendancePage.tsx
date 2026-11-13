import React, { useState } from 'react';
import { UserCheck, Clock, MapPin } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { GlassCard, Chip, PillButton } from '../../components/ui';

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
      subtitle="On-site venue check-in and check-out tracking for Organizing Committee duty officers."
    >
      <GlassCard className="max-w-md mx-auto text-center space-y-5 p-8">
        <div className="w-16 h-16 rounded-3xl neo-raised flex items-center justify-center mx-auto text-purple-600 border border-white/80 shadow-md">
          <UserCheck className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#1E1B2E]">UPES AI Innovation Sprint &amp; Hackathon 2026</h3>
          <p className="text-xs text-[#8B87A3] mt-1">MAC Main Auditorium • Stage Sound &amp; Networking Setup</p>
        </div>

        <div className="p-4 neo-inset rounded-2xl text-xs space-y-2">
          <span className="text-[#8B87A3] font-medium block">Current Operational Status</span>
          <Chip variant={isCheckedIn ? 'success' : 'neutral'}>
            {isCheckedIn ? `Checked In at ${checkInTime}` : 'Checked Out / Off Duty'}
          </Chip>
        </div>

        <PillButton
          onClick={handleToggleAttendance}
          variant={isCheckedIn ? 'danger' : 'primary'}
          className="w-full py-3"
        >
          {isCheckedIn ? 'Check Out from Venue' : 'Check In to Venue Live'}
        </PillButton>
      </GlassCard>
    </PageContainer>
  );
};
