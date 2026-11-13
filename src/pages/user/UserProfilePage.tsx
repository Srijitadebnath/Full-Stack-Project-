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
  Sparkles,
} from 'lucide-react';
import { Registration, User } from '../../types';
import { authService } from '../../services/authService';
import { registrationService } from '../../services/registrationService';
import { teamService, StudentOcStatus } from '../../services/teamService';
import { GlassCard, PillButton, Chip } from '../../components/ui';

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
      <div className="max-w-4xl mx-auto p-6 sm:p-8 text-center text-xs text-[var(--color-text-muted,#8B87A3)]">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading your UPES student profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 sm:p-12">
        <GlassCard className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto neo-raised">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-heading,#1E1B2E)]">
            Sign In to View Student Profile
          </h2>
          <p className="text-xs text-[var(--color-text-muted,#8B87A3)] leading-relaxed">
            Sign in with your official UPES student email to view your academic badge, digital event passes, and OC volunteer status.
          </p>
          <PillButton variant="primary" size="md" onClick={() => navigate('/login')}>
            Sign In to Student Portal →
          </PillButton>
        </GlassCard>
      </div>
    );
  }

  const sapId = extractSapId(user.email);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-heading,#1E1B2E)] tracking-tight">
          Student Profile &amp; Campus Identity
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted,#8B87A3)] mt-0.5">
          Your verified EVENTRA account details, active event passes, and committee status.
        </p>
      </div>

      {/* Main Profile Header Card */}
      <GlassCard className="p-6 sm:p-8 space-y-6 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] text-white text-2xl font-extrabold flex items-center justify-center shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-[var(--color-text-heading,#1E1B2E)]">
                  {user.name}
                </h2>
                <Chip variant="purple" size="sm">
                  Student Member
                </Chip>
              </div>
              <p className="text-xs text-[var(--color-text-muted,#8B87A3)] mt-0.5">
                {user.department || 'School of Computer Science'}
              </p>
              <p className="text-xs text-purple-700 font-semibold mt-0.5">
                {user.college || 'UPES Dehradun'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip variant="success" dot size="md">
              UPES Verified
            </Chip>
          </div>
        </div>

        {/* Academic Details Grid (Neumorphic Inset) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl neo-inset text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
              <IdCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                SAP ID
              </span>
              <span className="font-mono font-bold text-[var(--color-text-heading,#1E1B2E)]">
                {sapId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                Student Email
              </span>
              <span className="font-mono font-semibold text-[var(--color-text-heading,#1E1B2E)] truncate block">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] uppercase font-semibold block">
                Contact Phone
              </span>
              <span className="font-semibold text-[var(--color-text-heading,#1E1B2E)]">
                {user.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Two Column Section: OC Status & Active Event Registrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OC Status */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center gap-2 pb-2 border-b border-[rgba(124,58,237,0.08)]">
            <div className="w-7 h-7 rounded-lg neo-raised flex items-center justify-center text-purple-600">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-heading,#1E1B2E)]">
              Fest Organizing Committee
            </h3>
          </div>

          {ocStatus?.status === 'APPROVED' ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl space-y-2 text-xs">
              <Chip variant="success" size="sm">
                Approved Member
              </Chip>
              <h4 className="font-bold text-emerald-900">{ocStatus.event_name}</h4>
              <p className="text-emerald-700">Official Handle: {ocStatus.official_email}</p>
            </div>
          ) : ocStatus?.status === 'PENDING' ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs">
              <Chip variant="warning" size="sm">
                Application Under Review
              </Chip>
              <p className="text-amber-800">
                Applied for {ocStatus.event_name} ({ocStatus.department}). Reviewing by Faculty Admin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-text-body,#4B4763)]">
                Want to lead stage operations, guest hospitality, or technical infrastructure for campus fests?
              </p>
              <PillButton variant="primary" size="sm" onClick={() => navigate('/user/home')}>
                Apply for Committee Roles →
              </PillButton>
            </div>
          )}
        </GlassCard>

        {/* Registered Passes Summary */}
        <GlassCard className="p-6 space-y-4 rounded-3xl">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(124,58,237,0.08)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg neo-raised flex items-center justify-center text-purple-600">
                <Ticket className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-text-heading,#1E1B2E)]">
                Active Passes ({registrations.length})
              </h3>
            </div>
            {registrations.length > 0 && (
              <PillButton
                variant="glass"
                size="sm"
                onClick={() => navigate('/user/my-events')}
                className="text-xs"
              >
                View Passes →
              </PillButton>
            )}
          </div>

          {registrations.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted,#8B87A3)]">
              No active passes yet. Register for an upcoming event to receive your QR badge.
            </p>
          ) : (
            <div className="space-y-2.5">
              {registrations.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-white/70 rounded-2xl border border-white/80 neo-raised flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-[var(--color-text-heading,#1E1B2E)] truncate">
                    {r.eventName}
                  </span>
                  <Chip variant="purple" size="sm">
                    Active
                  </Chip>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
