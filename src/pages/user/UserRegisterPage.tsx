import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, UserCheck, Ticket, Users } from 'lucide-react';
import { Event, RegistrationType } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { teamService } from '../../services/teamService';
import { Card, Button, Input, Select, Badge } from '../../components/ui';

export const UserRegisterPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);

  const [registrationType, setRegistrationType] = useState<RegistrationType>('participant');
  const [formData, setFormData] = useState({
    userName: 'Rohan Mehta',
    userEmail: 'rohan.mehta@student.edu',
    userPhone: '+91 99887 76655',
    college: 'UPES Dehradun',
    course: 'B.Tech CSE - Data Science',
    year: '3rd Year',
    studentId: 'SAP-50009123',
    ocDepartment: 'Stage & Technical OC',
    ocResponsibilityPreference: 'Stage Operations & Equipment Management',
  });

  const [submittedRegId, setSubmittedRegId] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      eventService.getEventById(eventId).then((e) => setEvent(e || null));
    }
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventName = event?.name || 'TechFest UPES 2026';

    const created = await registrationService.createRegistration({
      eventId: eventId || 'evt-101',
      eventName,
      ...formData,
      registrationType,
    });

    // If student registered for Organizing Committee (OC Team), add to OC Team Members list!
    if (registrationType === 'oc_team') {
      await teamService.addTeamMember({
        name: formData.userName,
        email: formData.userEmail,
        phone: formData.userPhone,
        department: `${formData.course} (${formData.year})`,
        year: formData.year,
        role: 'Member',
        assignedEventId: eventId || 'evt-101',
        assignedEventName: eventName,
        responsibility: `${formData.ocDepartment} - ${formData.ocResponsibilityPreference}`,
        status: 'active',
      });
    }

    setSubmittedRegId(created.id);
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] p-4 sm:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/user/home')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Events Hub
        </Button>

        {submittedRegId ? (
          /* Registration Ticket State Card */
          <Card className="text-center space-y-4 p-8 border-2 border-emerald-100 bg-emerald-50/30">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {registrationType === 'oc_team' ? 'Organizing Committee Registration Confirmed!' : 'Event Registration Successful!'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {registrationType === 'oc_team'
                  ? `You are registered for the ${formData.ocDepartment}! Your email "${formData.userEmail}" can now log in to the OC Team Portal.`
                  : `Your spot is confirmed for ${event?.name || 'the event'}.`}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Registration Ticket ID</span>
                <span className="font-bold text-purple-700">{submittedRegId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div><span className="text-slate-400">Name:</span> <p className="font-semibold">{formData.userName}</p></div>
                <div><span className="text-slate-400">Registered Email:</span> <p className="font-semibold">{formData.userEmail}</p></div>
                <div><span className="text-slate-400">Registration Type:</span> <p className="font-semibold capitalize">{registrationType === 'oc_team' ? 'OC Team Member' : 'Participant'}</p></div>
                {registrationType === 'oc_team' && (
                  <div><span className="text-slate-400">OC Department:</span> <p className="font-semibold">{formData.ocDepartment}</p></div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => navigate('/user/home')}>
                Return to Events
              </Button>
              {registrationType === 'oc_team' && (
                <Button onClick={() => navigate('/login')}>
                  Log In to OC Team Portal
                </Button>
              )}
            </div>
          </Card>
        ) : (
          /* Registration Form Card */
          <Card className="space-y-4 p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registration Form</h2>
              <p className="text-xs text-slate-500 mt-0.5">{event?.name || 'TechFest UPES 2026'} • {event?.venue}</p>
            </div>

            {/* Registration Type Switcher Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Registration Purpose
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setRegistrationType('participant')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    registrationType === 'participant'
                      ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <Ticket className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Event Participant</h4>
                    <p className="text-[10px] text-slate-500">Attend workshops & competitions</p>
                  </div>
                </div>

                <div
                  onClick={() => setRegistrationType('oc_team')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    registrationType === 'oc_team'
                      ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Organizing Team (OC)</h4>
                    <p className="text-[10px] text-slate-500">Join OC & get team portal access</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
              <Input
                label="Full Name"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="College Email Address"
                  type="email"
                  required
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  helperText={registrationType === 'oc_team' ? 'This email will be authorized to log in to the OC Team Portal' : undefined}
                />
                <Input
                  label="Phone Number"
                  required
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                />
              </div>

              <Input
                label="College Name"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Course / Branch"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
                <Select
                  label="Year"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  options={[
                    { value: '1st Year', label: '1st Year' },
                    { value: '2nd Year', label: '2nd Year' },
                    { value: '3rd Year', label: '3rd Year' },
                    { value: '4th Year', label: '4th Year' },
                  ]}
                />
                <Input
                  label="Student Roll No / SAP ID"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>

              {/* Additional Form Fields for OC Team Application */}
              {registrationType === 'oc_team' && (
                <div className="space-y-3 pt-3 border-t border-purple-100 bg-purple-50/40 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">Organizing Committee Preferences</h4>
                  
                  <Select
                    label="Preferred OC Department"
                    value={formData.ocDepartment}
                    onChange={(e) => setFormData({ ...formData, ocDepartment: e.target.value })}
                    options={[
                      { value: 'Stage & Technical OC', label: 'Stage & Technical OC' },
                      { value: 'Catering & Refreshments OC', label: 'Catering & Refreshments OC' },
                      { value: 'Sound & Audio OC', label: 'Sound & Audio OC' },
                      { value: 'Lighting & Visuals OC', label: 'Lighting & Visuals OC' },
                      { value: 'Photography & Media OC', label: 'Photography & Media OC' },
                      { value: 'Printing & Graphics OC', label: 'Printing & Graphics OC' },
                      { value: 'Security & Crowd Control OC', label: 'Security & Crowd Control OC' },
                    ]}
                  />

                  <Input
                    label="Specific Skill / Experience"
                    value={formData.ocResponsibilityPreference}
                    onChange={(e) => setFormData({ ...formData, ocResponsibilityPreference: e.target.value })}
                    placeholder="e.g. Sound mixing, stage cordination, photography"
                  />
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg">
                  {registrationType === 'oc_team' ? 'Submit OC Team Registration' : 'Confirm Event Registration'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};
