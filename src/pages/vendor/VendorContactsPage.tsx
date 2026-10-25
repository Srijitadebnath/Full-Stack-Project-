import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { Card, Button } from '../../components/ui';

export const VendorContactsPage: React.FC = () => {
  const contacts = [
    { name: 'Dr. Rajesh Sharma', role: 'Event Operations Dean', phone: '+91 98765 43210', email: 'admin@college.edu' },
    { name: 'Priya Patel', role: 'OC Stage Lead', phone: '+91 97654 32109', email: 'priya.oc@college.edu' },
    { name: 'Sanjay Agarwal', role: 'Catering Lead', phone: '+91 97890 12345', email: 'catering@royalcrown.com' },
  ];

  return (
    <PageContainer
      title="Event Operational Contacts"
      subtitle="Direct contact directory for campus venue managers and lead organizers."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contacts.map((c, i) => (
          <Card key={i} className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{c.name}</h4>
              <span className="text-xs text-purple-600 font-medium">{c.role}</span>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Phone: {c.phone}</p>
              <p>Email: {c.email}</p>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" className="w-full" icon={<Phone className="w-3 h-3" />}>
                Call
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
