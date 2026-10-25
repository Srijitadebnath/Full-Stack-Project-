import React, { useEffect, useState } from 'react';
import { Plus, UserCheck, Trash2, Mail } from 'lucide-react';
import { TeamMember, TeamRole, User } from '../../types';
import { teamService } from '../../services/teamService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, Modal } from '../../components/ui';

export const AdminTeamsPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const loadMembers = async () => {
    const list = await teamService.getTeamMembers();
    const u = await authService.getCurrentUser();
    setMembers(list);
    setCurrentUser(u);
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await teamService.addTeamMember(formData);
    setIsModalOpen(false);
    loadMembers();
  };

  const handleRemoveMember = async (id: string) => {
    if (confirm('Remove team member from OC assignment?')) {
      await teamService.removeTeamMember(id);
      loadMembers();
    }
  };

  const isFacultyAdmin = currentUser?.role === 'admin';

  return (
    <PageContainer
      title="Organizing Committee Management"
      subtitle='Clear work distribution: "Which member is working on what?"'
      action={
        isFacultyAdmin ? (
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Team Member
          </Button>
        ) : undefined
      }
    >
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
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </Card>
        ))}
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
