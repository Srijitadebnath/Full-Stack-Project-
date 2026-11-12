import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, MapPin, Trash2, Eye, Image as ImageIcon, Sparkles, Building2, Users, DollarSign, Upload, X, Check, FileImage, Loader2 } from 'lucide-react';
import { Event, EventStatus, User } from '../../types';
import { eventService } from '../../services/eventService';
import { authService } from '../../services/authService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, Modal, Alert } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { fileToCompressedBase64, formatFileSize } from '../../utils/imageUtils';

const IMAGE_PRESETS = [
  { label: '💻 Tech / Coding', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000' },
  { label: '🎉 Cultural Fest', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000' },
  { label: '🤖 AI / Hackathon', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000' },
  { label: '🏆 Sports Tournament', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000' },
  { label: '🔬 Workshop / Seminar', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000' },
];

export const AdminEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Device file upload state
  const [posterTab, setPosterTab] = useState<'device' | 'presets' | 'url'>('device');
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDeviceFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }
    try {
      setIsCompressing(true);
      const base64 = await fileToCompressedBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
      setSelectedFileName(file.name);
      setSelectedFileSize(formatFileSize(file.size));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to read image');
    } finally {
      setIsCompressing(false);
    }
  };

  // Form State with rich description, criteria, and custom post poster
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: 'Open to all enrolled UPES students (B.Tech, M.Tech, MBA, B.Des). Solo or Teams of up to 4 members.',
    guidelines: '1. College ID badge mandatory at venue entrance.\n2. Laptops required for technical hack tracks.\n3. Reporting time is 30 minutes prior to start.',
    date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    venue: 'Main Auditorium, Bidholi Campus',
    registrationDeadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    capacity: 250,
    category: 'Technology',
    status: 'upcoming' as EventStatus,
    budget: 150000,
    image: IMAGE_PRESETS[0].url,
    organizer: 'School of Computer Science & SOCS Chapter',
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
    
    // Combine overview, criteria, and guidelines into a rich post description
    const formattedDescription = [
      formData.description.trim(),
      formData.criteria.trim() ? `\n\n📌 Eligibility & Criteria:\n${formData.criteria.trim()}` : '',
      formData.guidelines.trim() ? `\n\n⚠️ Guidelines & Requirements:\n${formData.guidelines.trim()}` : ''
    ].filter(Boolean).join('');

    await eventService.createEvent({
      ...formData,
      description: formattedDescription,
    });

    setIsModalOpen(false);
    setSuccessMsg(`Event "${formData.name}" published successfully with allocated budget!`);
    loadEvents();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteEvent = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete event "${name}"?`)) {
      const ok = await eventService.deleteEvent(id);
      if (!ok) {
        alert('Failed to delete event. Please make sure you are logged in as Admin and try again.');
        return;
      }
      loadEvents();
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isFacultyAdmin = currentUser?.role?.toLowerCase() === 'admin';

  return (
    <PageContainer
      title="Event Operations Hub"
      subtitle={isFacultyAdmin ? "Create, publish, track, and manage campus events with dedicated budgets." : "View assigned events and operational details."}
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
            placeholder="Search events, organizers, or venues..."
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
              { value: 'all', label: 'All Statuses' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ongoing', label: 'Ongoing' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <Card key={evt.id} className="overflow-hidden p-0 flex flex-col justify-between group hover:border-purple-200 transition-all shadow-sm">
            <div>
              {/* Event Poster Image */}
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src={evt.image || IMAGE_PRESETS[0].url}
                  alt={evt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="purple" className="shadow-sm">{evt.category}</Badge>
                  <Badge variant={evt.status === 'upcoming' ? 'blue' : evt.status === 'ongoing' ? 'emerald' : 'slate'}>
                    {evt.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base sm:text-lg leading-tight drop-shadow">{evt.name}</h3>
                  <p className="text-[11px] text-white/80 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3 h-3 text-purple-300 shrink-0" />
                    <span className="truncate">{evt.organizer || 'UPES Campus'}</span>
                  </p>
                </div>
              </div>

              {/* Event Body Info */}
              <div className="p-4 space-y-3">
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{formatDate(evt.date)} ({evt.startTime} - {evt.endTime})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {evt.description.split('\n\n')[0]}
                </p>

                {/* Capacity & Budget Metrics */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Registration Seats</span>
                    <span className="font-bold text-slate-800">{evt.registrationCount} / {evt.capacity}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Allocated Budget</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(evt.budget || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 pt-0 flex gap-2">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate(`/admin/events/${evt.id}`)}
                icon={<Eye className="w-3.5 h-3.5" />}
              >
                Event Operations Hub
              </Button>
              {isFacultyAdmin && (
                <Button
                  variant="ghost"
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5"
                  onClick={() => handleDeleteEvent(evt.id, evt.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Event Modal */}
      {isFacultyAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Campus Event"
          subtitle="Publish a full event post with custom description, eligibility criteria, poster, and budget."
          maxWidth="lg"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <Input
              label="Event Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. InnovateX: UPES National Hackathon 2026"
            />

            {/* Event Poster Upload / Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-800">Event Poster / Banner Image</label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setPosterTab('device')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      posterTab === 'device' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📁 From Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterTab('presets')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      posterTab === 'presets' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ✨ Quick Themes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosterTab('url')}
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                      posterTab === 'url' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔗 Paste URL
                  </button>
                </div>
              </div>

              {/* Tab 1: Device File Upload with Drag & Drop */}
              {posterTab === 'device' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDeviceFileSelect(file);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleDeviceFileSelect(file);
                    }}
                    className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-purple-600 bg-purple-50/70 scale-[1.01]'
                        : 'border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/50'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="py-2 flex flex-col items-center gap-1.5 text-purple-700 text-xs font-semibold">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Optimizing &amp; preparing your poster image...</span>
                      </div>
                    ) : (
                      <div className="py-1">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Click to select poster from your device <span className="text-purple-600 font-bold">or drag and drop</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, JPEG, or WEBP (auto-optimized for lightning-fast loading)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Preset Themes */}
              {posterTab === 'presets' && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: preset.url });
                          setSelectedFileName(preset.label);
                          setSelectedFileSize(null);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          formData.image === preset.url
                            ? 'bg-purple-50 border-purple-400 text-purple-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Paste Direct URL */}
              {posterTab === 'url' && (
                <Input
                  placeholder="Paste direct poster URL (https://...)"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setSelectedFileName(null);
                    setSelectedFileSize(null);
                  }}
                />
              )}

              {/* Image Preview & Details Card */}
              {formData.image && (
                <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-purple-200/80 shadow-xs bg-slate-900 group">
                  <img src={formData.image} alt="Event Poster Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
                    <div className="text-white text-xs space-y-0.5">
                      <span className="font-semibold block truncate max-w-[260px] text-[11px]">
                        {selectedFileName ? `📄 ${selectedFileName}` : '🖼️ Event Banner Poster'}
                      </span>
                      {selectedFileSize && (
                        <span className="text-[10px] text-purple-200 block">
                          Size: {selectedFileSize} • Ready for upload
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: '' });
                        setSelectedFileName(null);
                        setSelectedFileSize(null);
                      }}
                      title="Remove image"
                      className="px-2 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Event Overview & Highlights</label>
              <textarea
                required
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 rounded-xl p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                placeholder="Describe key activities, guest speakers, cash prizes, and workshop tracks..."
              />
            </div>

            {/* Eligibility Criteria */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Eligibility Criteria</label>
              <textarea
                rows={2}
                value={formData.criteria}
                onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-xl p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                placeholder="Specify eligible programs, years, team size restrictions..."
              />
            </div>

            {/* Guidelines & Rules */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Guidelines & Event Rules</label>
              <textarea
                rows={2}
                value={formData.guidelines}
                onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
                className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-xl p-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10"
                placeholder="Specify entry requirements, gear/laptop needs, code of conduct..."
              />
            </div>

            {/* Organizer Department */}
            <Input
              label="Hosting Organizer / Department"
              required
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              placeholder="e.g. Department of Student Affairs & IEEE Student Branch"
            />

            {/* Dates & Times */}
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

            {/* Venue & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Venue"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. MAC Auditorium / Amphitheatre"
              />
              <Input
                label="Registration Deadline"
                type="date"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              />
            </div>

            {/* Capacity, Category & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Max Capacity (Seats)"
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
                  { value: 'Workshop', label: 'Workshop' },
                ]}
              />
              <Input
                label="Approved Budget (₹)"
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
              <Button type="submit">Publish Campus Event</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
};
