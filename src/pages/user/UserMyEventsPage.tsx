import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowLeft, QrCode, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Registration } from '../../types';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { GlassCard, PillButton, Chip, Modal } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserMyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [myRegs, setMyRegs] = useState<Registration[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [selectedPass, setSelectedPass] = useState<Registration | null>(null);

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
            My Digital Passes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted,#8B87A3)] mt-0.5">
            Your confirmed campus event passes and QR entry tickets.
          </p>
        </div>
        <PillButton
          variant="glass"
          size="sm"
          onClick={() => navigate('/user/home')}
          className="self-start sm:self-auto flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Discover More Events</span>
        </PillButton>
      </div>

      {!isLoggedIn ? (
        <GlassCard className="p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto neo-raised">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-heading,#1E1B2E)]">
            Sign In Required
          </h3>
          <p className="text-xs text-[var(--color-text-muted,#8B87A3)] max-w-sm mx-auto">
            Sign in with your UPES student email to view your personal event passes and verification badges.
          </p>
          <PillButton variant="primary" size="md" onClick={() => navigate('/login')}>
            Sign In Now →
          </PillButton>
        </GlassCard>
      ) : myRegs.length === 0 ? (
        <GlassCard className="p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[var(--color-text-muted,#8B87A3)] flex items-center justify-center mx-auto neo-raised">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text-heading,#1E1B2E)]">
            No Event Passes Yet
          </h3>
          <p className="text-xs text-[var(--color-text-muted,#8B87A3)] max-w-sm mx-auto">
            You haven't registered for any campus events yet. Explore live and upcoming fests in the catalog.
          </p>
          <PillButton variant="primary" size="sm" onClick={() => navigate('/user/home')}>
            Browse Events Catalog
          </PillButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myRegs.map((r) => (
            <GlassCard
              key={r.id}
              lift
              className="p-5 flex flex-col justify-between space-y-4 rounded-3xl"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Chip variant="success" dot size="sm">
                      CONFIRMED
                    </Chip>
                    <h3 className="text-base font-extrabold text-[var(--color-text-heading,#1E1B2E)] mt-1.5 leading-snug">
                      {r.eventName}
                    </h3>
                  </div>
                  <div className="p-2 rounded-xl bg-white/70 neo-raised text-purple-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-3 rounded-2xl neo-inset space-y-1 text-xs text-[var(--color-text-muted,#8B87A3)]">
                  <div className="flex justify-between">
                    <span>Attendee:</span>
                    <strong className="text-[var(--color-text-heading,#1E1B2E)]">{r.userName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>SAP ID:</span>
                    <strong className="font-mono text-[var(--color-text-heading,#1E1B2E)]">{r.studentId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ticket Ref:</span>
                    <strong className="font-mono text-purple-700">#{r.id.slice(0, 8)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(124,58,237,0.08)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--color-text-muted,#8B87A3)]">
                  Registered {formatDate(r.registrationDate)}
                </span>
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedPass(r)}
                >
                  View QR Badge →
                </PillButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Ticket Details & QR Pass Modal */}
      {selectedPass && (
        <Modal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          title="Campus Digital Event Pass"
        >
          <div className="space-y-4">
            <GlassCard dark className="p-6 text-white space-y-4 rounded-3xl text-left">
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-purple-300 uppercase font-bold tracking-wider block">
                    Campus Event
                  </span>
                  <h4 className="text-lg font-extrabold mt-0.5">{selectedPass.eventName}</h4>
                </div>
                <Chip variant="success" size="sm">
                  {selectedPass.status || 'CONFIRMED'}
                </Chip>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div>
                  <span className="text-purple-300 block text-[10px]">Attendee Name</span>
                  <span className="font-bold text-sm">{selectedPass.userName}</span>
                </div>
                <div>
                  <span className="text-purple-300 block text-[10px]">SAP / Student ID</span>
                  <span className="font-mono font-bold text-sm">{selectedPass.studentId}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-purple-300 block text-[10px]">Institutional Email</span>
                  <span className="font-mono text-xs opacity-90">{selectedPass.userEmail}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-4 border-t border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="p-3 bg-white rounded-2xl shadow-md">
                  <QRCodeSVG
                    value={JSON.stringify({
                      ticketId: selectedPass.id,
                      event: selectedPass.eventName,
                      email: selectedPass.userEmail,
                    })}
                    size={140}
                    level="H"
                  />
                </div>
                <p className="text-[11px] text-purple-200 font-mono mt-1">
                  Ticket #{selectedPass.id}
                </p>
                <span className="text-[10px] text-slate-400">Present this QR at the venue entrance</span>
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <PillButton variant="glass" size="sm" onClick={() => setSelectedPass(null)}>
                Close Pass
              </PillButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
