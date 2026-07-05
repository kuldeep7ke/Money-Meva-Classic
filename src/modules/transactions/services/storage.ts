import { Transaction } from '@/modules/transactions/types';
import { Partner } from '@/modules/partners/types';
import { Category } from '@/modules/categories/types';
import { Account } from '@/modules/accounts/types';
import { AuditLog } from '@/types';
import { idbStorage } from '@/lib/idbStorage';
import { db } from '@/lib/db';
import { archiveService } from '@/modules/archive/services/storage';
import { APP_VERSION } from '@/constants';

export type ImportResult = {
  total: number;
  imported: number;
  skipped: number;
};

export type ImportResults = {
  transactions: ImportResult;
  partners: ImportResult;
  categories: ImportResult;
  accounts: ImportResult;
  audit: ImportResult;
  warning?: string;
};

export type BackupData = {
  version: string;
  exportedAt: string;
  appName?: string;
  transactions?: Transaction[];
  partners?: Partner[];
  categories?: Category[];
  accounts?: Account[];
  audit?: AuditLog[];
};

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

export function validateBackup(data: unknown): { valid: boolean; warning?: string; error?: string } {
  if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid backup file' };
  const d = data as Record<string, unknown>;
  if (!d.version || typeof d.version !== 'string') return { valid: false, error: 'Backup file missing version number' };
  if (compareVersions(d.version, APP_VERSION) > 0) {
    return { valid: true, warning: `Backup is from v${d.version}, which is newer than current v${APP_VERSION}. Some data may not be fully compatible.` };
  }
  return { valid: true };
}

function dedupeById<T extends { id: string }>(existing: T[], incoming: T[] | undefined): { merged: T[]; skipped: number } {
  if (!incoming || incoming.length === 0) return { merged: existing, skipped: 0 };
  const existingIds = new Set(existing.map(i => i.id));
  const newItems = incoming.filter(i => i && !existingIds.has(i.id));
  return { merged: [...existing, ...newItems], skipped: incoming.length - newItems.length };
}

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
      appName: 'Money Meva',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      transactions: idbStorage.getAll<Transaction>('transactions'),
      partners: idbStorage.getAll<Partner>('partners'),
      categories: idbStorage.getAll<Category>('categories'),
      accounts: idbStorage.getAll<Account>('accounts'),
      audit: idbStorage.getAll<AuditLog>('audit'),
    }),
    importAll: (data: BackupData, mode: 'merge' | 'replace' = 'merge'): ImportResults => {
      const validation = validateBackup(data);
      const warning = validation.valid ? validation.warning : undefined;

      if (mode === 'replace') {
        idbStorage.clear('transactions', 'transactions');
        idbStorage.clear('partners', 'partners');
        idbStorage.clear('categories', 'categories');
        idbStorage.clear('accounts', 'accounts');
        idbStorage.clear('audit', 'audit');
      }

      const tExisting = idbStorage.getAll<Transaction>('transactions');
      const pExisting = mode === 'replace' ? [] : idbStorage.getAll<Partner>('partners');
      const cExisting = mode === 'replace' ? [] : idbStorage.getAll<Category>('categories');
      const aExisting = mode === 'replace' ? [] : idbStorage.getAll<Account>('accounts');
      const uExisting = mode === 'replace' ? [] : idbStorage.getAll<AuditLog>('audit');

      const tResult = dedupeById(tExisting, data.transactions);
      const pResult = dedupeById(pExisting, data.partners);
      const cResult = dedupeById(cExisting, data.categories);
      const aResult = dedupeById(aExisting, data.accounts);
      const uResult = dedupeById(uExisting, data.audit);

      idbStorage.set('transactions', 'transactions', tResult.merged);
      idbStorage.set('partners', 'partners', pResult.merged);
      idbStorage.set('categories', 'categories', cResult.merged);
      idbStorage.set('accounts', 'accounts', aResult.merged);
      idbStorage.set('audit', 'audit', uResult.merged);

      return {
        transactions: { total: data.transactions?.length || 0, imported: (data.transactions?.length || 0) - tResult.skipped, skipped: tResult.skipped },
        partners: { total: data.partners?.length || 0, imported: (data.partners?.length || 0) - pResult.skipped, skipped: pResult.skipped },
        categories: { total: data.categories?.length || 0, imported: (data.categories?.length || 0) - cResult.skipped, skipped: cResult.skipped },
        accounts: { total: data.accounts?.length || 0, imported: (data.accounts?.length || 0) - aResult.skipped, skipped: aResult.skipped },
        audit: { total: data.audit?.length || 0, imported: (data.audit?.length || 0) - uResult.skipped, skipped: uResult.skipped },
        warning,
      };
    },
  },
};
