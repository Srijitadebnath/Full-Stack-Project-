import { Registration } from '../types';

const API_BASE = 'http://localhost:5000/api';

class RegistrationService {
  // Fetch real event registrations from PostgreSQL database
  async getRegistrations(userEmail?: string): Promise<Registration[]> {
    try {
      const url = userEmail
        ? `${API_BASE}/registrations?email=${encodeURIComponent(userEmail)}`
        : `${API_BASE}/registrations`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch registrations from database:', err);
      return [];
    }
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    try {
      const res = await fetch(`${API_BASE}/registrations?event_id=${encodeURIComponent(eventId)}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch event registrations:', err);
      return [];
    }
  }

  // Live ACID Registration with Row-Locking in PostgreSQL
  async createRegistration(
    eventId: string,
    data: {
      userName: string;
      userEmail: string;
      userPhone: string;
      college: string;
      course: string;
      year: string;
      studentId: string;
      registrationType?: string;
    }
  ): Promise<Registration> {
    const res = await fetch(`${API_BASE}/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: data.userName,
        user_email: data.userEmail,
        user_phone: data.userPhone,
        student_id: data.studentId,
        college: data.college,
        course: data.course,
        year_level: data.year,
        registration_type: 'PARTICIPANT',
      }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    return {
      id: result.data.ticket_id,
      eventId: result.data.event_id,
      eventName: result.data.event_name,
      userName: result.data.user_name,
      userEmail: result.data.user_email,
      userPhone: data.userPhone,
      college: data.college,
      course: data.course,
      year: data.year,
      studentId: data.studentId,
      registrationType: 'participant',
      status: 'confirmed',
      registrationDate: result.data.registration_date,
    };
  }
}

export const registrationService = new RegistrationService();
