'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/modules/auth/types';
import { authService } from '@/modules/auth/services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  isAuthenticated: boolean;
  login: (pin: string) => User | null;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  const refreshUser = useCallback(() => {
    const onboarded = authService.isOnboarded();
    setIsOnboarded(onboarded);
    if (onboarded) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((pin: string): User | null => {
    const loggedUser = authService.loginByPin(pin);
    if (loggedUser) {
      setUser(loggedUser);
      return loggedUser;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return authService.hasPermission(permission);
  }, [user]);

  const canAccess = useCallback((resource: string, action: string): boolean => {
    return hasPermission(`${resource}.${action}`);
  }, [hasPermission]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        canAccess,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
