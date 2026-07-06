import { db } from '@/lib/db';
import { generateId } from '@/utils';

const isClient = typeof window !== 'undefined';

type CacheStore = Record<string, unknown[]>;

const STORE_KEYS = ['transactions', 'partners', 'partnerGroups', 'categories', 'users', 'accounts', 'loans', 'audit', 'archive'];

class IDBStorage {
  private cache: CacheStore = {};
  private loaded = false;
  private writeQueue: Promise<void> = Promise.resolve();

  private async enqueueWrite(store: string, fn: () => Promise<void>): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      await fn();
    }).catch((e) => {
      console.error(`IDB write failed for ${store}:`, e);
    });
    return this.writeQueue;
  }

  private backupToLocalStorage(store: string, data: unknown[]): void {
    try {
      localStorage.setItem(`idb_backup_${store}`, JSON.stringify(data));
    } catch {}
  }

  private restoreFromLocalStorage(): CacheStore | null {
    const recovered: CacheStore = {};
    for (const key of STORE_KEYS) {
      try {
        const backup = localStorage.getItem(`idb_backup_${key}`);
        recovered[key] = backup ? JSON.parse(backup) : [];
      } catch {
        recovered[key] = [];
      }
    }
    const hasData = STORE_KEYS.some((k) => recovered[k].length > 0);
    return hasData ? recovered : null;
  }

  async init(): Promise<void> {
    if (!isClient || this.loaded) return;
    try {
      const [transactions, partners, partnerGroups, categories, users, accounts, loans, audit, archive] = await Promise.all([
        db.transactions.toArray(),
        db.partners.toArray(),
        db.partnerGroups.toArray(),
        db.categories.toArray(),
        db.users.toArray(),
        db.accounts.toArray(),
        db.loans.toArray(),
        db.audit.toArray(),
        db.archive.toArray(),
      ]);
      this.cache = {
        transactions, partners, partnerGroups, categories, users, accounts, loans, audit, archive,
      };
    } catch (e) {
      console.error('IDB init failed, trying localStorage backup:', e);
      const recovered = this.restoreFromLocalStorage();
      if (recovered) {
        this.cache = recovered;
      } else {
        STORE_KEYS.forEach((k) => { this.cache[k] = []; });
      }
    } finally {
      this.loaded = true;
    }
  }

  private ensureLoaded(): void {
    if (!this.loaded) {
      STORE_KEYS.forEach((k) => { if (!this.cache[k]) this.cache[k] = []; });
      this.loaded = true;
    }
  }

  getAll<T>(store: string): T[] {
    this.ensureLoaded();
    return (this.cache[store] || []) as T[];
  }

  getById<T extends { id: string }>(store: string, id: string): T | undefined {
    this.ensureLoaded();
    return this.getAll<T>(store).find((item) => item.id === id);
  }

  create<T extends { id: string }>(store: string, table: keyof typeof db, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    this.ensureLoaded();
    const now = new Date().toISOString();
    const record = { ...data, id: generateId(), createdAt: now, updatedAt: now } as unknown as T;
    (this.cache[store] as T[]).push(record);
    this.enqueueWrite(store, async () => {
      await (db[table] as any).put(record);
      this.backupToLocalStorage(store, this.cache[store]);
    });
    return record;
  }

  update<T extends { id: string }>(store: string, table: keyof typeof db, id: string, updates: Partial<T>): T | null {
    this.ensureLoaded();
    const items = this.getAll<T>(store);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    items[index] = updated;
    this.enqueueWrite(store, async () => {
      await (db[table] as any).put(updated);
      this.backupToLocalStorage(store, items);
    });
    return updated;
  }

  delete(store: string, table: keyof typeof db, id: string): boolean {
    this.ensureLoaded();
    const items = this.getAll<{ id: string }>(store);
    const filtered = items.filter((item) => item.id !== id);
    this.cache[store] = filtered;
    this.enqueueWrite(store, async () => {
      await (db[table] as any).delete(id);
      this.backupToLocalStorage(store, filtered);
    });
    return true;
  }

  bulkDelete(store: string, table: keyof typeof db, ids: string[]): boolean {
    this.ensureLoaded();
    const idSet = new Set(ids);
    const items = this.getAll<{ id: string }>(store);
    this.cache[store] = items.filter((item) => !idSet.has(item.id));
    this.enqueueWrite(store, async () => {
      await (db[table] as any).bulkDelete(ids);
      this.backupToLocalStorage(store, this.cache[store]);
    });
    return true;
  }

  async set(store: string, table: keyof typeof db, data: unknown[]): Promise<void> {
    this.ensureLoaded();
    this.cache[store] = data;
    this.backupToLocalStorage(store, data);
    await this.enqueueWrite(store, async () => {
      await (db[table] as any).clear();
      if (data.length > 0) {
        await (db[table] as any).bulkPut(data);
      }
    });
  }

  clear(store: string, table: keyof typeof db): void {
    this.ensureLoaded();
    this.cache[store] = [];
    this.backupToLocalStorage(store, []);
    this.enqueueWrite(store, async () => {
      await (db[table] as any).clear();
    });
  }

  async flush(): Promise<void> {
    await this.writeQueue;
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const record = await db.settings.get(key);
    return record ? (record.value as T) : defaultValue;
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await db.settings.put({ key, value });
  }

  getSettingSync<T>(key: string, defaultValue: T): T {
    const cached = this.cache[`_setting_${key}`];
    if (cached !== undefined) return cached as T;
    return defaultValue;
  }

  setSettingCache(key: string, value: unknown): void {
    this.cache[`_setting_${key}`] = [value];
  }
}

export const idbStorage = new IDBStorage();
