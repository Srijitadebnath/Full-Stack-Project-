export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  registrationCount: number;
  status: EventStatus;
  category: string;
  budget: number;
  budgetUsed: number;
  image: string;
  organizer: string;
}
