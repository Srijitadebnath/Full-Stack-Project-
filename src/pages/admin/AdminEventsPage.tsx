import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, Trash2, Eye } from 'lucide-react';
import { Event, EventStatus, User } from '../../types';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, Modal, Alert } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: '',
    registrationDeadline: '',
    capacity: 200,
    category: 'Technology',
    status: 'upcoming' as EventStatus,
    budget: 100000,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
    organizer: 'Event Operations Team',
  });

  const loadEvents = async () => {
    const list = await eventService.getEvents();
    const u = await authService.getCurrentUser();
    setEvents(list);
    setCurrentUser(u);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await eventService.createEvent(formData);
    setIsModalOpen(false);
    setSuccessMsg(`Event "${formData.name}" created successfully!`);
    loadEvents();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete event "${name}"?`)) {
      await eventService.deleteEvent(id);
      loadEvents();
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isFacultyAdmin = currentUser?.role === 'admin';

  return (
    <PageContainer
      title="Event Operations Hub"
      subtitle={isFacultyAdmin ? "Create, edit, track, and manage campus events." : "View assigned events and operational details."}
      action={
        isFacultyAdmin ? (
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Create New Event
          </Button>
        ) : undefined
      }
    >
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search events or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Event Statuses' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => (
          <Card key={evt.id} className="flex flex-col justify-between overflow-hidden p-0">
            {/* Image Header */}
            <div className="relative h-44 w-full overflow-hidden bg-slate-100">
              <img src={evt.image} alt={evt.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <Badge
                  variant={
                    evt.status === 'upcoming'
                      ? 'purple'
                      : evt.status === 'ongoing'
                      ? 'emerald'
                      : evt.status === 'completed'
                      ? 'slate'
                      : 'rose'
                  }
                  dot
                >
                  {evt.status}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 bg-slate-900/70 backdrop-blur-xs text-white text-[11px] font-medium rounded-lg">
                  {evt.category}
                </span>
              </div>
            </div>

            {/* Event Content */}
            <div className="p-5 space-y-3 flex-1">
              <h3 className="text-base font-semibold text-slate-900 leading-snug">{evt.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>

              <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{formatDate(evt.date)} ({evt.startTime} - {evt.endTime})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 bg-slate-50/70 p-3 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Capacity</span>
                  <span className="font-semibold text-slate-800">{evt.registrationCount} / {evt.capacity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Budget</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(evt.budget)}</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/events/${evt.id}`)}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Manage Event
              </Button>

              {isFacultyAdmin && (
                <button
                  onClick={() => handleDeleteEvent(evt.id, evt.name)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Event Modal (Admin Only) */}
      {isFacultyAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Campus Event"
          subtitle="Fill in the event details to publish to the operations portal."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <Input
              label="Event Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. TechFest UPES 2026"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                placeholder="Describe event highlights, objective, and activities..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Event Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                label="Start Time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Venue"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Main Auditorium"
              />
              <Input
                label="Registration Deadline"
                type="date"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Max Participants"
                type="number"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { value: 'Technology', label: 'Technology' },
                  { value: 'Cultural', label: 'Cultural' },
                  { value: 'Hackathon', label: 'Hackathon' },
                  { value: 'Sports', label: 'Sports' },
                  { value: 'Academic', label: 'Academic' },
                ]}
              />
              <Input
                label="Initial Budget (₹)"
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Event</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
};
