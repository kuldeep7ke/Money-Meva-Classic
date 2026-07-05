import { Account } from '@/modules/accounts/types';
import { idbStorage } from '@/lib/idbStorage';

const DEFAULT_ACCOUNTS: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Cash', type: 'cash', balance: 0, currency: 'INR', icon: 'banknote', color: '#22c55e', isArchived: false },
  { name: 'Bank Account', type: 'bank', balance: 0, currency: 'INR', icon: 'landmark', color: '#3b82f6', isArchived: false },
  { name: 'UPI', type: 'upi', balance: 0, currency: 'INR', icon: 'smartphone', color: '#8b5cf6', isArchived: false },
  { name: 'Wallet', type: 'wallet', balance: 0, currency: 'INR', icon: 'wallet', color: '#f59e0b', isArchived: false },
];

function ensureDefaults(): void {
  const items = idbStorage.getAll<Account>('accounts');
  if (items.length === 0) {
    const defaults = DEFAULT_ACCOUNTS.map((a) => ({
      ...a,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    idbStorage.set('accounts', 'accounts', defaults);
  }
}

export const accountService = {
  getAll: (): Account[] => {
    ensureDefaults();
    return idbStorage.getAll<Account>('accounts').filter((a) => !a.isArchived);
  },

  getAllIncludingArchived: (): Account[] => {
    ensureDefaults();
    return idbStorage.getAll<Account>('accounts');
  },

  getById: (id: string): Account | undefined => {
    return idbStorage.getById<Account>('accounts', id);
  },

  create: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account => {
    return idbStorage.create<Account>('accounts', 'accounts', account);
  },

  update: (id: string, updates: Partial<Account>): Account | null => {
    return idbStorage.update<Account>('accounts', 'accounts', id, updates);
  },

  delete: (id: string): boolean => {
    return idbStorage.delete('accounts', 'accounts', id);
  },

  updateBalance: (id: string, amount: number): Account | null => {
    const account = idbStorage.getById<Account>('accounts', id);
    if (!account) return null;
    return idbStorage.update<Account>('accounts', 'accounts', id, {
      balance: account.balance + amount,
    });
  },

  getTotalBalance: (): number => {
    return accountService.getAll().reduce((sum, a) => sum + a.balance, 0);
  },

  getSummary: () => {
    const accounts = accountService.getAll();
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const byType: Record<string, number> = {};
    accounts.forEach((a) => {
      byType[a.type] = (byType[a.type] || 0) + a.balance;
    });
    return { totalBalance, totalAccounts: accounts.length, byType };
  },

  clear: () => {
    idbStorage.clear('accounts', 'accounts');
  },
};
