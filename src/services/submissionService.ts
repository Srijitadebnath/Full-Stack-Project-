import { Submission, SubmissionStatus } from '../types';

const API_BASE = 'http://localhost:5000/api';

class SubmissionService {
  // 1. Fetch live submissions from PostgreSQL
  async getSubmissions(eventId?: string): Promise<Submission[]> {
    try {
      const url = eventId ? `${API_BASE}/submissions?event_id=${eventId}` : `${API_BASE}/submissions`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch submissions from database:', err);
      return [];
    }
  }

  // 2. OC Member uploads work proof to PostgreSQL
  async createSubmission(data: Omit<Submission, 'id' | 'submissionTime' | 'status'>): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to submit work proof');
    }
    return result.data;
  }

  // 3. Faculty Admin approves or requests revision
  async updateSubmissionStatus(id: string, status: SubmissionStatus, feedback?: string): Promise<Submission> {
    const res = await fetch(`${API_BASE}/submissions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback }),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to update submission status');
    }
    return result.data;
  }
}

export const submissionService = new SubmissionService();
