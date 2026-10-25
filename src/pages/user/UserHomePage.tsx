import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Search, Ticket, Users, Clock, AlertCircle, LogOut, UserCheck, Shield, Sparkles, KeyRound, CheckCircle2, Lock } from 'lucide-react';
import { Event, Registration, User } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { teamService, StudentOcStatus } from '../../services/teamService';
import { Card, Badge, Button, Input, Modal, Select, Alert } from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const UserHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedAppliedReg, setSelectedAppliedReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Student OC Status & In-App Activation
  const [studentOcStatus, setStudentOcStatus] = useState<StudentOcStatus | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [newOcPassword, setNewOcPassword] = useState('');
  const [confirmOcPassword, setConfirmOcPassword] = useState('');
  const [activateLoading, setActivateLoading] = useState(false);
  const [activateSuccess, setActivateSuccess] = useState<string | null>(null);
  const [activateError, setActivateError] = useState<string | null>(null);

  // Volunteer Application Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyEventId, setApplyEventId] = useState('');
  const [applyDepartment, setApplyDepartment] = useState('Stage & Technical Operations');
  const [applyReason, setApplyReason] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const u = await authService.getCurrentUser();
      setCurrentUser(u);
      if (u?.email) {
        try {
          const ocStat = await teamService.getStudentOcStatus(u.email);
          setStudentOcStatus(ocStat);
        } catch {
          // No OC record or backend not ready
        }
      }
    } catch {
      // not logged in
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const loadedUser = await authService.getCurrentUser();
        setCurrentUser(loadedUser);

        const [loadedEvents, loadedRegs] = await Promise.all([
          eventService.getEvents(),
          loadedUser?.email ? registrationService.getRegistrations(loadedUser.email) : Promise.resolve([]),
        ]);
        setEvents(loadedEvents);
        if (loadedEvents.length > 0) setApplyEventId(loadedEvents[0].id);

        if (loadedUser?.email) {
          setRegistrations(loadedRegs);
          setApplyPhone(loadedUser.phone || '');

          try {
            const ocStat = await teamService.getStudentOcStatus(loadedUser.email);
            setStudentOcStatus(ocStat);
          } catch {
            // No OC status
          }
        } else {
          setRegistrations([]);
        }
      } catch (err) {
        console.error("Failed to load campus events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    setRegistrations([]);
    setStudentOcStatus(null);
    navigate('/login');
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setApplyError(null);
    setApplyMessage(null);
    setApplyLoading(true);

    try {
      const res = await teamService.applyForOc({
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_phone: applyPhone || currentUser.phone,
        event_id: applyEventId,
        department: applyDepartment,
        responsibility_preference: applyReason,
        course: currentUser.department || 'Computer Science',
      });
      setApplyMessage(res.message);
      await fetchUserData();
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError(null);
    setActivateSuccess(null);

    if (newOcPassword !== confirmOcPassword) {
      setActivateError('Passwords do not match.');
      return;
    }
    if (newOcPassword.length < 8) {
      setActivateError('Password must be at least 8 characters long.');
      return;
    }

    if (!studentOcStatus?.activation_token) {
      setActivateError('Missing activation token.');
      return;
    }

    setActivateLoading(true);
    try {
      await teamService.activateOcAccount(studentOcStatus.activation_token, newOcPassword);
      setActivateSuccess(`🎉 Official OC Account (${studentOcStatus.official_email}) successfully activated! You can now log into the OC portal.`);
      await fetchUserData();
    } catch (err: unknown) {
      setActivateError(err instanceof Error ? err.message : 'Failed to activate account');
    } finally {
      setActivateLoading(false);
    }
  };

  // Filter events safely with case-insensitivity
  const ongoingEvents = events.filter((e) => e.status?.toLowerCase() === 'ongoing');
  const upcomingEvents = events.filter((e) => e.status?.toLowerCase() === 'upcoming');

  const filteredUpcoming = upcomingEvents.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                          e.description.toLowerCase().includes(search.toLowerCase()) ||
                          e.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || e.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'Technology', 'Cultural', 'Hackathon', 'Sports'];

  return (
    <div className="min-h-screen bg-[#faf9fc] flex flex-col font-sans">
      
      {/* Top Campus Navigation */}
      <nav className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-purple-600/20">
            U
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block">UPES Fest Operations</span>
            <span className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider block">Student Discovery Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Jump to Admin or OC Portal if authorized */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Console →</span>
                </button>
              )}
              {currentUser.role === 'team' && (
                <button
                  onClick={() => navigate('/vendor/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>OC Work Desk →</span>
                </button>
              )}

              {/* User Identity Chip */}
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-purple-600 font-medium capitalize block">{currentUser.role === 'user' ? 'Student' : currentUser.role}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all cursor-pointer shadow-md shadow-purple-600/20"
            >
              Portal Sign In →
            </button>
          )}
        </div>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Panel: Applied Events Drawer */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="space-y-3 bg-white p-5 border border-purple-50 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              <Ticket className="w-4 h-4 text-purple-600" />
              <span>My Applied Events</span>
            </div>

            {!currentUser ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-xs text-slate-500 font-medium block">Not signed in</span>
                <p className="text-[11px] text-slate-400">
                  Sign in with your student email to view your registered event tickets and passes.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-2 text-xs font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                >
                  Sign In Now
                </button>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-xs text-slate-400 font-medium block">No registrations yet.</span>
                <p className="text-[11px] text-slate-400">
                  Register for an upcoming fest on the right to receive your digital ticket!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {registrations.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedAppliedReg(r)}
                    className="p-3 bg-purple-50/50 hover:bg-purple-100/60 transition-all rounded-xl border border-purple-100/70 space-y-1 text-xs cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 truncate">{r.eventName}</span>
                      <Badge variant="purple" size="sm">
                        Ticket
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">Ticket: {r.id}</p>
                    <span className="text-[10px] text-purple-700 font-semibold block pt-0.5">
                      View full ticket & badge →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Organizing Committee (OC) Dynamic Status Card */}
          {studentOcStatus?.status === 'APPROVED' && studentOcStatus.oc_status === 'PENDING_ACTIVATION' ? (
            <Card className="p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl shadow-lg space-y-3 border-2 border-emerald-300/40 animate-pulse">
              <div className="flex items-center gap-2 text-emerald-200 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>🎉 OC Application Approved!</span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed">
                Faculty Admin Dr. Rajesh Sharma has approved you for <strong>{studentOcStatus.event_name}</strong>!
              </p>
              <div className="p-2.5 bg-black/20 rounded-xl text-xs space-y-0.5">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Your Official OC Handle:</span>
                <span className="font-mono font-bold text-white block">{studentOcStatus.official_email}</span>
              </div>
              <Button
                onClick={() => {
                  setNewOcPassword('');
                  setConfirmOcPassword('');
                  setActivateError(null);
                  setActivateSuccess(null);
                  setIsActivateModalOpen(true);
                }}
                className="w-full py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Set Password & Activate Now →</span>
              </Button>
            </Card>
          ) : studentOcStatus?.status === 'APPROVED' && studentOcStatus.oc_status === 'ACTIVE' ? (
            <Card className="p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Active OC Team Member</span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed">
                You are registered as an official Organizing Committee member for <strong>{studentOcStatus.event_name}</strong>.
              </p>
              <div className="p-2 bg-purple-950/60 rounded-xl text-xs">
                <span className="text-[10px] text-purple-300 block font-bold">OC Handle:</span>
                <span className="font-mono text-purple-100 font-bold">{studentOcStatus.official_email}</span>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Sign In to OC Portal →
              </Button>
            </Card>
          ) : studentOcStatus?.status === 'PENDING' ? (
            <Card className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>OC Application Under Review</span>
              </div>
              <p className="text-amber-900 text-xs leading-relaxed">
                Your volunteer application for <strong>{studentOcStatus.event_name}</strong> ({studentOcStatus.department}) is currently being reviewed by Faculty Admin Dr. Rajesh Sharma.
              </p>
              <span className="text-[10px] text-amber-700 block">
                Once approved, your official OC handle and activation link will appear right here!
              </span>
            </Card>
          ) : (
            <Card className="p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Join Fest OC Team</span>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed">
                Want to manage events, lead technical stages, or coordinate guest artists? Volunteer for the UPES Fest Committee!
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/login');
                    } else {
                      setApplyMessage(null);
                      setApplyError(null);
                      setIsApplyModalOpen(true);
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Volunteer for OC Team →
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Main Content Area: Campus Events */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Ongoing Events */}
          {ongoingEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Live & Ongoing Campus Fests</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingEvents.map((evt) => (
                  <Card key={evt.id} className="border-l-4 border-l-emerald-500 space-y-3 p-5 rounded-2xl bg-white shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="emerald" dot>Live Now</Badge>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{evt.name}</h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{evt.category}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                    
                    <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-600" /><span>{formatDate(evt.date)} ({evt.startTime})</span></div>
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-purple-600" /><span>{evt.venue}</span></div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button size="sm" onClick={() => navigate(`/user/events/${evt.id}`)}>
                        Enter Live Fest Portal
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events Section with Filters & Search */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Upcoming Campus Events</h2>
                <p className="text-xs text-slate-500">Live data synchronized with UPES Student Affairs database</p>
              </div>

              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search events, venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading live campus events from PostgreSQL...</p>
              </div>
            ) : filteredUpcoming.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 space-y-2 p-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No events matched your search</h3>
                <p className="text-xs text-slate-400">Try adjusting your category filter or keyword.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUpcoming.map((evt) => {
                  const remainingSeats = evt.capacity - evt.registrationCount;
                  const isFull = remainingSeats <= 0;

                  return (
                    <Card key={evt.id} className="overflow-hidden p-0 flex flex-col justify-between hover:shadow-lg transition-all rounded-2xl border border-purple-50 bg-white">
                      
                      {/* Image Header with Badges */}
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img 
                          src={evt.image} 
                          alt={evt.name} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <Badge variant={isFull ? 'rose' : 'purple'} dot>
                            {isFull ? 'Sold Out' : 'Open'}
                          </Badge>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-xs">
                            {evt.category}
                          </span>
                        </div>
                      </div>

                      {/* Event Body Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">{evt.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{evt.description}</p>
                        </div>

                        {/* Event Metadata Cards */}
                        <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-medium">{formatDate(evt.date)} ({evt.startTime})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-medium truncate">{evt.venue}</span>
                          </div>
                        </div>

                        {/* Real-time Seat Capacity Tracker */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Available Capacity
                            </span>
                            <span className={`text-xs font-extrabold ${isFull ? 'text-rose-600' : 'text-purple-700'}`}>
                              {isFull ? 'Fully Booked' : `${remainingSeats} spots remaining`}
                            </span>
                          </div>

                          {registrations.some((r) => r.eventId === evt.id) ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const reg = registrations.find((r) => r.eventId === evt.id);
                                if (reg) setSelectedAppliedReg(reg);
                              }}
                              className="rounded-xl px-3 font-bold border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
                            >
                              ✓ Already Registered
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              disabled={isFull}
                              onClick={() => navigate(`/user/register/${evt.id}`)}
                              className="rounded-xl px-4 font-bold cursor-pointer"
                            >
                              {isFull ? 'Closed' : 'Register Now →'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedAppliedReg && (
        <Modal
          isOpen={!!selectedAppliedReg}
          onClose={() => setSelectedAppliedReg(null)}
          title="Digital Fest Ticket & Badge"
        >
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl shadow-md space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 block">Event Name</span>
                  <h4 className="text-base font-extrabold">{selectedAppliedReg.eventName}</h4>
                </div>
                <Badge variant="purple" size="sm" className="bg-white/20 text-white border-0">
                  {selectedAppliedReg.status || 'CONFIRMED'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/20">
                <div>
                  <span className="opacity-80 block text-[10px]">Attendee</span>
                  <span className="font-bold">{selectedAppliedReg.userName}</span>
                </div>
                <div>
                  <span className="opacity-80 block text-[10px]">Registration Type</span>
                  <span className="font-bold">
                    {selectedAppliedReg.registrationType === 'oc_team' ? 'Organizing Committee' : 'Participant'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-mono">
                <span>SAP ID: {selectedAppliedReg.studentId}</span>
                <span>Ticket: {selectedAppliedReg.id}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button size="sm" onClick={() => setSelectedAppliedReg(null)}>
                Close Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Volunteer Application Modal */}
      {isApplyModalOpen && (
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Fest Organizing Committee"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Submit your application to Faculty Admin Dr. Rajesh Sharma. Once approved, an official UPES OC handle will be issued to you!
            </p>

            {applyMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{applyMessage}</span>
              </div>
            )}

            {applyError && (
              <Alert type="error" message={applyError} onClose={() => setApplyError(null)} />
            )}

            {!applyMessage ? (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Select Fest / Event</label>
                  <Select
                    value={applyEventId}
                    onChange={(e) => setApplyEventId(e.target.value)}
                    options={events.map((evt) => ({ value: evt.id, label: `${evt.name} (${evt.category})` }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Preferred Department</label>
                  <Select
                    value={applyDepartment}
                    onChange={(e) => setApplyDepartment(e.target.value)}
                    options={[
                      { value: 'Stage & Technical Operations', label: 'Stage & Technical Operations' },
                      { value: 'Guest Relations & Hospitality', label: 'Guest Relations & Hospitality' },
                      { value: 'Logistics & Venue Operations', label: 'Logistics & Venue Operations' },
                      { value: 'Media, PR & Promotions', label: 'Media, PR & Promotions' },
                      { value: 'Sponsorship & Finance', label: 'Sponsorship & Finance' },
                    ]}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Contact Phone Number</label>
                  <Input
                    type="tel"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Statement / Experience</label>
                  <Input
                    type="text"
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    placeholder="Briefly state your interest (e.g. Led technical crew in 2nd year)"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={applyLoading}>
                    {applyLoading ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={() => setIsApplyModalOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Set OC Password & Activate Modal */}
      {isActivateModalOpen && (
        <Modal
          isOpen={isActivateModalOpen}
          onClose={() => setIsActivateModalOpen(false)}
          title="Activate Your Official OC Account"
        >
          <div className="space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs space-y-1">
              <span className="font-bold text-purple-900 block">Official Handle Approved:</span>
              <span className="font-mono font-bold text-purple-700 text-sm block">
                {studentOcStatus?.official_email}
              </span>
              <p className="text-[11px] text-purple-600 pt-1">
                Set your secure password below. Once saved into the database, you can log in directly at the 
                <strong> OC Member</strong> portal desk!
              </p>
            </div>

            {activateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{activateSuccess}</span>
              </div>
            )}

            {activateError && (
              <Alert type="error" message={activateError} onClose={() => setActivateError(null)} />
            )}

            {!activateSuccess ? (
              <form onSubmit={handleActivateSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Create OC Password</label>
                  <Input
                    type="password"
                    value={newOcPassword}
                    onChange={(e) => setNewOcPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    icon={<Lock className="w-4 h-4 text-purple-600" />}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Confirm OC Password</label>
                  <Input
                    type="password"
                    value={confirmOcPassword}
                    onChange={(e) => setConfirmOcPassword(e.target.value)}
                    placeholder="Repeat password"
                    icon={<Lock className="w-4 h-4 text-purple-600" />}
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsActivateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={activateLoading}>
                    {activateLoading ? 'Activating in PostgreSQL...' : 'Activate Account & Set Password'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="pt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setIsActivateModalOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In as OC Member Now →
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
