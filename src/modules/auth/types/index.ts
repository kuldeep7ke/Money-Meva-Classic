export type UserRole = 'admin' | 'manager' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface UserSession {
  userId: string;
  loginAt: string;
  expiresAt: string;
}

export interface Permission {
  action: string;
  resource: string;
  allowed: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'transactions.create', 'transactions.read', 'transactions.update', 'transactions.delete',
    'accounts.create', 'accounts.read', 'accounts.update', 'accounts.delete',
    'partners.create', 'partners.read', 'partners.update', 'partners.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'loans.create', 'loans.read', 'loans.update', 'loans.delete',
    'reports.read', 'reports.export',
    'settings.read', 'settings.update',
    'backup.export', 'backup.import', 'backup.clear',
    'audit.read', 'audit.clear',
    'archive.read', 'archive.restore', 'archive.delete',
    'danger.clean_all', 'danger.reset',
  ],
  manager: [
    'transactions.create', 'transactions.read', 'transactions.update', 'transactions.delete',
    'accounts.create', 'accounts.read', 'accounts.update', 'accounts.delete',
    'partners.create', 'partners.read', 'partners.update', 'partners.delete',
    'categories.create', 'categories.read', 'categories.update', 'categories.delete',
    'loans.create', 'loans.read', 'loans.update', 'loans.delete',
    'reports.read', 'reports.export',
    'settings.read',
    'backup.export', 'backup.import',
    'audit.read',
    'archive.read', 'archive.restore',
  ],
  user: [
    'transactions.create', 'transactions.read', 'transactions.update',
    'accounts.read',
    'partners.read',
    'categories.read',
    'loans.read',
    'reports.read',
    'settings.read',
  ],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  user: 'User',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#ef4444',
  manager: '#f59e0b',
  user: '#3b82f6',
};
