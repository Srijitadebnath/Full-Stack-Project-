export type UserRole = 'admin' | 'team' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  college?: string;
  assignedEventId?: string;
  assignedEventName?: string;
  ocRole?: string;
}
