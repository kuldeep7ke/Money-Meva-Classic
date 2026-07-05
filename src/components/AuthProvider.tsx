'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSession, logoutUser } from '@/lib/localAuth';
import { setUserId } from '@/lib/store';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session.user) {
      setUserId(session.user.id);
      setUser({ id: session.user.id, email: session.user.email });
      setProfile({
        id: session.user.id,
        full_name: session.user.full_name,
        currency: session.user.currency,
        onboarding_completed: session.user.onboarding_completed,
        email: session.user.email,
      });
    } else {
      setUserId('local-user');
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    logoutUser();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
