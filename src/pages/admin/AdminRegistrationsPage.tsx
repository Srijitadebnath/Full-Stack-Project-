import React, { useEffect, useState } from 'react';
import { Search, Download, Eye, Users } from 'lucide-react';
import { Registration } from '../../types';
import { registrationService } from '../../services/registrationService';
import { PageContainer } from '../../components/layout';
import {
  GlassCard,
  GlassTable,
  Chip,
  PillButton,
  Modal,
  Avatar,
} from '../../components/ui';
import { formatDate } from '../../utils/formatters';

export const AdminRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  useEffect(() => {
    registrationService.getRegistrations().then(setRegistrations);
  }, []);

  const filtered = registrations.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.eventName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusChip = (status: Registration['status']) => {
    switch (status) {
      case 'confirmed':
        return <Chip variant="purple">Confirmed</Chip>;
      case 'attended':
        return <Chip variant="success">Attended</Chip>;
      default:
        return <Chip variant="warning">Pending</Chip>;
    }
  };

  return (
    <PageContainer
      title="Participant Registrations "
      subtitle="View, search, filter, and audit verified student event passes."
      action={
        <PillButton
          variant="glass"
          icon={<Download className="w-4 h-4 text-purple-600" />}
          onClick={() => alert('Exporting registrations database to CSV...')}
        >
          Export CSV
        </PillButton>
      }
    >
      {/* Search and Filters Glass Card */}
      <GlassCard className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B87A3] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 neo-inset text-xs sm:text-sm text-[#1E1B2E] placeholder:text-[#8B87A3] focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all rounded-full"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { value: 'all', label: 'All Passes' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'attended', label: 'Attended' },
            { value: 'pending', label: 'Pending' },
          ].map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setStatusFilter(st.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st.value
                  ? 'btn-primary text-white shadow-xs'
                  : 'btn-glass text-[#4B4763] hover:text-[#1E1B2E]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Registrations Glass Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-purple-500/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1E1B2E]">Registered Students</h3>
            <p className="text-xs text-[#8B87A3] mt-0.5">
              Showing {filtered.length} total participant records
            </p>
          </div>
        </div>

        <GlassTable
          data={filtered}
          keyExtractor={(r) => r.id}
          emptyMessage="No student registrations match your current filters."
          columns={[
            {
              key: 'student',
              header: 'Student Name',
              render: (r) => (
                <div className="flex items-center gap-3">
                  <Avatar name={r.userName} size="sm" />
                  <div>
                    <span className="font-bold text-[#1E1B2E] block">{r.userName}</span>
                    <span className="text-[11px] text-[#8B87A3]">{r.userEmail}</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'college',
              header: 'Department / College',
              render: (r) => (
                <div>
                  <span className="font-medium text-[#1E1B2E] block">{r.college}</span>
                  <span className="text-[11px] text-[#8B87A3]">
                    {r.course} ({r.year})
                  </span>
                </div>
              ),
            },
            {
              key: 'event',
              header: 'Event Name',
              render: (r) => (
                <span className="font-bold text-purple-700">{r.eventName}</span>
              ),
            },
            {
              key: 'date',
              header: 'Registration Date',
              render: (r) => (
                <span className="text-xs text-[#4B4763]">{formatDate(r.registrationDate)}</span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => getStatusChip(r.status),
            },
            {
              key: 'actions',
              header: 'Action',
              render: (r) => (
                <PillButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReg(r)}
                  icon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Details
                </PillButton>
              ),
            },
          ]}
        />
      </GlassCard>

      {/* Registration Details Modal */}
      {selectedReg && (
        <Modal
          isOpen={!!selectedReg}
          onClose={() => setSelectedReg(null)}
          title="Student Registration Pass Details"
          subtitle={`Registration ID: ${selectedReg.id}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3 p-3 neo-inset rounded-2xl">
              <Avatar name={selectedReg.userName} size="lg" />
              <div>
                <h4 className="font-bold text-base text-[#1E1B2E]">{selectedReg.userName}</h4>
                <p className="text-xs text-[#8B87A3]">{selectedReg.userEmail} • {selectedReg.userPhone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 neo-inset rounded-xl">
                <span className="text-[10px] text-[#8B87A3] block font-medium">Event Name</span>
                <span className="font-bold text-[#1E1B2E]">{selectedReg.eventName}</span>
              </div>
              <div className="p-3 neo-inset rounded-xl">
                <span className="text-[10px] text-[#8B87A3] block font-medium">Registration Status</span>
                <div className="mt-1">{getStatusChip(selectedReg.status)}</div>
              </div>
              <div className="p-3 neo-inset rounded-xl">
                <span className="text-[10px] text-[#8B87A3] block font-medium">Academic Program</span>
                <span className="font-bold text-[#1E1B2E]">{selectedReg.course} ({selectedReg.year})</span>
              </div>
              <div className="p-3 neo-inset rounded-xl">
                <span className="text-[10px] text-[#8B87A3] block font-medium">Institution / Campus</span>
                <span className="font-bold text-[#1E1B2E]">{selectedReg.college}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <PillButton variant="glass" onClick={() => setSelectedReg(null)}>
                Close
              </PillButton>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
