import { AuditLog } from '@/types';
import { idbStorage } from '@/lib/idbStorage';

export const auditService = {
  log: (params: {
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    businessId: string;
    details?: string;
  }): AuditLog => {
    return idbStorage.create<AuditLog>('audit', 'audit', {
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      userId: params.userId,
      businessId: params.businessId,
      details: params.details,
      timestamp: new Date().toISOString(),
    });
  },

  getLogs: (filters?: { entity?: string; userId?: string; dateFrom?: string; dateTo?: string }): AuditLog[] => {
    let logs = idbStorage.getAll<AuditLog>('audit');

    if (filters?.entity) {
      logs = logs.filter((log) => log.entity === filters.entity);
    }
    if (filters?.userId) {
      logs = logs.filter((log) => log.userId === filters.userId);
    }
    if (filters?.dateFrom) {
      logs = logs.filter((log) => new Date(log.timestamp) >= new Date(filters.dateFrom!));
    }
    if (filters?.dateTo) {
      logs = logs.filter((log) => new Date(log.timestamp) <= new Date(filters.dateTo!));
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  logTransaction: (action: string, transactionId: string, userId: string, businessId: string, details?: string) => {
    return auditService.log({
      action: `Transaction ${action}`,
      entity: 'transaction',
      entityId: transactionId,
      userId,
      businessId,
      details,
    });
  },

  logPartner: (action: string, partnerId: string, userId: string, businessId: string, details?: string) => {
    return auditService.log({
      action: `Partner ${action}`,
      entity: 'partner',
      entityId: partnerId,
      userId,
      businessId,
      details,
    });
  },

  logCategory: (action: string, categoryId: string, userId: string, businessId: string, details?: string) => {
    return auditService.log({
      action: `Category ${action}`,
      entity: 'category',
      entityId: categoryId,
      userId,
      businessId,
      details,
    });
  },

  logUser: (action: string, userId: string, businessId: string, details?: string) => {
    return auditService.log({
      action: `User ${action}`,
      entity: 'user',
      entityId: userId,
      userId,
      businessId,
      details,
    });
  },

  logBackup: (action: string, userId: string, businessId: string, details?: string) => {
    return auditService.log({
      action: `Backup ${action}`,
      entity: 'backup',
      entityId: crypto.randomUUID(),
      userId,
      businessId,
      details,
    });
  },

  getAll: () => idbStorage.getAll<AuditLog>('audit'),

  clear: () => idbStorage.clear('audit', 'audit'),
};
