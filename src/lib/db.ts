import Dexie, { Table } from 'dexie';

export interface TransactionRecord {
  id: string;
  businessId: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  partnerId?: string;
  tags?: string[];
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  recurringEndDate?: string;
  fromAccountId?: string;
  toAccountId?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface PartnerRecord {
  id: string;
  businessId: string;
  name: string;
  type: string;
  groupId?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  currentBalance: number;
  notes?: string;
  tags?: string[];
  status: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerGroupRecord {
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

export interface CategoryRecord {
  id: string;
  businessId: string;
  name: string;
  color: string;
  icon: string;
  type: string;
  isArchived: boolean;
  usageCount?: number;
  lastUsedAt?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  pin: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AccountRecord {
  id: string;
  businessId: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isArchived: boolean;
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRecord {
  id: string;
  businessId: string;
  partnerId?: string;
  partnerName: string;
  type: string;
  title: string;
  principalAmount: number;
  interestRate: number;
  emiAmount: number;
  totalEmis: number;
  paidEmis: number;
  startDate: string;
  endDate: string;
  nextPaymentDate: string;
  status: string;
  notes?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  businessId: string;
  details?: string;
  timestamp: string;
}

export interface ArchiveRecord {
  id: string;
  entityType: string;
  entityId: string;
  data: unknown;
  deletedAt: string;
  deletedBy: string;
}

export interface SettingsRecord {
  key: string;
  value: unknown;
}

class MoneyMevaDB extends Dexie {
  transactions!: Table<TransactionRecord>;
  partners!: Table<PartnerRecord>;
  partnerGroups!: Table<PartnerGroupRecord>;
  categories!: Table<CategoryRecord>;
  users!: Table<UserRecord>;
  accounts!: Table<AccountRecord>;
  loans!: Table<LoanRecord>;
  audit!: Table<AuditRecord>;
  archive!: Table<ArchiveRecord>;
  settings!: Table<SettingsRecord>;

  constructor() {
    super('MoneyMevaDB');
    this.version(1).stores({
      transactions: 'id, type, date, categoryId, partnerId, fromAccountId, toAccountId, userId, createdBy',
      partners: 'id, type, groupId, status',
      partnerGroups: 'id, name',
      categories: 'id, type, isArchived',
      users: 'id, role',
      accounts: 'id, type',
      loans: 'id, type, status, nextPaymentDate',
      audit: 'id, action, entity, entityId, timestamp',
      archive: 'id, entityType, entityId',
      settings: 'key',
    });
  }
}

export const db = new MoneyMevaDB();
