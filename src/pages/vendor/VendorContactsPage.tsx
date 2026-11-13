import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { PageContainer } from '../../components/layout';
import { GlassCard, PillButton } from '../../components/ui';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contacts.map((c, i) => (
          <GlassCard key={i} lift className="space-y-4 p-5 sm:p-6">
            <div>
              <h4 className="font-bold text-[#1E1B2E] text-base">{c.name}</h4>
              <span className="text-xs text-purple-700 font-bold block mt-0.5">{c.role}</span>
            </div>

            <div className="space-y-1.5 text-xs text-[#4B4763] neo-inset p-3 rounded-2xl">
              <p className="font-medium">Phone: <span className="font-bold text-[#1E1B2E]">{c.phone}</span></p>
              <p className="font-medium">Email: <span className="font-bold text-[#1E1B2E]">{c.email}</span></p>
            </div>

            <div className="flex gap-2 pt-2 border-t border-purple-500/10">
              <PillButton
                variant="glass"
                size="sm"
                className="w-full text-xs"
                icon={<Phone className="w-3.5 h-3.5 text-purple-600" />}
                onClick={() => window.open(`tel:${c.phone}`)}
              >
                Call Contact
              </PillButton>
            </div>
          </GlassCard>
        ))}
      </div>
    </PageContainer>
  );
};
