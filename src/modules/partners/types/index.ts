import { PartnerType } from '@/constants';

export interface Partner {
  id: string;
  businessId: string;
  name: string;
  type: PartnerType;
  groupId?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  notes?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'archived';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerGroup {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerFilters {
  type?: PartnerType[];
  groupId?: string;
  status?: string;
  search?: string;
}

export const DEFAULT_PARTNER_GROUPS: Omit<PartnerGroup, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { businessId: 'default', name: 'Customers', description: 'People who buy from you', color: '#22c55e', icon: 'user', isArchived: false },
  { businessId: 'default', name: 'Vendors', description: 'Suppliers and sellers', color: '#3b82f6', icon: 'truck', isArchived: false },
  { businessId: 'default', name: 'Friends', description: 'Personal contacts', color: '#8b5cf6', icon: 'heart', isArchived: false },
  { businessId: 'default', name: 'Family', description: 'Family members', color: '#ec4899', icon: 'home', isArchived: false },
  { businessId: 'default', name: 'Workers', description: 'Employees and contractors', color: '#f59e0b', icon: 'briefcase', isArchived: false },
  { businessId: 'default', name: 'Farm Partners', description: 'Agricultural partners', color: '#14b8a6', icon: 'leaf', isArchived: false },
  { businessId: 'default', name: 'Companies', description: 'Business entities', color: '#06b6d4', icon: 'building', isArchived: false },
];

export const DEFAULT_PARTNERS: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { businessId: 'default', name: 'Cash', type: 'vendor', openingBalance: 0, currentBalance: 0, status: 'active', createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'Bank Account', type: 'vendor', openingBalance: 0, currentBalance: 0, status: 'active', createdBy: 'system', updatedBy: 'system' },
  { businessId: 'default', name: 'UPI Wallet', type: 'vendor', openingBalance: 0, currentBalance: 0, status: 'active', createdBy: 'system', updatedBy: 'system' },
];
