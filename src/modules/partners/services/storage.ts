import { Partner, PartnerGroup, DEFAULT_PARTNERS, DEFAULT_PARTNER_GROUPS } from '@/modules/partners/types';
import { idbStorage } from '@/lib/idbStorage';
import { db } from '@/lib/db';
import { archiveService } from '@/modules/archive/services/storage';

export const partnerService = {
  getAll: () => idbStorage.getAll<Partner>('partners'),

  getById: (id: string) => idbStorage.getById<Partner>('partners', id),

  getActive: () => {
    return idbStorage.getAll<Partner>('partners').filter((p) => p.status === 'active');
  },

  getByGroup: (groupId: string) => {
    return idbStorage.getAll<Partner>('partners').filter((p) => p.groupId === groupId);
  },

  search: (query: string) => {
    const items = idbStorage.getAll<Partner>('partners');
    const lower = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.email?.toLowerCase().includes(lower) ||
        item.phone?.includes(lower)
    );
  },

  create: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    return idbStorage.create<Partner>('partners', 'partners', partner);
  },

  update: (id: string, updates: Partial<Partner>) => {
    return idbStorage.update<Partner>('partners', 'partners', id, updates);
  },

  archive: (id: string) => {
    return partnerService.update(id, { status: 'archived' });
  },

  restore: (id: string) => {
    return partnerService.update(id, { status: 'active' });
  },

  delete: (id: string) => {
    const item = idbStorage.getById<Partner>('partners', id);
    if (item) archiveService.addToArchive('partner', item);
    return idbStorage.delete('partners', 'partners', id);
  },

  updateBalance: (id: string, amount: number) => {
    const partner = partnerService.getById(id);
    if (!partner) return null;
    return partnerService.update(id, {
      currentBalance: partner.currentBalance + amount,
    });
  },

  seedDefaults: () => {
    const existing = idbStorage.getAll<Partner>('partners');
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const seeded: Partner[] = DEFAULT_PARTNERS.map(
        (p: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => ({
          ...p,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        })
      );
      idbStorage.set('partners', 'partners', seeded);
    }

    const existingGroups = idbStorage.getAll<PartnerGroup>('partnerGroups');
    if (existingGroups.length === 0) {
      const now = new Date().toISOString();
      const seeded: PartnerGroup[] = DEFAULT_PARTNER_GROUPS.map(
        (g: Omit<PartnerGroup, 'id' | 'createdAt' | 'updatedAt'>) => ({
          ...g,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        })
      );
      idbStorage.set('partnerGroups', 'partnerGroups', seeded);
    }
  },

  groups: {
    getAll: () => idbStorage.getAll<PartnerGroup>('partnerGroups'),

    getById: (id: string) => idbStorage.getById<PartnerGroup>('partnerGroups', id),

    create: (group: Omit<PartnerGroup, 'id' | 'createdAt' | 'updatedAt'>) => {
      return idbStorage.create<PartnerGroup>('partnerGroups', 'partnerGroups', group);
    },

    update: (id: string, updates: Partial<PartnerGroup>) => {
      return idbStorage.update<PartnerGroup>('partnerGroups', 'partnerGroups', id, updates);
    },

    archive: (id: string) => {
      return partnerService.groups.update(id, { isArchived: true });
    },

    restore: (id: string) => {
      return partnerService.groups.update(id, { isArchived: false });
    },

    delete: (id: string) => {
      return idbStorage.delete('partnerGroups', 'partnerGroups', id);
    },

    clear: () => {
      idbStorage.clear('partnerGroups', 'partnerGroups');
    },
  },

  clear: () => {
    idbStorage.clear('partners', 'partners');
  },
};
