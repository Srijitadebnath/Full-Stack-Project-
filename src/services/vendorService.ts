import { Vendor } from '../types';
const API_BASE = 'http://localhost:5000/api';
class VendorService {
  // 1. Fetch all OC department vendors from PostgreSQL
  async getVendors(): Promise<Vendor[]> {
    try {
      const res = await fetch(`${API_BASE}/vendors`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch vendors from database:', err);
      return [];
    }
  }
  // 2. Fetch vendors for a specific event
  async getVendorsByEvent(eventId: string): Promise<Vendor[]> {
    try {
      const res = await fetch(`${API_BASE}/vendors?event_id=${eventId}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch event vendors from database:', err);
      return [];
    }
  }
  // 3. Admin adds a new vendor or department unit
  async addVendor(vendor: Omit<Vendor, 'id' | 'progress'>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Failed to add vendor contract');
    }
    return result.data;
  }
}
export const vendorService = new VendorService();