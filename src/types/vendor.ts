export type VendorCategory =
  | 'Stage & Technical OC'
  | 'Catering & Refreshments OC'
  | 'Sound & Audio OC'
  | 'Lighting & Visuals OC'
  | 'Photography & Media OC'
  | 'Printing & Graphics OC'
  | 'Transport & Logistics OC'
  | 'Security & Crowd Control OC';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  assignedEventId: string;
  assignedEventName: string;
  assignedWork: string;
  status: 'active' | 'pending' | 'completed' | 'delayed';
  progress: number; // Percentage 0 - 100
}
