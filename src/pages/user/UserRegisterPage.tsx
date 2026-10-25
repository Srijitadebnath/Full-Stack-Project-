import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Ticket, Calendar, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { Event, User } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { Card, Button, Input, Select, Badge, Alert } from '../../components/ui';
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
                (r) => r.eventId === eventId && r.userEmail.toLowerCase() === loadedUser.email.toLowerCase()
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
    <div className="min-h-screen bg-[#faf9fc] p-4 sm:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/user/home')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Events Hub
        </Button>

        {errorMessage && (
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
        )}

        {submittedTicket ? (
          /* Live Digital Ticket State Card */
          <Card className="text-center space-y-5 p-8 border-2 border-emerald-100 bg-white rounded-3xl shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Seat Confirmed in Cloud Database
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                Event Pass Generated!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your spot for <strong>{submittedTicket.eventName}</strong> is officially booked.
              </p>
            </div>

            {/* Visual Digital Pass */}
            <div className="p-5 bg-gradient-to-br from-purple-700 to-indigo-900 text-white rounded-2xl text-left space-y-3 shadow-md">
              <div className="flex justify-between items-start border-b border-white/20 pb-2">
                <div>
                  <span className="text-[10px] text-purple-200 uppercase font-bold block">Fest Pass</span>
                  <h4 className="text-base font-extrabold">{submittedTicket.eventName}</h4>
                </div>
                <Badge variant="emerald" size="sm">
                  CONFIRMED
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-purple-200 block">Attendee</span>
                  <span className="font-bold">{submittedTicket.userName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-purple-200 block">Student SAP ID</span>
                  <span className="font-mono font-bold">{submittedTicket.studentId}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-mono text-purple-200">
                <span>Pass ID:</span>
                <span className="text-white font-bold">{submittedTicket.id}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={() => navigate('/user/home')} className="rounded-xl px-6 font-bold">
                View in My Applied Events →
              </Button>
            </div>
          </Card>
        ) : (
          /* Live Registration Form Card */
          <Card className="space-y-5 p-6 sm:p-8 bg-white border border-purple-100 rounded-3xl shadow-xl">
            {event && (
              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  {event.category}
                </span>
                <h3 className="text-base font-extrabold text-slate-900">{event.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    {formatDate(event.date)}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-purple-600" />
                    {event.venue}
                  </span>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Student Registration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registering books your seat live in PostgreSQL with atomic capacity protection.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <Input
                  required
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="e.g. Srijita Debnath"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Institutional Email</label>
                  <Input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="name.id@stu.upes.ac.in"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Contact Phone</label>
                  <Input
                    type="tel"
                    required
                    value={formData.userPhone}
                    onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">College / University</label>
                <Input
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Branch / Course</label>
                  <Input
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Academic Year</label>
                  <Select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    options={[
                      { value: '1st Year', label: '1st Year' },
                      { value: '2nd Year', label: '2nd Year' },
                      { value: '3rd Year', label: '3rd Year' },
                      { value: '4th Year', label: '4th Year' },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">SAP ID / Roll No</label>
                  <Input
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="SAP-50001234"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  {submitting ? 'Confirming Seat with PostgreSQL...' : 'Confirm Live Event Registration →'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
