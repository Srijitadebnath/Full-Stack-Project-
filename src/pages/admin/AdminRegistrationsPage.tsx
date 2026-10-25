import React, { useEffect, useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Registration } from '../../types';
import { registrationService } from '../../services/registrationService';
import { PageContainer } from '../../components/layout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmptyState, Input, Select, Badge, Button, Modal } from '../../components/ui';
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
    const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.eventName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer
      title="Participant Registrations Database"
      subtitle="View, search, filter, and audit all student event registrations."
      action={
        <Button variant="outline" icon={<Download className="w-4 h-4" />}>
          Export CSV
        </Button>
      }
    >
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by student name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'attended', label: 'Attended' },
            ]}
          />
        </div>
      </div>

      {/* Registrations Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email & Phone</TableHead>
            <TableHead>College / Department</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmptyState title="No registrations found" description="Try adjusting search query or filters." />
          ) : (
            filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-semibold text-slate-900">{r.userName}</TableCell>
                <TableCell>
                  <div>{r.userEmail}</div>
                  <div className="text-[11px] text-slate-400">{r.userPhone}</div>
                </TableCell>
                <TableCell>
                  <div>{r.college}</div>
                  <div className="text-[11px] text-slate-400">{r.course} ({r.year})</div>
                </TableCell>
                <TableCell className="font-medium text-purple-700">{r.eventName}</TableCell>
                <TableCell>{formatDate(r.registrationDate)}</TableCell>
                <TableCell>
                  <Badge variant={r.status === 'confirmed' ? 'purple' : r.status === 'attended' ? 'emerald' : 'amber'}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReg(r)}>
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Details Modal */}
      {selectedReg && (
        <Modal isOpen={!!selectedReg} onClose={() => setSelectedReg(null)} title="Registration Ticket Record">
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-purple-50 text-purple-900 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold text-purple-500 uppercase">Event Ticket</span>
              <h4 className="text-base font-bold">{selectedReg.eventName}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div><span className="text-slate-400">Name:</span> <p className="font-semibold">{selectedReg.userName}</p></div>
              <div><span className="text-slate-400">Student ID:</span> <p className="font-semibold">{selectedReg.studentId}</p></div>
              <div><span className="text-slate-400">Email:</span> <p className="font-semibold">{selectedReg.userEmail}</p></div>
              <div><span className="text-slate-400">Phone:</span> <p className="font-semibold">{selectedReg.userPhone}</p></div>
              <div><span className="text-slate-400">College:</span> <p className="font-semibold">{selectedReg.college}</p></div>
              <div><span className="text-slate-400">Course & Year:</span> <p className="font-semibold">{selectedReg.course} ({selectedReg.year})</p></div>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
