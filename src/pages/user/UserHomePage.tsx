import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Search,
  Ticket,
  Users,
  Clock,
  AlertCircle,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { Event, Registration, User } from '../../types';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { authService } from '../../services/authService';
import { teamService, StudentOcStatus } from '../../services/teamService';
import {
  GlassCard,
  StatCard,
  PillButton,
  Chip,
  GlassInput,
  Modal,
} from '../../components/ui';
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

  // Redirect admin/team away from student view immediately
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (currentUser?.role === 'team') {
      navigate('/vendor/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const loadedUser = await authService.getCurrentUser();
        setCurrentUser(loadedUser);

        if (loadedUser?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        } else if (loadedUser?.role === 'team') {
          navigate('/vendor/dashboard', { replace: true });
          return;
        }

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
        console.error('Failed to load campus events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email || !applyEventId) return;

    setApplyLoading(true);
    setApplyMessage(null);
    setApplyError(null);

    try {
      const res = await teamService.applyForOc({
        event_id: applyEventId,
        user_name: currentUser.name,
        user_email: currentUser.email,
        user_phone: applyPhone,
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
      setActivateSuccess(
        `🎉 Official OC Account (${studentOcStatus.official_email}) successfully activated! You can now log into the OC portal.`
      );
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
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || e.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'Technology', 'Cultural', 'Hackathon', 'Sports'];

  const studentFirstName = currentUser?.name
    ? currentUser.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').trim().split(' ')[0]
    : '';

  return (
    <div className="flex flex-col font-sans">
      {/* Student Dashboard Overview Header & Stats */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
              {currentUser ? `Welcome back, ${studentFirstName || 'Student'} 👋` : 'UPES Campus Fest Discovery'}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted,#8B87A3)] mt-0.5">
              Discover UPES campus events, manage your digital QR entry passes, or explore committee roles.
            </p>
          </div>
          {currentUser && (
            <PillButton
              variant="glass"
              size="sm"
              onClick={() => navigate('/user/profile')}
              className="self-start sm:self-auto"
            >
              My Student Profile
            </PillButton>
          )}
        </div>

        {/* 3-Column Glass Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Upcoming Events"
            value={upcomingEvents.length + ongoingEvents.length}
            icon={<Calendar className="w-5 h-5 text-purple-600" />}
            trend={{ value: 'Scheduled ahead', type: 'up' }}
          />

          <div onClick={() => navigate('/user/my-events')} className="cursor-pointer">
            <StatCard
              label="My Active Passes"
              value={currentUser ? registrations.length : 'Sign In'}
              icon={<Ticket className="w-5 h-5 text-purple-600" />}
              trend={{
                value: currentUser ? `${registrations.length} tickets confirmed` : 'Tap to sign in',
                type: 'neutral',
              }}
            />
          </div>

          <StatCard
            label="OC Volunteer Status"
            value={
              studentOcStatus?.status === 'APPROVED'
                ? studentOcStatus.oc_status === 'ACTIVE'
                  ? 'Active OC Member'
                  : 'Approved'
                : studentOcStatus?.status === 'PENDING'
                ? 'Under Review'
                : 'Open'
            }
            icon={<Users className="w-5 h-5 text-purple-600" />}
            trend={{
              value:
                studentOcStatus?.status === 'APPROVED'
                  ? 'Ready to activate'
                  : studentOcStatus?.status === 'PENDING'
                  ? 'Under review'
                  : 'Open for apps',
              type: 'up',
            }}
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6">
        {/* Left Panel: Applied Events & OC Opportunities */}
        <div className="lg:col-span-1 space-y-5">
          {/* Applied Events Drawer */}
          <GlassCard className="p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(124,58,237,0.08)]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg neo-raised flex items-center justify-center text-purple-600">
                  <Ticket className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] uppercase tracking-wider">
                  My Passes
                </span>
              </div>
              {registrations.length > 0 && (
                <Chip variant="purple" size="sm">
                  {registrations.length}
                </Chip>
              )}
            </div>

            {!currentUser ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-xs text-[var(--color-text-muted,#8B87A3)] font-medium block">
                  Not signed in
                </span>
                <p className="text-[11px] text-[var(--color-text-muted,#8B87A3)]">
                  Sign in with your student email to view your registered event tickets and passes.
                </p>
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="mt-2 text-xs"
                >
                  Sign In Now
                </PillButton>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-6 space-y-1.5">
                <span className="text-xs text-[var(--color-text-muted,#8B87A3)] font-medium block">
                  No registrations yet
                </span>
                <p className="text-[11px] text-[var(--color-text-muted,#8B87A3)]">
                  Register for an upcoming fest on the right to receive your instant digital ticket!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {registrations.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedAppliedReg(r)}
                    className="p-3 bg-white/70 hover:bg-white/95 transition-all rounded-2xl border border-white/80 neo-raised cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-[var(--color-text-heading,#1E1B2E)] truncate">
                        {r.eventName}
                      </span>
                      <Chip variant="purple" size="sm">
                        Pass
                      </Chip>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted,#8B87A3)] font-mono">
                      Ticket #{r.id.slice(0, 8)}
                    </p>
                    <span className="text-[10px] text-purple-700 font-bold block pt-0.5">
                      View QR badge →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Organizing Committee (OC) Dynamic Status Card */}
          {studentOcStatus?.status === 'APPROVED' && studentOcStatus.oc_status === 'PENDING_ACTIVATION' ? (
            <GlassCard className="p-5 bg-gradient-to-br from-emerald-600/90 to-teal-800/95 text-white border border-emerald-300/40 space-y-3 shadow-[0_12px_32px_rgba(16,185,129,0.25)]">
              <div className="flex items-center gap-2 text-emerald-200 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>🎉 OC Application Approved!</span>
              </div>
              <p className="text-xs text-emerald-50 leading-relaxed">
                Faculty Admin Dr. Rajesh Sharma has approved your role for <strong>{studentOcStatus.event_name}</strong>!
              </p>
              <div className="p-2.5 bg-black/20 backdrop-blur-md rounded-xl text-xs space-y-0.5">
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Your Official OC Handle:</span>
                <span className="font-mono font-bold text-white block">{studentOcStatus.official_email}</span>
              </div>
              <PillButton
                variant="glass"
                size="sm"
                onClick={() => {
                  setNewOcPassword('');
                  setConfirmOcPassword('');
                  setActivateError(null);
                  setActivateSuccess(null);
                  setIsActivateModalOpen(true);
                }}
                className="w-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold"
              >
                <KeyRound className="w-4 h-4 text-emerald-600 mr-1.5" />
                <span>Set Password & Activate</span>
              </PillButton>
            </GlassCard>
          ) : studentOcStatus?.status === 'APPROVED' && studentOcStatus.oc_status === 'ACTIVE' ? (
            <GlassCard dark className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Active OC Team Member</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are registered as an official Organizing Committee member for <strong>{studentOcStatus.event_name}</strong>.
              </p>
              <div className="p-2.5 bg-white/5 rounded-xl text-xs border border-white/10">
                <span className="text-[10px] text-purple-300 block font-bold">OC Handle:</span>
                <span className="font-mono text-purple-100 font-bold">{studentOcStatus.official_email}</span>
              </div>
              <PillButton
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Sign In to OC Portal →
              </PillButton>
            </GlassCard>
          ) : studentOcStatus?.status === 'PENDING' ? (
            <GlassCard className="p-5 space-y-2 border border-amber-200/80 bg-amber-50/60">
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
            </GlassCard>
          ) : (
            <GlassCard dark className="p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Join Fest OC Team</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Want to manage events, lead technical stages, or coordinate guest artists? Volunteer for the UPES Fest Committee!
              </p>
              <div className="pt-1">
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!currentUser) {
                      navigate('/login');
                    } else {
                      setApplyMessage(null);
                      setApplyError(null);
                      setIsApplyModalOpen(true);
                    }
                  }}
                  className="w-full"
                >
                  Volunteer for OC Team →
                </PillButton>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Main Content Area: Campus Events */}
        <div className="lg:col-span-3 space-y-6">
          {/* Ongoing Events */}
          {ongoingEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
                  Live &amp; Ongoing Campus Fests
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingEvents.map((evt) => (
                  <GlassCard key={evt.id} lift className="space-y-3 p-5 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <Chip variant="success" dot size="sm">
                          Live Now
                        </Chip>
                        <h3 className="text-base font-bold text-[var(--color-text-heading,#1E1B2E)] mt-1.5">
                          {evt.name}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-text-muted,#8B87A3)]">
                        {evt.category}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-body,#4B4763)] line-clamp-2">
                      {evt.description}
                    </p>

                    <div className="text-xs text-[var(--color-text-muted,#8B87A3)] space-y-1.5 p-3 rounded-2xl neo-inset">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>
                          {formatDate(evt.date)} ({evt.startTime})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <PillButton
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/user/events/${evt.id}`)}
                      >
                        Enter Live Fest Portal
                      </PillButton>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events Section with Filters & Search */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
                  Upcoming Campus Events
                </h2>
                <p className="text-xs text-[var(--color-text-muted,#8B87A3)]">
                  Live data synchronized with UPES Student Affairs database
                </p>
              </div>

              <div className="w-full sm:w-72">
                <GlassInput
                  placeholder="Search events, venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="w-4 h-4 text-[#8B87A3]" />}
                />
              </div>
            </div>

            {/* Category Filter Pills (Neumorphic Inset Strip with Raised Active Pill) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-bold transition-all duration-200 cursor-pointer whitespace-nowrap text-xs ${
                      isActive
                        ? 'btn-primary'
                        : 'bg-white/70 hover:bg-white/95 text-[var(--color-text-body,#4B4763)] border border-white/80 neo-raised'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-[var(--color-text-muted,#8B87A3)]">
                  Loading live campus events from PostgreSQL...
                </p>
              </div>
            ) : filteredUpcoming.length === 0 ? (
              <GlassCard className="py-16 text-center space-y-2 p-6">
                <AlertCircle className="w-8 h-8 text-[var(--color-text-muted,#8B87A3)] mx-auto" />
                <h3 className="text-sm font-bold text-[var(--color-text-heading,#1E1B2E)]">
                  No events matched your search
                </h3>
                <p className="text-xs text-[var(--color-text-muted,#8B87A3)]">
                  Try adjusting your category filter or keyword.
                </p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUpcoming.map((evt) => {
                  const remainingSeats = evt.capacity - evt.registrationCount;
                  const isFull = remainingSeats <= 0;

                  return (
                    <GlassCard
                      key={evt.id}
                      lift
                      className="overflow-hidden p-0 flex flex-col justify-between rounded-3xl"
                    >
                      {/* Image Header with Frosted Badges */}
                      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={evt.image}
                          alt={evt.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <Chip variant={isFull ? 'danger' : 'purple'} dot size="sm">
                            {isFull ? 'Sold Out' : 'Open'}
                          </Chip>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold rounded-full shadow-xs">
                            {evt.category}
                          </span>
                        </div>
                      </div>

                      {/* Event Body Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-extrabold text-[var(--color-text-heading,#1E1B2E)] leading-snug">
                            {evt.name}
                          </h3>
                          <p className="text-xs text-[var(--color-text-body,#4B4763)] line-clamp-2 leading-relaxed">
                            {evt.description}
                          </p>
                        </div>

                        {/* Event Metadata (Neumorphic Inset Box) */}
                        <div className="space-y-1.5 text-xs text-[var(--color-text-body,#4B4763)] p-3 rounded-2xl neo-inset">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-medium">
                              {formatDate(evt.date)} ({evt.startTime})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="font-medium truncate">{evt.venue}</span>
                          </div>
                        </div>

                        {/* Seat Capacity Tracker & Actions */}
                        <div className="pt-3 border-t border-[rgba(124,58,237,0.08)] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[var(--color-text-muted,#8B87A3)] uppercase tracking-wider block">
                              Available Capacity
                            </span>
                            <span
                              className={`text-xs font-extrabold ${
                                isFull ? 'text-rose-600' : 'text-purple-700'
                              }`}
                            >
                              {isFull ? 'Fully Booked' : `${remainingSeats} spots remaining`}
                            </span>
                          </div>

                          {registrations.some((r) => r.eventId === evt.id) ? (
                            <PillButton
                              size="sm"
                              variant="glass"
                              onClick={() => {
                                const reg = registrations.find((r) => r.eventId === evt.id);
                                if (reg) setSelectedAppliedReg(reg);
                              }}
                              className="text-emerald-700 font-bold border-emerald-300"
                            >
                              ✓ Registered Pass
                            </PillButton>
                          ) : (
                            <PillButton
                              size="sm"
                              variant="primary"
                              disabled={isFull}
                              onClick={() => navigate(`/user/register/${evt.id}`)}
                            >
                              {isFull ? 'Closed' : 'Register Now →'}
                            </PillButton>
                          )}
                        </div>
                      </div>
                    </GlassCard>
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
            <GlassCard dark className="p-5 text-white space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase opacity-75 block">
                    Campus Event
                  </span>
                  <h4 className="text-lg font-extrabold">{selectedAppliedReg.eventName}</h4>
                </div>
                <Chip variant="purple" size="sm">
                  {selectedAppliedReg.status || 'CONFIRMED'}
                </Chip>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-white/10">
                <div>
                  <span className="opacity-75 block text-[10px]">Attendee</span>
                  <span className="font-bold">{selectedAppliedReg.userName}</span>
                </div>
                <div>
                  <span className="opacity-75 block text-[10px]">Registration Type</span>
                  <span className="font-bold">
                    {selectedAppliedReg.registrationType === 'oc_team'
                      ? 'Organizing Committee'
                      : 'Participant Pass'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono opacity-80">
                <span>SAP ID: {selectedAppliedReg.studentId}</span>
                <span>Ticket: #{selectedAppliedReg.id.slice(0, 8)}</span>
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <PillButton variant="glass" size="sm" onClick={() => setSelectedAppliedReg(null)}>
                Close Ticket
              </PillButton>
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
            <p className="text-xs text-[var(--color-text-body,#4B4763)]">
              Submit your application to Faculty Admin Dr. Rajesh Sharma. Once approved, an official UPES OC handle will be issued to you!
            </p>

            {applyMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{applyMessage}</span>
              </div>
            )}

            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {!applyMessage ? (
              <form onSubmit={handleApplySubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Select Fest / Event
                  </label>
                  <select
                    value={applyEventId}
                    onChange={(e) => setApplyEventId(e.target.value)}
                    className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name} ({evt.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Preferred Department
                  </label>
                  <select
                    value={applyDepartment}
                    onChange={(e) => setApplyDepartment(e.target.value)}
                    className="w-full neo-inset rounded-2xl px-4 py-2.5 text-xs text-[var(--color-text-heading,#1E1B2E)] bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="Stage & Technical Operations">Stage &amp; Technical Operations</option>
                    <option value="Guest Relations & Hospitality">Guest Relations &amp; Hospitality</option>
                    <option value="Logistics & Venue Operations">Logistics &amp; Venue Operations</option>
                    <option value="Media, PR & Promotions">Media, PR &amp; Promotions</option>
                    <option value="Sponsorship & Finance">Sponsorship &amp; Finance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Contact Phone Number
                  </label>
                  <GlassInput
                    type="tel"
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Statement / Experience
                  </label>
                  <GlassInput
                    type="text"
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    placeholder="Briefly state your interest (e.g. Led technical crew in 2nd year)"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <PillButton
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    Cancel
                  </PillButton>
                  <PillButton type="submit" variant="primary" size="sm" loading={applyLoading}>
                    Submit Application
                  </PillButton>
                </div>
              </form>
            ) : (
              <div className="pt-2 flex justify-end">
                <PillButton variant="primary" size="sm" onClick={() => setIsApplyModalOpen(false)}>
                  Done
                </PillButton>
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
            <div className="p-3.5 bg-purple-50/80 border border-purple-100 rounded-2xl text-xs space-y-1">
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{activateSuccess}</span>
              </div>
            )}

            {activateError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{activateError}</span>
              </div>
            )}

            {!activateSuccess ? (
              <form onSubmit={handleActivateSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Create OC Password
                  </label>
                  <GlassInput
                    type="password"
                    value={newOcPassword}
                    onChange={(e) => setNewOcPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    icon={<Lock className="w-4 h-4 text-purple-600" />}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text-heading,#1E1B2E)] block">
                    Confirm OC Password
                  </label>
                  <GlassInput
                    type="password"
                    value={confirmOcPassword}
                    onChange={(e) => setConfirmOcPassword(e.target.value)}
                    placeholder="Repeat password"
                    icon={<Lock className="w-4 h-4 text-purple-600" />}
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <PillButton
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => setIsActivateModalOpen(false)}
                  >
                    Cancel
                  </PillButton>
                  <PillButton type="submit" variant="primary" size="sm" loading={activateLoading}>
                    Activate Account
                  </PillButton>
                </div>
              </form>
            ) : (
              <div className="pt-2 flex justify-end gap-2">
                <PillButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsActivateModalOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In as OC Member Now →
                </PillButton>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
