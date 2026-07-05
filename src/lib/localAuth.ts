export interface LocalUserProfile {
  full_name: string;
  phone: string;
  currency: string;
  monthly_income: string;
  primary_goal: string;
  occupation: string;
  business_name: string;
  business_type: string;
  onboarding_step: number;
}

export interface LocalUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  currency: string;
  monthly_income: string;
  primary_goal: string;
  occupation: string;
  business_name: string;
  business_type: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  createdAt: string;
  lastLoginAt?: string;
}

export function getDefaultProfile(): LocalUserProfile {
  return {
    full_name: '',
    phone: '',
    currency: 'INR',
    monthly_income: '',
    primary_goal: '',
    occupation: '',
    business_name: '',
    business_type: '',
    onboarding_step: 1,
  };
}

import { setUserId } from '@/lib/store';

const STORAGE_KEY = 'money_meva_users';
const SESSION_KEY = 'money_meva_session';

function getUsers(): LocalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function getSession(): { user: Omit<LocalUser, 'password'> | null } {
  if (typeof window === 'undefined') return { user: null };
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return { user: session };
  } catch {
    return { user: null };
  }
}

export function registerUser(email: string, password: string, fullName: string): { user: Omit<LocalUser, 'password'> | null; error?: string } {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { user: null, error: 'Email already registered' };
  }
  const now = new Date().toISOString();
  const newUser: LocalUser = {
    id: 'user_' + Date.now(),
    email,
    password,
    full_name: fullName,
    phone: '',
    currency: 'INR',
    monthly_income: '',
    primary_goal: '',
    occupation: '',
    business_name: '',
    business_type: '',
    onboarding_completed: false,
    onboarding_step: 1,
    createdAt: now,
    lastLoginAt: now,
  };
  users.push(newUser);
  saveUsers(users);
  setUserId(newUser.id);
  const { password: removedPassword, ...safeUser } = newUser;
  void removedPassword;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return { user: safeUser };
}

export function loginUser(email: string, password: string): { user: Omit<LocalUser, 'password'> | null; error?: string } {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return { user: null, error: 'User not found' };
  }
  if (user.password !== password) {
    return { user: null, error: 'Invalid password' };
  }
  return { user: setActiveUser(user.id) };
}

export function switchUser(userId: string): boolean {
  return Boolean(setActiveUser(userId));
}

export function getAllUsers(): Omit<LocalUser, 'password'>[] {
  return getUsers().map(user => {
    const { password: removedPassword, ...safeUser } = user;
    void removedPassword;
    return safeUser;
  });
}

export function removeUser(userId: string): boolean {
  const users = getUsers();
  const nextUsers = users.filter(u => u.id !== userId);
  if (nextUsers.length === users.length) return false;
  saveUsers(nextUsers);

  const session = getSession().user;
  if (session?.id === userId) {
    logoutUser();
  }

  return true;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  setUserId('local-user');
}

export function updateProfile(userId: string, updates: Partial<Omit<LocalUser, 'id' | 'password' | 'email'>>): Omit<LocalUser, 'password'> | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  const { password: removedPassword, ...safeUser } = users[idx];
  void removedPassword;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

function setActiveUser(userId: string): Omit<LocalUser, 'password'> | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], lastLoginAt: new Date().toISOString() };
  saveUsers(users);

  const { password: removedPassword, ...safeUser } = users[idx];
  void removedPassword;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  setUserId(users[idx].id);
  return safeUser;
}
