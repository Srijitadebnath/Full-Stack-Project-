import { Registration } from '../types';
import { mockRegistrations } from '../data/mockRegistrations';

class RegistrationService {
  private registrations: Registration[] = [...mockRegistrations];

  async getRegistrations(): Promise<Registration[]> {
    return Promise.resolve([...this.registrations]);
  }

  async getRegistrationsByEvent(eventId: string): Promise<Registration[]> {
    return Promise.resolve(this.registrations.filter((r) => r.eventId === eventId));
  }

  async createRegistration(data: Omit<Registration, 'id' | 'registrationDate' | 'status'>): Promise<Registration> {
    const newReg: Registration = {
      ...data,
      id: `reg-${Date.now()}`,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'confirmed',
    };
    this.registrations.unshift(newReg);
    return Promise.resolve(newReg);
  }
}

export const registrationService = new RegistrationService();
