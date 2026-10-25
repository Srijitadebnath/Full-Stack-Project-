export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Needs Revision'
  | 'Completed';

export interface Task {
  id: string;
  name: string;
  description: string;
  assignedToName: string;
  assignedToId: string;
  assignedType: 'team' | 'member';
  eventId: string;
  eventName: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  notes?: string;
}
