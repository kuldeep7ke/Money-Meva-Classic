'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/storage';
import { User, ROLE_LABELS, ROLE_COLORS } from '@/modules/auth/types';
import { Shield, Lock, ChevronRight, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isOnboarded } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'pin'>('select');

  useEffect(() => {
    if (!isOnboarded) {
      router.push('/onboarding');
      return;
    }
    const allUsers = authService.getUsers().filter((u) => u.isActive);
    setUsers(allUsers);
  }, [isOnboarded, router]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setStep('pin');
    setError('');
    setPin('');
  };

  const handleLogin = () => {
    setError('');
    if (!selectedUser) return;
    if (pin.length < 4) { setError('Enter your PIN'); return; }

    setLoading(true);
    const user = login(pin);
    if (user && user.id === selectedUser.id) {
      router.push('/');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
    setLoading(false);
  };

  const handleBack = () => {
    setStep('select');
    setSelectedUser(null);
    setPin('');
    setError('');
  };

  if (!isOnboarded) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--brand)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Money Meva</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {step === 'select' ? 'Select your account' : `Enter PIN for ${selectedUser?.name}`}
          </p>
        </div>

        {step === 'select' ? (
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border hover:opacity-90 transition-all text-left"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: ROLE_COLORS[u.role] }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                  <p className="text-[10px]" style={{ color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</p>
                </div>
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                <UserIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: ROLE_COLORS[selectedUser?.role || 'user'] }}>
                {selectedUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedUser?.name}</p>
                <p className="text-[10px]" style={{ color: ROLE_COLORS[selectedUser?.role || 'user'] }}>{ROLE_LABELS[selectedUser?.role || 'user']}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-3 text-sm border rounded-lg text-center text-2xl tracking-[0.5em]"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                placeholder="••••"
                maxLength={6}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              />
            </div>

            {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}

            <div className="flex gap-2">
              <button onClick={handleBack} className="px-4 py-2.5 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                Back
              </button>
              <button
                onClick={handleLogin}
                disabled={loading || pin.length < 4}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white rounded-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
