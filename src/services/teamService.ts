import { TeamMember } from '../types';
import { mockTeams } from '../data/mockTeams';

const API_BASE = 'http://localhost:5000/api';

export interface OcApplication {
  id: string;
  event_id: string;
  event_name: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  course: string;
  year_level: string;
  student_id: string;
  oc_department: string;
  oc_responsibility_preference: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  registration_date: string;
}

export interface StudentOcStatus {
  has_application: boolean;
  status?: 'PENDING' | 'APPROVED';
  event_name?: string;
  department?: string;
  official_email?: string;
  oc_status?: 'PENDING_ACTIVATION' | 'ACTIVE';
  activation_token?: string;
}

class TeamService {
  // Fetch live team members directly from PostgreSQL database
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const res = await fetch(`${API_BASE}/teams`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch teams from database:', err);
      return [];
    }
  }

  async getTeamMembersByEvent(eventId: string): Promise<TeamMember[]> {
    const members = await this.getTeamMembers();
    return members.filter((t) => t.assignedEventId === eventId);
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to add team member');
    }
    return { id: result.id };
  }

  async removeTeamMember(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to remove team member');
    }
    return true;
  }

  // 1. Student submits OC Volunteer Application
  async applyForOc(data: {
    user_name: string;
    user_email: string;
    user_phone?: string;
    event_id: string;
    department: string;
    responsibility_preference?: string;
    student_id?: string;
    course?: string;
    year_level?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/oc/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to submit OC application');
    }
    return result;
  }

  // 2. Admin fetches all OC applications
  async getOcApplications(): Promise<OcApplication[]> {
    const res = await fetch(`${API_BASE}/admin/oc-applications`);
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch OC applications');
    }
    return result.data || [];
  }

  // 3. Admin approves OC application & creates official handle
  async approveOcApplication(applicationId: string): Promise<{
    official_email: string;
    activation_token: string;
  }> {
    const res = await fetch(`${API_BASE}/admin/approve-oc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId }),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to approve OC application');
    }
    return {
      official_email: result.official_email,
      activation_token: result.activation_token,
    };
  }

  // 4. Student checks their OC status / invitation
  async getStudentOcStatus(email: string): Promise<StudentOcStatus> {
    const res = await fetch(`${API_BASE}/user/oc-status?email=${encodeURIComponent(email)}`);
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch student OC status');
    }
    return result;
  }

  // 5. Student activates their OC account and sets password
  async activateOcAccount(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/activate-oc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to activate OC account');
    }
    return result;
  }
}

export const teamService = new TeamService();
