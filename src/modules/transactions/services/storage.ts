import { Transaction } from '@/modules/transactions/types';
import { Partner } from '@/modules/partners/types';
import { Category } from '@/modules/categories/types';
import { Account } from '@/modules/accounts/types';
import { AuditLog } from '@/types';
import { idbStorage } from '@/lib/idbStorage';
import { db } from '@/lib/db';
import { archiveService } from '@/modules/archive/services/storage';

export const storage = {
  transactions: {
    getAll: () => idbStorage.getAll<Transaction>('transactions'),
    getById: (id: string) => idbStorage.getById<Transaction>('transactions', id),
    create: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
      return idbStorage.create<Transaction>('transactions', 'transactions', transaction);
    },
    update: (id: string, updates: Partial<Transaction>) => {
      return idbStorage.update<Transaction>('transactions', 'transactions', id, updates);
    },
    delete: (id: string) => {
      const item = idbStorage.getById<Transaction>('transactions', id);
      if (item) archiveService.addToArchive('transaction', item);
      return idbStorage.delete('transactions', 'transactions', id);
    },
    bulkDelete: (ids: string[]) => {
      const items = idbStorage.getAll<Transaction>('transactions');
      items.filter((i) => ids.includes(i.id)).forEach((i) => archiveService.addToArchive('transaction', i));
      return idbStorage.bulkDelete('transactions', 'transactions', ids);
    },
    clear: () => {
      idbStorage.clear('transactions', 'transactions');
    },
  },

  partners: {
    getAll: () => idbStorage.getAll<Partner>('partners'),
    getById: (id: string) => idbStorage.getById<Partner>('partners', id),
    create: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
      return idbStorage.create<Partner>('partners', 'partners', partner);
    },
    update: (id: string, updates: Partial<Partner>) => {
      return idbStorage.update<Partner>('partners', 'partners', id, updates);
    },
    delete: (id: string) => {
      return idbStorage.delete('partners', 'partners', id);
    },
  },

  categories: {
    getAll: () => idbStorage.getAll<Category>('categories'),
    getById: (id: string) => idbStorage.getById<Category>('categories', id),
    create: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
      return idbStorage.create<Category>('categories', 'categories', category);
    },
    update: (id: string, updates: Partial<Category>) => {
      return idbStorage.update<Category>('categories', 'categories', id, updates);
    },
    delete: (id: string) => {
      return idbStorage.delete('categories', 'categories', id);
    },
  },

  audit: {
    getAll: () => idbStorage.getAll<AuditLog>('audit'),
    create: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const now = new Date().toISOString();
      return idbStorage.create<AuditLog>('audit', 'audit', { ...log, timestamp: now } as Omit<AuditLog, 'id' | 'createdAt' | 'updatedAt'>);
    },
    clear: () => {
      idbStorage.clear('audit', 'audit');
    },
  },

  backup: {
    exportAll: () => ({
      transactions: idbStorage.getAll<Transaction>('transactions'),
      partners: idbStorage.getAll<Partner>('partners'),
      categories: idbStorage.getAll<Category>('categories'),
      accounts: idbStorage.getAll<Account>('accounts'),
      audit: idbStorage.getAll<AuditLog>('audit'),
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
    }),
    importAll: (data: {
      transactions?: Transaction[];
      partners?: Partner[];
      categories?: Category[];
      accounts?: Account[];
      audit?: AuditLog[];
    }) => {
      const mergeArray = <T extends { id: string }>(existing: T[], incoming?: T[]): T[] => {
        if (!incoming || incoming.length === 0) return existing;
        const map = new Map<string, T>();
        existing.forEach(i => map.set(i.id, i));
        incoming.forEach(i => { if (i) map.set(i.id, i); });
        return Array.from(map.values());
      };
      idbStorage.set('transactions', 'transactions', mergeArray(idbStorage.getAll<Transaction>('transactions'), data.transactions));
      idbStorage.set('partners', 'partners', mergeArray(idbStorage.getAll<Partner>('partners'), data.partners));
      idbStorage.set('categories', 'categories', mergeArray(idbStorage.getAll<Category>('categories'), data.categories));
      idbStorage.set('accounts', 'accounts', mergeArray(idbStorage.getAll<Account>('accounts'), data.accounts));
      idbStorage.set('audit', 'audit', mergeArray(idbStorage.getAll<AuditLog>('audit'), data.audit));
    },
  },
};
