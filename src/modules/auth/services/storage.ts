import { User, UserSession, UserRole, ROLE_PERMISSIONS } from '@/modules/auth/types';
import { idbStorage } from '@/lib/idbStorage';

function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('money_meva_auth');
  if (!data) return null;
  try { return JSON.parse(data) as UserSession; } catch { return null; }
}

function setSession(session: UserSession | null): void {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem('money_meva_auth', JSON.stringify(session));
  } else {
    localStorage.removeItem('money_meva_auth');
  }
}

export const authService = {
  isOnboarded: (): boolean => {
    return idbStorage.getAll<User>('users').length > 0;
  },

  getUsers: (): User[] => {
    return idbStorage.getAll<User>('users');
  },

  getUserById: (id: string): User | undefined => {
    return idbStorage.getById<User>('users', id);
  },

  getCurrentUser: (): User | null => {
    const session = getSession();
    if (!session) return null;
    const user = authService.getUserById(session.userId);
    if (!user || !user.isActive) return null;
    if (new Date(session.expiresAt) < new Date()) {
      authService.logout();
      return null;
    }
    return user;
  },

  onboard: (name: string, email: string, pin: string): User => {
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role: 'admin',
      pin,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    idbStorage.set('users', 'users', [user]);
    authService.loginByPin(pin);
    return user;
  },

  loginByPin: (pin: string): User | null => {
    const users = authService.getUsers();
    const user = users.find((u) => u.pin === pin && u.isActive);
    if (!user) return null;
    const session: UserSession = {
      userId: user.id,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setSession(session);
    authService.updateUser(user.id, { lastLogin: new Date().toISOString() });
    return user;
  },

  logout: (): void => {
    setSession(null);
  },

  createUser: (data: { name: string; email: string; role: UserRole; pin: string }): User => {
    const user: User = {
      id: crypto.randomUUID(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const users = authService.getUsers();
    users.push(user);
    idbStorage.set('users', 'users', users);
    return user;
  },

  updateUser: (id: string, updates: Partial<User>): User | null => {
    return idbStorage.update<User>('users', 'users', id, updates);
  },

  deleteUser: (id: string): boolean => {
    return idbStorage.delete('users', 'users', id);
  },

  hasPermission: (permission: string): boolean => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  },

  canAccess: (resource: string, action: string): boolean => {
    return authService.hasPermission(`${resource}.${action}`);
  },

  getSession: (): UserSession | null => {
    return getSession();
  },

  clear: () => {
    idbStorage.clear('users', 'users');
  },
};
