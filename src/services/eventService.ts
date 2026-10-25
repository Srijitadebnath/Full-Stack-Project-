import { Event } from '../types';
import { mockEvents } from '../data/mockEvents';

class EventService {
  private events: Event[] = [...mockEvents];

  async getEvents(): Promise<Event[]> {
    return Promise.resolve([...this.events]);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const event = this.events.find((e) => e.id === id);
    return Promise.resolve(event ? { ...event } : undefined);
  }

  async createEvent(eventData: Omit<Event, 'id' | 'registrationCount' | 'budgetUsed'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registrationCount: 0,
      budgetUsed: 0,
    };
    this.events.unshift(newEvent);
    return Promise.resolve(newEvent);
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    this.events[index] = { ...this.events[index], ...updates };
    return Promise.resolve(this.events[index]);
  }

  async deleteEvent(id: string): Promise<boolean> {
    this.events = this.events.filter((e) => e.id !== id);
    return Promise.resolve(true);
  }
}

export const eventService = new EventService();
