export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled' | 'attended';

export type RegistrationType = 'participant' | 'oc_team';

export interface Registration {
  id: string;
  eventId: string;
  eventName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  college: string;
  course: string;
  year: string;
  registrationDate: string;
  status: RegistrationStatus;
  studentId: string;
  registrationType: RegistrationType; // Participant or OC Team Member
  ocDepartment?: string;               // e.g. Stage & Technical, Refreshments, Hospitality, Media
  ocResponsibilityPreference?: string;
}
