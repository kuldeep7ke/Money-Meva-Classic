export type AccountType = 'cash' | 'bank' | 'upi' | 'wallet' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon: string;
  color: string;
  isArchived: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSummary {
  totalBalance: number;
  totalAccounts: number;
  byType: Record<AccountType, number>;
}
