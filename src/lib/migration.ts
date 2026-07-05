import { db, TransactionRecord, PartnerRecord, PartnerGroupRecord, CategoryRecord, UserRecord, AccountRecord, LoanRecord, AuditRecord, ArchiveRecord } from '@/lib/db';
import { STORAGE_KEYS } from '@/constants';

function getStorageItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  try { return JSON.parse(data) as T[]; } catch { return []; }
}

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try { return JSON.parse(data) as T; } catch { return defaultValue; }
}

export const migrationService = {
  isMigrated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('money_meva_migrated') === 'true';
  },

  markMigrated: (): void => {
    localStorage.setItem('money_meva_migrated', 'true');
  },

  migrate: async (): Promise<{ success: boolean; counts: Record<string, number> }> => {
    if (typeof window === 'undefined') return { success: false, counts: {} };
    if (migrationService.isMigrated()) return { success: true, counts: {} };

    const counts: Record<string, number> = {};

    try {
      const transactions = getStorageItem<TransactionRecord>(STORAGE_KEYS.TRANSACTIONS);
      if (transactions.length > 0) {
        await db.transactions.bulkPut(transactions);
        counts.transactions = transactions.length;
      }

      const partners = getStorageItem<PartnerRecord>(STORAGE_KEYS.PARTNERS);
      if (partners.length > 0) {
        await db.partners.bulkPut(partners);
        counts.partners = partners.length;
      }

      const partnerGroups = getStorageItem<PartnerGroupRecord>('money_meva_partner_groups');
      if (partnerGroups.length > 0) {
        await db.partnerGroups.bulkPut(partnerGroups);
        counts.partnerGroups = partnerGroups.length;
      }

      const categories = getStorageItem<CategoryRecord>(STORAGE_KEYS.CATEGORIES);
      if (categories.length > 0) {
        await db.categories.bulkPut(categories);
        counts.categories = categories.length;
      }

      const users = getStorageItem<UserRecord>(STORAGE_KEYS.USERS);
      if (users.length > 0) {
        await db.users.bulkPut(users);
        counts.users = users.length;
      }

      const accounts = getStorageItem<AccountRecord>(STORAGE_KEYS.ACCOUNTS);
      if (accounts.length > 0) {
        await db.accounts.bulkPut(accounts);
        counts.accounts = accounts.length;
      }

      const loans = getStorageItem<LoanRecord>('money_meva_loans');
      if (loans.length > 0) {
        await db.loans.bulkPut(loans);
        counts.loans = loans.length;
      }

      const audit = getStorageItem<AuditRecord>(STORAGE_KEYS.AUDIT);
      if (audit.length > 0) {
        await db.audit.bulkPut(audit);
        counts.audit = audit.length;
      }

      const archive = getStorageItem<ArchiveRecord>('money_meva_archive');
      if (archive.length > 0) {
        await db.archive.bulkPut(archive);
        counts.archive = archive.length;
      }

      const settings = getStorageValue(STORAGE_KEYS.SETTINGS, null);
      if (settings) {
        await db.settings.put({ key: 'app_settings', value: settings });
        counts.settings = 1;
      }

      const auth = getStorageValue(STORAGE_KEYS.AUTH, null);
      if (auth) {
        await db.settings.put({ key: 'auth', value: auth });
        counts.auth = 1;
      }

      const business = getStorageValue(STORAGE_KEYS.BUSINESS, null);
      if (business) {
        await db.settings.put({ key: 'business', value: business });
        counts.business = 1;
      }

      const session = getStorageValue('money_meva_session', null);
      if (session) {
        await db.settings.put({ key: 'session', value: session });
        counts.session = 1;
      }

      const theme = localStorage.getItem('money_meva_theme');
      if (theme) {
        await db.settings.put({ key: 'theme', value: theme });
        counts.theme = 1;
      }

      const pin = localStorage.getItem('money_meva_pin');
      if (pin) {
        await db.settings.put({ key: 'pin', value: pin });
        counts.pin = 1;
      }

      migrationService.markMigrated();
      return { success: true, counts };
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, counts };
    }
  },
};
