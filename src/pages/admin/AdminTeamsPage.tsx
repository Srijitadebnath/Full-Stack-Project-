import React, { useEffect, useState } from 'react';
import { Plus, UserCheck, Trash2, Mail, CheckCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { TeamMember, TeamRole, User } from '../../types';
import { teamService, OcApplication } from '../../services/teamService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, Modal, Alert } from '../../components/ui';

export const AdminTeamsPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [applications, setApplications] = useState<OcApplication[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'applications'>('applications');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    year: '3rd Year',
    role: 'Coordinator' as TeamRole,
    assignedEventId: 'evt-101',
    assignedEventName: 'TechFest UPES 2026',
    responsibility: '',
    status: 'active' as const,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const u = await authService.getCurrentUser();
      setCurrentUser(u);

      const [list, apps] = await Promise.all([
        teamService.getTeamMembers().catch((err) => {
          console.error('Failed to load team members:', err);
          return [];
        }),
        teamService.getOcApplications().catch((err) => {
          console.error('Failed to load OC applications:', err);
          return [];
        }),
      ]);
      setMembers(list);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await teamService.addTeamMember(formData);
    setIsModalOpen(false);
    loadData();
  };

  const handleRemoveMember = async (id: string) => {
    if (confirm('Remove team member from OC assignment?')) {
      await teamService.removeTeamMember(id);
      loadData();
    }
  };

  const handleApproveApplication = async (app: OcApplication) => {
    setApprovingId(app.id);
    setActionMessage(null);
    try {
      const result = await teamService.approveOcApplication(app.id);
      setActionMessage(`🎉 Approved ${app.user_name}! Official OC Handle created: ${result.official_email}. Activation token generated.`);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve application');
    } finally {
      setApprovingId(null);
    }
  };

  const isFacultyAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const pendingApps = applications.filter((a) => a.status === 'PENDING');

  return (
    <PageContainer
      title="Organizing Committee (OC) Management"
      subtitle="Review volunteer applications, approve official handles, and manage department rosters"
      action={
        isFacultyAdmin ? (
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Member Manually
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Action alert banner */}
        {actionMessage && (
          <Alert type="success" message={actionMessage} onClose={() => setActionMessage(null)} />
        )}

        {/* Tab switch: Applications vs. Active Roster */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Student Volunteer Applications</span>
            {pendingApps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {pendingApps.length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Active OC Team Roster</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
              {members.length}
            </span>
          </button>
        </div>

        {/* Loading state indicator */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-100">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Synchronizing OC Roster with PostgreSQL...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: PENDING STUDENT VOLUNTEER APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {pendingApps.length === 0 ? (
                  <Card className="py-12 text-center space-y-2 bg-white">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">All Applications Processed!</h3>
                    <p className="text-xs text-slate-400">
                      There are no pending OC volunteer applications from UPES students at this time.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingApps.map((app) => (
                      <Card key={app.id} className="p-5 bg-white border border-purple-100 shadow-xs rounded-2xl space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                              {app.user_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{app.user_name}</h4>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {app.user_email} • {app.user_phone}
                              </p>
                            </div>
                          </div>
                          <Badge variant="amber" size="sm" dot>Pending Review</Badge>
                        </div>

                        <div className="p-3 bg-purple-50/60 rounded-xl space-y-1.5 text-xs border border-purple-100/70">
                          <div className="flex justify-between items-center text-[10px] font-bold text-purple-700 uppercase">
                            <span>Event: {app.event_name}</span>
                            <span>Dept: {app.oc_department}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            <strong>Statement:</strong> {app.oc_responsibility_preference}
                          </p>
                          <span className="text-[10px] text-slate-400 block pt-1">
                            Applied: {app.registration_date} • {app.course} ({app.year_level})
                          </span>
                        </div>

                        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                          <Button
                            size="sm"
                            disabled={approvingId === app.id}
                            onClick={() => handleApproveApplication(app)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
                            icon={<Sparkles className="w-3.5 h-3.5" />}
                          >
                            {approvingId === app.id ? 'Creating OC Account...' : 'Approve & Issue OC Handle →'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ACTIVE OC TEAM ROSTER */}
            {activeTab === 'roster' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <Card key={m.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                          {m.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{m.name}</h4>
                          <p className="text-[11px] text-slate-400">{m.department} ({m.year})</p>
                        </div>
                      </div>
                      <Badge variant="purple">{m.role}</Badge>
                    </div>

                    <div className="p-3 bg-purple-50/50 rounded-xl space-y-1 text-xs border border-purple-100/60">
                      <span className="text-[10px] text-purple-600 font-semibold uppercase">Assigned Event</span>
                      <p className="font-semibold text-slate-900">{m.assignedEventName}</p>
                      <span className="text-slate-500 block pt-1 font-normal">
                        <strong>Responsibility:</strong> {m.responsibility}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[130px]">{m.email}</span>
                      </div>
                      {isFacultyAdmin && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Member Modal (Admin Only) */}
      {isFacultyAdmin && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add OC Team Member">
          <form onSubmit={handleAddMember} className="space-y-3">
            <Input label="Member Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
                options={[
                  { value: 'Lead', label: 'Lead' },
                  { value: 'Coordinator', label: 'Coordinator' },
                  { value: 'Member', label: 'Member' },
                  { value: 'Volunteer', label: 'Volunteer' },
                ]}
              />
            </div>
            <Input label="Responsibility" required value={formData.responsibility} onChange={(e) => setFormData({ ...formData, responsibility: e.target.value })} placeholder="e.g. Stage Setup & Mic Sound Controls" />

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Assign Member</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
};
