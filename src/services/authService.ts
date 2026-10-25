import { User } from '../types';

const API_BASE = 'http://localhost:5000/api';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Rehydrate user from localStorage if token exists
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = null;
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  // Live Backend Login: POST /api/auth/login
  async loginWithCredentials(
    email: string,
    password: string,
    portal: 'ADMIN' | 'TEAM' | 'USER'
  ): Promise<{ user: User; redirectPath: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portal }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Authentication failed');
    }

    // Normalize role to lowercase for frontend typing
    const roleUpper = (data.user.role || '').toUpperCase();
    const normalizedRole = roleUpper === 'ADMIN' ? 'admin' : roleUpper === 'TEAM' ? 'team' : 'user';
    data.user.role = normalizedRole;

    // Save JWT token and profile to localStorage
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_role', normalizedRole);
    localStorage.setItem('user_email', data.user.email);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    this.currentUser = data.user;

    // Strict Role Redirection
    let redirectPath = '/user/home';
    if (roleUpper === 'ADMIN') redirectPath = '/admin/dashboard';
    else if (roleUpper === 'TEAM') redirectPath = '/vendor/dashboard';

    return { user: data.user, redirectPath };
  }

  // Student Sign Up / Register Profile
  async registerStudent(studentData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    department: string;
    college: string;
  }): Promise<{ user: User; redirectPath: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Student registration failed');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_role', 'user');
    localStorage.setItem('user_email', data.user.email);
    localStorage.setItem('auth_user', JSON.stringify(data.user));

    this.currentUser = data.user;
    return { user: data.user, redirectPath: '/user/home' };
  }

  // Live Forgot Password: POST /api/auth/forgot-password
  async requestPasswordReset(email: string): Promise<{ message: string; recoveryMailbox?: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to request password reset');
    }

    return {
      message: data.message,
      recoveryMailbox: data.data?.recovery_mailbox,
    };
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_user');
  }
}

export const authService = new AuthService();
