'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/modules/auth/services/storage';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Shield, User, Mail, Lock, CheckCircle, ChevronRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) { setError('Name is required'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return; }
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return; }
    if (pin !== confirmPin) { setError('PINs do not match'); return; }

    authService.onboard(name.trim(), email.trim(), pin);
    refreshUser();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--brand)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome to Money Meva</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Set up your admin account to get started</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: step >= s ? 'var(--brand)' : 'var(--bg-secondary)', color: step >= s ? 'white' : 'var(--text-muted)' }}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className="w-12 h-0.5" style={{ backgroundColor: step > s ? 'var(--brand)' : 'var(--bg-secondary)' }} />}
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {step === 1 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Your Info</h2>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Enter your name" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Enter your email" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Set PIN</h2>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose a 4-6 digit PIN to secure your account</p>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>PIN *</label>
                <input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-3 py-2 text-sm border rounded-lg text-center text-2xl tracking-[0.5em]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="••••" maxLength={6} autoFocus />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Confirm PIN *</label>
                <input type="password" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-3 py-2 text-sm border rounded-lg text-center text-2xl tracking-[0.5em]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="••••" maxLength={6} />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Account</h2>
              </div>
              <div className="p-4 rounded-lg space-y-2" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Name</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Role</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: '#ef444422', color: '#ef4444' }}>Administrator</span>
                </div>
              </div>
              <div className="p-3 rounded-lg border" style={{ backgroundColor: '#f59e0b12', borderColor: '#f59e0b33' }}>
                <p className="text-xs" style={{ color: '#f59e0b' }}>As Administrator, you have full access to all features including user management, data cleanup, and system settings.</p>
              </div>
            </>
          )}

          {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}

          <div className="flex gap-2 pt-2">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Back</button>
            )}
            {step < 3 ? (
              <button onClick={() => { setError(''); if (step === 1 && (!name.trim() || !email.trim() || !email.includes('@'))) { setError('Please fill in all fields'); return; } if (step === 2 && (pin.length < 4 || pin !== confirmPin)) { setError('PIN must be 4+ digits and match'); return; } setStep(step + 1); }} className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="flex-1 px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>Create Account</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
