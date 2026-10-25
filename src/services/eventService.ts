import { Event } from '../types';

const API_BASE = 'http://localhost:5000/api';

class EventService {
  // 1. Fetch all events live from PostgreSQL
  async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE}/events`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch events');
      }

      // Map backend database column names to frontend Event interface
      return result.data.map((row: any): Event => ({
        id: row.id,
        name: row.name,
        description: row.description,
        date: row.event_date ? row.event_date.split('T')[0] : row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        venue: row.venue,
        registrationDeadline: row.registration_deadline ? row.registration_deadline.split('T')[0] : row.registration_deadline,
        capacity: Number(row.capacity),
        registrationCount: Number(row.registration_count),
        status: row.status.toLowerCase(),
        category: row.category,
        budget: Number(row.budget || 0),
        budgetUsed: Number(row.budget_used || 0),
        organizer: row.organizer,
        image: row.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
      }));
    } catch (error) {
      console.error('Error in EventService.getEvents:', error);
      return [];
    }
  }

  // 2. Fetch single event with assigned OC team & tasks
  async getEventById(id: string): Promise<Event | undefined> {
    try {
      const response = await fetch(`${API_BASE}/events/${id}`);
      const result = await response.json();

      if (!result.success || !result.data) {
        return undefined;
      }

      const row = result.data;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        date: row.event_date ? row.event_date.split('T')[0] : row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        venue: row.venue,
        registrationDeadline: row.registration_deadline ? row.registration_deadline.split('T')[0] : row.registration_deadline,
        capacity: Number(row.capacity),
        registrationCount: Number(row.registration_count),
        status: row.status.toLowerCase(),
        category: row.category,
        budget: Number(row.budget || 0),
        budgetUsed: Number(row.budget_used || 0),
        organizer: row.organizer,
        image: row.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
      };
    } catch (error) {
      console.error(`Error in EventService.getEventById(${id}):`, error);
      return undefined;
    }
  }

  // 3. Admin: Create new event directly in PostgreSQL
  async createEvent(eventData: Omit<Event, 'id' | 'registrationCount' | 'budgetUsed'>): Promise<Event> {
    const token = localStorage.getItem('auth_token') || '';

    const response = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: eventData.name,
        description: eventData.description,
        event_date: eventData.date,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        venue: eventData.venue,
        registration_deadline: eventData.registrationDeadline,
        capacity: eventData.capacity,
        category: eventData.category,
        budget: eventData.budget,
        organizer: eventData.organizer
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to create event');
    }

    const row = result.data;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      date: row.event_date ? row.event_date.split('T')[0] : row.event_date,
      startTime: row.start_time,
      endTime: row.end_time,
      venue: row.venue,
      registrationDeadline: row.registration_deadline ? row.registration_deadline.split('T')[0] : row.registration_deadline,
      capacity: Number(row.capacity),
      registrationCount: 0,
      status: row.status.toLowerCase(),
      category: row.category,
      budget: Number(row.budget || 0),
      budgetUsed: 0,
      organizer: row.organizer,
      image: row.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000'
    };
  }

  // 4. Admin: Update event
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const token = localStorage.getItem('auth_token') || '';
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const result = await res.json();
    return result.data || updates;
  }

  // 5. Admin: Delete event
  async deleteEvent(id: string): Promise<boolean> {
    const token = localStorage.getItem('auth_token') || '';
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.ok;
  }
}

export const eventService = new EventService();
