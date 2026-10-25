import { Submission, SubmissionStatus } from '../types';
import { mockSubmissions } from '../data/mockSubmissions';

class SubmissionService {
  private submissions: Submission[] = [...mockSubmissions];

  async getSubmissions(): Promise<Submission[]> {
    return Promise.resolve([...this.submissions]);
  }

  async createSubmission(data: Omit<Submission, 'id' | 'submissionTime' | 'status'>): Promise<Submission> {
    const newSubmission: Submission = {
      ...data,
      id: `sub-${Date.now()}`,
      submissionTime: 'Just now',
      status: 'Submitted',
    };
    this.submissions.unshift(newSubmission);
    return Promise.resolve(newSubmission);
  }

  async updateSubmissionStatus(id: string, status: SubmissionStatus, feedback?: string): Promise<Submission> {
    const index = this.submissions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Submission not found');
    this.submissions[index].status = status;
    if (feedback) this.submissions[index].feedback = feedback;
    return Promise.resolve({ ...this.submissions[index] });
  }
}

export const submissionService = new SubmissionService();
