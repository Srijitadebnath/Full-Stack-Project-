import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Ticket,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  IdCard,
  LogIn,
} from 'lucide-react';
import { Registration, User } from '../../types';
import { authService } from '../../services/authService';
import { registrationService } from '../../services/registrationService';
import { teamService, StudentOcStatus } from '../../services/teamService';
import { Avatar, Badge, Button, Card } from '../../components/ui';

/**
 * Extracts numeric SAP ID from UPES student email pattern (firstname.sapid@stu.upes.ac.in).
 */
function extractSapId(email?: string): string {
  if (!email) return 'Not Assigned';
  const prefix = email.split('@')[0] || '';
  const parts = prefix.split('.');
  const sapCandidate = parts.find((p) => /^\d+$/.test(p));
  return sapCandidate || 'UPES-STUDENT';
}

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [ocStatus, setOcStatus] = useState<StudentOcStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const current = await authService.getCurrentUser();
        setUser(current);

        if (current?.email) {
          const [regs, ocStat] = await Promise.all([
            registrationService.getRegistrations(current.email).catch(() => []),
            teamService.getStudentOcStatus(current.email).catch(() => null),
          ]);
          setRegistrations(regs);
          setOcStatus(ocStat);
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 sm:p-8 text-center text-xs text-slate-400">
        Loading your UPES student profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <Card className="p-8 text-center space-y-4 border border-purple-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Sign In to View Student Profile</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sign in with your official UPES student email (<span className="font-mono">firstname.sapid@stu.upes.ac.in</span>) to view your academic badge, digital event passes, and OC volunteer status.
          </p>
          <Button onClick={() => navigate('/login')} icon={<LogIn className="w-4 h-4" />}>
            Sign In to Student Portal
          </Button>
        </Card>
      </div>
    );
  }

  const sapId = extractSapId(user.email);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Student Profile &amp; Campus Identity
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your verified EVENTRA account details, active event passes, and committee onboarding status.
        </p>
      </div>

      {/* Top Banner Profile Card */}
      <Card className="p-6 border border-purple-100 bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} src={user.avatar} size="lg" status="online" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <Badge variant="purple" dot>
                  {user.role === 'admin' ? 'Faculty Admin' : user.role === 'team' ? 'OC Member' : 'UPES Student'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {user.department || 'School of Computer Science'}
              </p>
              <p className="text-xs text-purple-700 font-semibold mt-0.5">
                {user.college || 'UPES Dehradun'} • SAP ID: <span className="font-mono">{sapId}</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/user/home')}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>

      {/* Two-Column Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Institutional Identity & Contact */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Institutional Details</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Official Student Email</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <IdCard className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">University SAP ID</span>
                <span className="font-mono font-semibold text-slate-800">{sapId}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">Registered Phone</span>
                <span className="font-semibold text-slate-800">{user.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px]">School &amp; Campus</span>
                <span className="font-semibold text-slate-800">
                  {user.department || 'School of Computer Science'} • {user.college || 'UPES Dehradun'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Passes & Committee Summary */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-purple-600" />
            <span>Fest Participation &amp; OC Status</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-700 font-bold uppercase block">
                  Registered Event Passes
                </span>
                <span className="text-lg font-extrabold text-slate-900">
                  {registrations.length} Active {registrations.length === 1 ? 'Pass' : 'Passes'}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/user/my-events')}>
                View Passes
              </Button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Organizing Committee (OC) Status</span>
              </div>

              {ocStatus?.status === 'APPROVED' ? (
                <div className="space-y-1">
                  <p className="text-emerald-700 font-semibold">
                    Approved for {ocStatus.event_name} ({ocStatus.department})
                  </p>
                  <p className="text-[11px] font-mono text-slate-600">
                    OC Handle: {ocStatus.official_email}
                  </p>
                  {ocStatus.oc_status === 'PENDING_ACTIVATION' && (
                    <Button size="sm" onClick={() => navigate('/user/home')} className="mt-1">
                      Activate OC Password on Dashboard →
                    </Button>
                  )}
                </div>
              ) : ocStatus?.status === 'PENDING' ? (
                <p className="text-amber-700">
                  Application pending Faculty Admin review for <strong>{ocStatus.event_name}</strong>.
                </p>
              ) : (
                <p className="text-slate-500">
                  You have not applied to an Organizing Committee yet. Visit the Dashboard to volunteer!
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
