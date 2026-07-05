import { idbStorage } from '@/lib/idbStorage';

export interface ArchiveItem {
  id: string;
  entityType: 'transaction' | 'partner' | 'category';
  entityId: string;
  data: any;
  deletedAt: string;
  deletedBy: string;
  restoreCount: number;
}

export const archiveService = {
  getAll: () => idbStorage.getAll<ArchiveItem>('archive'),

  getByType: (entityType: ArchiveItem['entityType']) => {
    return idbStorage.getAll<ArchiveItem>('archive').filter((item) => item.entityType === entityType);
  },

  getById: (id: string) => {
    return idbStorage.getById<ArchiveItem>('archive', id);
  },

  addToArchive: (entityType: ArchiveItem['entityType'], data: any, deletedBy: string = 'user-1'): ArchiveItem => {
    return idbStorage.create<ArchiveItem>('archive', 'archive', {
      entityType,
      entityId: data.id,
      data: { ...data },
      deletedAt: new Date().toISOString(),
      deletedBy,
      restoreCount: 0,
    });
  },

  restore: (archiveId: string): ArchiveItem | null => {
    const item = idbStorage.getById<ArchiveItem>('archive', archiveId);
    if (!item) return null;
    return idbStorage.update<ArchiveItem>('archive', 'archive', archiveId, {
      restoreCount: item.restoreCount + 1,
    });
  },

  permanentlyDelete: (archiveId: string): boolean => {
    return idbStorage.delete('archive', 'archive', archiveId);
  },

  clear: () => {
    idbStorage.clear('archive', 'archive');
  },

  getStats: () => {
    const items = idbStorage.getAll<ArchiveItem>('archive');
    return {
      total: items.length,
      transactions: items.filter((i) => i.entityType === 'transaction').length,
      partners: items.filter((i) => i.entityType === 'partner').length,
      categories: items.filter((i) => i.entityType === 'category').length,
    };
  },
};
