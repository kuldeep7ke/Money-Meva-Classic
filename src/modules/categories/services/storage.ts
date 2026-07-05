import { Category, DEFAULT_CATEGORIES } from '@/modules/categories/types';
import { idbStorage } from '@/lib/idbStorage';
import { archiveService } from '@/modules/archive/services/storage';

export const categoryService = {
  getAll: () => idbStorage.getAll<Category>('categories'),

  getById: (id: string) => idbStorage.getById<Category>('categories', id),

  getRecent: (limit: number = 10) => {
    return idbStorage.getAll<Category>('categories')
      .filter((item) => item.lastUsedAt && !item.isArchived)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
      .slice(0, limit);
  },

  getMostUsed: (limit: number = 10) => {
    return idbStorage.getAll<Category>('categories')
      .filter((item) => !item.isArchived)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  },

  getByType: (type: 'income' | 'expense' | 'both') => {
    return idbStorage.getAll<Category>('categories')
      .filter((item) => !item.isArchived && (item.type === type || item.type === 'both'));
  },

  search: (query: string) => {
    const items = idbStorage.getAll<Category>('categories');
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        !item.isArchived &&
        (item.name.toLowerCase().includes(lower) || item.color.toLowerCase().includes(lower))
    );
  },

  create: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    return idbStorage.create<Category>('categories', 'categories', { ...category, usageCount: 0 } as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
  },

  update: (id: string, updates: Partial<Category>) => {
    return idbStorage.update<Category>('categories', 'categories', id, updates);
  },

  incrementUsage: (id: string) => {
    const cat = idbStorage.getById<Category>('categories', id);
    if (!cat) return null;
    return idbStorage.update<Category>('categories', 'categories', id, {
      usageCount: cat.usageCount + 1,
      lastUsedAt: new Date().toISOString(),
    });
  },

  archive: (id: string) => {
    return categoryService.update(id, { isArchived: true });
  },

  restore: (id: string) => {
    return categoryService.update(id, { isArchived: false });
  },

  delete: (id: string) => {
    const item = idbStorage.getById<Category>('categories', id);
    if (item) archiveService.addToArchive('category', item);
    return idbStorage.delete('categories', 'categories', id);
  },

  seedDefaults: (businessId: string = 'default') => {
    const existing = idbStorage.getAll<Category>('categories');
    if (existing.length > 0) return existing;

    const now = new Date().toISOString();
    const seeded: Category[] = DEFAULT_CATEGORIES.map(
      (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => ({
        ...cat,
        businessId,
        id: crypto.randomUUID(),
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      })
    );
    idbStorage.set('categories', 'categories', seeded);
    return seeded;
  },

  clear: () => {
    idbStorage.clear('categories', 'categories');
  },
};
