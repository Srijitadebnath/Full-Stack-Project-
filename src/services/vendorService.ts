import { Vendor } from '../types';
import { API_BASE } from '../config/api';
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

  // 4. Admin deletes a vendor contract
  async deleteVendor(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch(`${API_BASE}/vendors/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const result = await res.json();
      return Boolean(res.ok && result.success);
    } catch (err) {
      console.error('Failed to delete vendor from database:', err);
      return false;
    }
  }
}
export const vendorService = new VendorService();