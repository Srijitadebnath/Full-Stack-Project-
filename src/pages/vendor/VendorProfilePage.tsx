import React, { useEffect, useState } from 'react';
import { UserCheck, Mail, Phone, Building2, Calendar, Award, ShieldCheck } from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { GlassCard, Chip, PillButton } from '../../components/ui';

export const VendorProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  if (!user) {
    return (
      <PageContainer title="OC Member Profile">
        <div className="py-12 text-center text-xs text-[var(--color-text-muted,#8B87A3)]">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading profile data...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Organizing Committee Member Profile"
      subtitle="Verified registration details and assigned event responsibilities for your OC membership."
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Profile Banner Card */}
        <GlassCard className="p-6 sm:p-8 space-y-4 rounded-3xl">
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
                    Verified OC Member
                  </Chip>
                </div>
                <p className="text-xs text-[var(--color-text-muted,#8B87A3)] mt-0.5">
                  {user.department || 'Computer Science (3rd Year)'}
                </p>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  {user.college || 'UPES Dehradun'}
                </p>
              </div>
            </div>

            <Chip variant="success" dot size="md">
              System Active
            </Chip>
          </div>
        </GlassCard>

        {/* Detailed Registration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registered Contact Info */}
          <GlassCard className="p-6 space-y-4 rounded-3xl">
            <h3 className="text-sm font-bold text-[var(--color-text-heading,#1E1B2E)] border-b border-[rgba(124,58,237,0.08)] pb-2">
              Registered Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    Authorized College Email
                  </span>
                  <span className="font-semibold text-[var(--color-text-heading,#1E1B2E)] truncate block">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    Contact Phone
                  </span>
                  <span className="font-semibold text-[var(--color-text-heading,#1E1B2E)]">
                    {user.phone || '+91 97654 32109'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    Institution &amp; Department
                  </span>
                  <span className="font-semibold text-[var(--color-text-heading,#1E1B2E)]">
                    {user.college || 'UPES Dehradun'} • {user.department || 'B.Tech CSE'}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Assigned Event & OC Role */}
          <GlassCard className="p-6 space-y-4 rounded-3xl">
            <h3 className="text-sm font-bold text-[var(--color-text-heading,#1E1B2E)] border-b border-[rgba(124,58,237,0.08)] pb-2">
              Assigned Event &amp; OC Role
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    Assigned Event
                  </span>
                  <span className="font-bold text-purple-700">
                    {user.assignedEventName || 'TechFest UPES 2026'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-purple-600 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    OC Department &amp; Responsibility
                  </span>
                  <span className="font-semibold text-[var(--color-text-heading,#1E1B2E)]">
                    {user.ocRole || 'Stage & Technical OC Lead'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl neo-inset">
                <div className="w-8 h-8 rounded-xl neo-raised flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[var(--color-text-muted,#8B87A3)] block">
                    Security &amp; Operations Level
                  </span>
                  <span className="font-semibold text-emerald-700">
                    Level 2 Organizing Committee Access
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
};
