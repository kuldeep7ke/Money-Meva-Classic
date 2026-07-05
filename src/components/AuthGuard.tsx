'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const PUBLIC_PATHS = ['/login', '/onboarding'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isOnboarded, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isOnboarded) {
      if (pathname !== '/onboarding') router.push('/onboarding');
      return;
    }

    if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.push('/login');
      return;
    }

    if (isAuthenticated && pathname === '/login') {
      router.push('/');
      return;
    }
  }, [isLoading, isOnboarded, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isOnboarded && pathname !== '/onboarding') return null;
  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) return null;

  return <>{children}</>;
}
