import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  AlertCircle,
  Sparkles,
  QrCode,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  BookOpen,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Event, User } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { GlassCard, PillButton, GlassInput, Chip } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserRegisterPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    college: 'UPES Dehradun',
    course: 'B.Tech Computer Science',
    year: '3rd Year',
    studentId: 'SAP-UPES-2026',
  });

  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    eventName: string;
    userName: string;
    userEmail: string;
    studentId: string;
  } | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [loadedUser, loadedEvent] = await Promise.all([
          authService.getCurrentUser(),
          eventId ? eventService.getEventById(eventId) : Promise.resolve(null),
        ]);

        setCurrentUser(loadedUser);
        setEvent(loadedEvent || null);

        if (loadedUser) {
          setFormData((prev) => ({
            ...prev,
            userName: loadedUser.name || '',
            userEmail: loadedUser.email || '',
            userPhone: loadedUser.phone || '',
            college: loadedUser.college || 'UPES Dehradun',
            course: loadedUser.department || 'B.Tech Computer Science',
          }));

          // Check if student is already registered for this event
          if (eventId && loadedUser.email) {
            try {
              const myRegs = await registrationService.getRegistrations(loadedUser.email);
              const existingTicket = myRegs.find(
                (r) =>
                  r.eventId === eventId &&
                  r.userEmail.toLowerCase() === loadedUser.email.toLowerCase()
              );
              if (existingTicket) {
                setSubmittedTicket({
                  id: existingTicket.id,
                  eventName: existingTicket.eventName,
                  userName: existingTicket.userName,
                  userEmail: existingTicket.userEmail,
                  studentId: existingTicket.studentId,
                });
              }
            } catch (regErr) {
              console.error('Error checking existing registration:', regErr);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load event for registration:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const created = await registrationService.createRegistration(eventId, {
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim().toLowerCase(),
        userPhone: formData.userPhone.trim(),
        college: formData.college.trim(),
        course: formData.course.trim(),
        year: formData.year,
        studentId: formData.studentId.trim(),
      });

      setSubmittedTicket({
        id: created.id,
        eventName: created.eventName,
        userName: created.userName,
        userEmail: created.userEmail,
        studentId: created.studentId,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to complete event registration.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <PillButton
        variant="glass"
        size="sm"
        onClick={() => navigate('/user/home')}
        className="flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Events Hub</span>
      </PillButton>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {submittedTicket ? (
        /* Live Digital Ticket State Card */
        <GlassCard className="text-center space-y-6 p-6 sm:p-8 border border-white/80 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto neo-raised">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <Chip variant="success" size="sm">
              Pass Confirmed in Database
            </Chip>
            <h2 className="text-2xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] mt-2">
              Event Pass Ready!
            </h2>
            <p className="text-xs text-[var(--color-text-muted,#8B87A3)] mt-1">
              Your registration for <strong>{submittedTicket.eventName}</strong> has been secured.
            </p>
          </div>

          {/* Visual Digital Hologram Ticket */}
          <GlassCard dark className="p-6 text-white text-left space-y-4 rounded-3xl relative overflow-hidden">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-extrabold tracking-wider block">
                  Official Campus Pass
                </span>
                <h4 className="text-lg font-extrabold mt-0.5">{submittedTicket.eventName}</h4>
              </div>
              <Chip variant="success" size="sm">
                CONFIRMED
              </Chip>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-[10px] text-purple-300 block">Attendee</span>
                <span className="font-bold">{submittedTicket.userName}</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300 block">SAP ID</span>
                <span className="font-mono font-bold">{submittedTicket.studentId}</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300 block">Email Handle</span>
                <span className="font-mono text-[11px] truncate block opacity-90">
                  {submittedTicket.userEmail}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-purple-300 block">Ticket ID</span>
                <span className="font-mono font-bold">#{submittedTicket.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* Live QR Code Box */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="p-2.5 bg-white rounded-2xl shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({
                    ticketId: submittedTicket.id,
                    event: submittedTicket.eventName,
                    email: submittedTicket.userEmail,
                  })}
                  size={100}
                  level="M"
                />
              </div>
              <div className="text-right text-[11px] text-purple-200">
                <p className="font-semibold">Scan at Venue Entry</p>
                <p className="text-[10px] opacity-75">UPES Fest Operations Gates</p>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <PillButton variant="glass" size="sm" onClick={() => navigate('/user/my-events')}>
              View My Passes
            </PillButton>
            <PillButton variant="primary" size="sm" onClick={() => navigate('/user/home')}>
              Discover More Fests
            </PillButton>
          </div>
        </GlassCard>
      ) : (
        /* Registration Form */
        <GlassCard className="p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <Chip variant="purple" size="sm">
              Event Registration
            </Chip>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
              Register for {event ? event.name : 'Campus Event'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted,#8B87A3)]">
              Complete your institutional attendee details below. Your pass will be generated instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                Full Name
              </label>
              <GlassInput
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Student Name"
                icon={<UserIcon className="w-4 h-4 text-purple-600" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  UPES Student Email
                </label>
                <GlassInput
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  placeholder="firstname.sapid@stu.upes.ac.in"
                  icon={<Mail className="w-4 h-4 text-purple-600" />}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  Contact Phone
                </label>
                <GlassInput
                  type="tel"
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  icon={<Phone className="w-4 h-4 text-purple-600" />}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  College / School
                </label>
                <GlassInput
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="UPES Dehradun"
                  icon={<Building2 className="w-4 h-4 text-purple-600" />}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  Course &amp; Specialization
                </label>
                <GlassInput
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  placeholder="B.Tech Computer Science"
                  icon={<BookOpen className="w-4 h-4 text-purple-600" />}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  Academic Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                  SAP / Student ID
                </label>
                <GlassInput
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="SAP-50001234"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(124,58,237,0.08)] flex justify-end gap-3">
              <PillButton
                type="button"
                variant="glass"
                size="sm"
                onClick={() => navigate('/user/home')}
              >
                Cancel
              </PillButton>
              <PillButton
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
              >
                Confirm &amp; Generate Ticket →
              </PillButton>
            </div>
          </form>
        </GlassCard>
      )}
    </div>
  );
};
