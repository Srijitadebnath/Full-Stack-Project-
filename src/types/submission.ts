export type SubmissionType = 'text' | 'image' | 'voice';

export type SubmissionStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Needs Revision';

export interface Submission {
  id: string;
  taskId: string;
  taskName: string;
  eventId: string;
  eventName: string;
  submittedById: string;
  submittedByName: string;
  submittedByRole: 'team';
  submissionTime: string;
  description: string;
  type: SubmissionType;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDurationSeconds?: number;
  status: SubmissionStatus;
  feedback?: string;
}
