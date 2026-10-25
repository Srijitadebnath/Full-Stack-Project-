import React, { useEffect, useState } from 'react';
import { UserCheck, Mail, Phone, Building2, Calendar, Award, ShieldCheck } from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Avatar } from '../../components/ui';

export const VendorProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser);
  }, []);

  if (!user) {
    return (
      <PageContainer title="OC Member Profile">
        <div className="py-8 text-center text-xs text-slate-400">Loading profile data...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Organizing Committee Member Profile"
      subtitle="Verified registration details and assigned event responsibilities for your OC membership."
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Profile Banner Card */}
        <Card className="p-6 space-y-4 border border-purple-100 bg-gradient-to-r from-purple-50/50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} src={user.avatar} size="lg" status="online" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                  <Badge variant="purple" dot>Verified OC Member</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user.department || 'Computer Science (3rd Year)'}</p>
                <p className="text-xs text-purple-700 font-semibold mt-1">{user.college || 'UPES Dehradun'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Registration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Registered Contact Info */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Registered Contact Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Authorized College Email</span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{user.phone || '+91 97654 32109'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Institution & Department</span>
                  <span className="font-semibold text-slate-800">{user.college || 'UPES Dehradun'} • {user.department || 'B.Tech CSE'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Assigned Event & OC Role */}
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Assigned Event & OC Role
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned Event</span>
                  <span className="font-bold text-purple-700">{user.assignedEventName || 'TechFest UPES 2026'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">OC Department & Responsibility</span>
                  <span className="font-semibold text-slate-800">{user.ocRole || 'Stage & Technical OC Lead'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Portal Access Status</span>
                  <span className="font-semibold text-emerald-600">Active & Authorized</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
