export type TeamRole = 'Lead' | 'Coordinator' | 'Member' | 'Volunteer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  role: TeamRole;
  assignedEventId: string;
  assignedEventName: string;
  responsibility: string;
  status: 'active' | 'inactive';
  avatar?: string;
}
