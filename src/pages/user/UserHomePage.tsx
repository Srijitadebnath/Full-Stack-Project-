import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, ArrowRight, Ticket } from 'lucide-react';
import { Event, Registration } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { Card, Badge, Button, Input, Modal } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [selectedAppliedReg, setSelectedAppliedReg] = useState<Registration | null>(null);

  useEffect(() => {
    eventService.getEvents().then(setEvents);
    registrationService.getRegistrations().then(setRegistrations);
  }, []);

  const ongoingEvents = events.filter((e) => e.status === 'ongoing');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const filteredUpcoming = upcomingEvents.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col">
      {/* Top Navigation */}
      <nav className="h-16 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            E
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">Student Event Portal</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          <button onClick={() => navigate('/login')} className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-semibold cursor-pointer">
            Sign In / Sign Out
          </button>
        </div>
      </nav>

      {/* Main Two-Column Layout (Left Panel: Applied Events | Right Main: Ongoing & Upcoming Events) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Panel: Applied / Registered Events Section */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="space-y-3 bg-white p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <Ticket className="w-4 h-4 text-purple-600" />
              <span>My Applied Events</span>
            </div>

            {registrations.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-xs text-slate-400 block">No event registrations yet.</span>
                <p className="text-[11px] text-slate-400">Register for events on the right to see them listed here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedAppliedReg(r)}
                    className="p-3 bg-purple-50/50 hover:bg-purple-100/60 transition-all rounded-xl border border-purple-100/80 space-y-1 text-xs cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{r.eventName}</span>
                      <Badge variant={r.registrationType === 'oc_team' ? 'purple' : 'emerald'} size="sm">
                        {r.registrationType === 'oc_team' ? 'OC Team' : 'Participant'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">Ticket ID: {r.id}</p>
                    <span className="text-[10px] text-purple-700 font-semibold block pt-0.5">
                      Click to view full registration details →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Main Content Area: Ongoing & Upcoming Events */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Ongoing Events Section */}
          {ongoingEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">Live & Ongoing Events</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingEvents.map((evt) => (
                  <Card key={evt.id} className="border-l-4 border-l-emerald-500 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="emerald" dot>Live Now</Badge>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{evt.name}</h3>
                      </div>
                      <span className="text-xs text-slate-400">{evt.category}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                    <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-600" /><span>{formatDate(evt.date)} ({evt.startTime})</span></div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-600" /><span>{evt.venue}</span></div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button size="sm" onClick={() => navigate(`/user/events/${evt.id}`)}>
                        View Details & Register
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">Upcoming Campus Events</h2>
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredUpcoming.map((evt) => (
                <Card key={evt.id} className="overflow-hidden p-0 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="relative h-40 w-full bg-slate-100">
                    <img src={evt.image} alt={evt.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <Badge variant="purple" dot>Upcoming</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 bg-slate-900/70 text-white text-[10px] font-medium rounded-md">
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{evt.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-600" /><span>{formatDate(evt.date)} ({evt.startTime})</span></div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-600" /><span>{evt.venue}</span></div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{evt.registrationCount} / {evt.capacity} seats</span>
                    <Button size="sm" onClick={() => navigate(`/user/events/${evt.id}`)} icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Register Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applied Event Registration Details Modal */}
      {selectedAppliedReg && (
        <Modal
          isOpen={!!selectedAppliedReg}
          onClose={() => setSelectedAppliedReg(null)}
          title="Applied Registration Information"
          subtitle="Full record of your registered details for this campus event."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-purple-50 text-purple-900 rounded-xl space-y-1 border border-purple-100">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Ticket Details</span>
                <Badge variant={selectedAppliedReg.registrationType === 'oc_team' ? 'purple' : 'emerald'}>
                  {selectedAppliedReg.registrationType === 'oc_team' ? 'OC Team Member' : 'Participant Ticket'}
                </Badge>
              </div>
              <h4 className="text-base font-bold">{selectedAppliedReg.eventName}</h4>
              <p className="text-[11px] text-purple-700">Ticket ID: {selectedAppliedReg.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-400 block text-[10px]">Registered Name</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.userName}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Student Roll No / SAP ID</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.studentId}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Registered Email</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.userEmail}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.userPhone}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">College Institution</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.college}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Course & Year</span>
                <p className="font-semibold text-slate-800">{selectedAppliedReg.course} ({selectedAppliedReg.year})</p>
              </div>
            </div>

            {selectedAppliedReg.registrationType === 'oc_team' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Organizing Committee Details</span>
                <p className="font-bold text-purple-700">Department: {selectedAppliedReg.ocDepartment}</p>
                <p className="text-slate-600">Preference: {selectedAppliedReg.ocResponsibilityPreference}</p>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-100">
              <span>Date Submitted: {formatDate(selectedAppliedReg.registrationDate)}</span>
              <span className="text-emerald-600 font-semibold">Status: Confirmed</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
