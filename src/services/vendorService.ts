import { Vendor } from '../types';
import { mockVendors } from '../data/mockVendors';

class VendorService {
  private vendors: Vendor[] = [...mockVendors];

  async getVendors(): Promise<Vendor[]> {
    return Promise.resolve([...this.vendors]);
  }

  async getVendorsByEvent(eventId: string): Promise<Vendor[]> {
    return Promise.resolve(this.vendors.filter((v) => v.assignedEventId === eventId));
  }

  async addVendor(vendor: Omit<Vendor, 'id' | 'progress'>): Promise<Vendor> {
    const newVendor: Vendor = {
      ...vendor,
      id: `ven-${Date.now()}`,
      progress: 0,
    };
    this.vendors.unshift(newVendor);
    return Promise.resolve(newVendor);
  }
}

export const vendorService = new VendorService();
