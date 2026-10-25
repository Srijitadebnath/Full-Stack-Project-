import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockUsers';
import { teamService } from './teamService';

class AuthService {
  private currentUser: User = mockUsers[0];

  async getCurrentUser(): Promise<User> {
    return Promise.resolve(this.currentUser);
  }

  async loginWithEmail(email: string): Promise<{ user: User; redirectPath: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if Admin
    if (cleanEmail === 'admin@college.edu' || cleanEmail.includes('admin')) {
      const adminUser = mockUsers.find((u) => u.role === 'admin') || mockUsers[0];
      this.currentUser = adminUser;
      localStorage.setItem('user_role', 'admin');
      localStorage.setItem('user_email', cleanEmail);
      return { user: adminUser, redirectPath: '/admin/dashboard' };
    }

    // 2. Check if Registered OC Team Member
    const ocMembers = await teamService.getTeamMembers();
    const matchingOC = ocMembers.find((m) => m.email.toLowerCase() === cleanEmail) ||
      mockUsers.find((u) => u.role === 'team' && u.email.toLowerCase() === cleanEmail);

    if (matchingOC) {
      const teamUser: User = {
        id: matchingOC.id,
        name: matchingOC.name,
        email: matchingOC.email,
        role: 'team',
        phone: matchingOC.phone,
        department: matchingOC.department,
        college: 'UPES Dehradun',
        assignedEventName: matchingOC.assignedEventName,
        ocRole: ('responsibility' in matchingOC)
          ? `${matchingOC.role} - ${matchingOC.responsibility}`
          : (matchingOC.ocRole || 'OC Team Member'),
      };
      this.currentUser = teamUser;
      localStorage.setItem('user_role', 'team');
      localStorage.setItem('user_email', cleanEmail);
      return { user: teamUser, redirectPath: '/vendor/dashboard' };
    }

    // 3. Student / Participant Access
    if (cleanEmail.includes('student') || cleanEmail.includes('.edu') || cleanEmail.length > 3) {
      const studentUser: User = {
        id: `std-${Date.now()}`,
        name: cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        role: 'user',
      };
      this.currentUser = studentUser;
      localStorage.setItem('user_role', 'user');
      localStorage.setItem('user_email', cleanEmail);
      return { user: studentUser, redirectPath: '/user/home' };
    }

    throw new Error('Unrecognized Email Address. Please enter a valid college email address.');
  }

  async login(role: UserRole): Promise<User> {
    const user = mockUsers.find((u) => u.role === role) || mockUsers[0];
    this.currentUser = user;
    localStorage.setItem('user_role', role);
    return Promise.resolve(user);
  }

  async logout(): Promise<void> {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    return Promise.resolve();
  }
}

export const authService = new AuthService();
