import React, { useEffect, useState } from 'react';
import { Plus, Building2, Phone, Mail } from 'lucide-react';
import { Vendor, VendorCategory } from '../../types';
import { vendorService } from '../../services/vendorService';
import { PageContainer } from '../../components/layout';
import { Card, Badge, Button, Input, Select, ProgressBar, Modal } from '../../components/ui';

export const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Sound' as VendorCategory,
    contactPerson: '',
    phone: '',
    email: '',
    assignedEventId: 'evt-101',
    assignedEventName: 'TechFest UPES 2026',
    assignedWork: '',
    status: 'active' as const,
  });

  const loadVendors = async () => {
    const list = await vendorService.getVendors();
    setVendors(list);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    await vendorService.addVendor(formData);
    setIsModalOpen(false);
    loadVendors();
  };

  const filtered = vendors.filter((v) => categoryFilter === 'all' || v.category === categoryFilter);

  return (
    <PageContainer
      title="Vendor Operations Directory"
      subtitle="Track suppliers, external agencies, assigned work contracts, and completion progress."
      action={
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Vendor Contract
        </Button>
      }
    >
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <span className="text-xs font-semibold text-slate-700">Filter Category</span>
        <div className="w-48">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Catering', label: 'Catering' },
              { value: 'Decoration', label: 'Decoration' },
              { value: 'Sound', label: 'Sound & Audio' },
              { value: 'Lighting', label: 'Lighting' },
              { value: 'Photography', label: 'Photography & Video' },
              { value: 'Printing', label: 'Printing' },
              { value: 'Transport', label: 'Transport' },
              { value: 'Security', label: 'Security' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((v) => (
          <Card key={v.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">{v.name}</h4>
                <p className="text-xs text-slate-500">{v.contactPerson} • {v.phone}</p>
              </div>
              <Badge variant="cyan">{v.category}</Badge>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Work</span>
              <p className="font-semibold text-slate-800">{v.assignedWork}</p>
              <span className="text-purple-600 block pt-0.5 text-[11px]">{v.assignedEventName}</span>
            </div>

            <ProgressBar progress={v.progress} color="purple" showLabel />
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign New Vendor">
        <form onSubmit={handleAddVendor} className="space-y-3">
          <Input label="Agency/Vendor Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}
            options={[
              { value: 'Catering', label: 'Catering' },
              { value: 'Decoration', label: 'Decoration' },
              { value: 'Sound', label: 'Sound' },
              { value: 'Lighting', label: 'Lighting' },
              { value: 'Photography', label: 'Photography' },
              { value: 'Printing', label: 'Printing' },
              { value: 'Security', label: 'Security' },
            ]}
          />
          <Input label="Contact Person" required value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
          <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="Assigned Work Description" required value={formData.assignedWork} onChange={(e) => setFormData({ ...formData, assignedWork: e.target.value })} />

          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vendor</Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
