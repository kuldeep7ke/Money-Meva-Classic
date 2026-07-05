'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Lock, X, Eye, EyeOff } from 'lucide-react';

interface PinGuardProps {
  children: React.ReactNode;
  onVerified: () => void;
  title?: string;
  message?: string;
}

export function PinGuard({ children, onVerified, title = 'Confirm Action', message = 'Enter your PIN to continue' }: PinGuardProps) {
  const { user } = useAuth();
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPinInput(true);
    setError('');
    setPin('');
  };

  const handleVerify = () => {
    if (!user) return;
    if (pin === user.pin) {
      setShowPinInput(false);
      setPin('');
      onVerified();
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const handleCancel = () => {
    setShowPinInput(false);
    setPin('');
    setError('');
  };

  if (showPinInput) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-sm p-6 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            </div>
            <button onClick={handleCancel}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{message}</p>

          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-3 py-3 text-sm border rounded-lg text-center text-2xl tracking-[0.5em]"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              placeholder="••••"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
            />
            <button onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2">
              <span style={{ color: 'var(--text-muted)' }}>{showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</span>
            </button>
          </div>

          {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}

          <div className="flex gap-2">
            <button onClick={handleCancel} className="flex-1 px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
            <button onClick={handleVerify} disabled={pin.length < 4} className="flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>Verify</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}

export function usePinGuard() {
  const { user } = useAuth();
  const [showPin, setShowPin] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPinValue, setShowPinValue] = useState(false);

  const requestPin = (action: () => void) => {
    setPendingAction(() => action);
    setShowPin(true);
    setPin('');
    setError('');
  };

  const verifyPin = () => {
    if (!user) return;
    if (pin === user.pin) {
      setShowPin(false);
      setPin('');
      setError('');
      pendingAction?.();
      setPendingAction(null);
    } else {
      setError('Invalid PIN');
      setPin('');
    }
  };

  const cancelPin = () => {
    setShowPin(false);
    setPin('');
    setError('');
    setPendingAction(null);
  };

  const PinModal = showPin ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-sm p-6 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Enter PIN to Continue</h3>
          </div>
          <button onClick={cancelPin}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This action requires PIN verification</p>
        <div className="relative">
          <input
            type={showPinValue ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-3 text-sm border rounded-lg text-center text-2xl tracking-[0.5em]"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            placeholder="••••"
            maxLength={6}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') verifyPin(); }}
          />
          <button onClick={() => setShowPinValue(!showPinValue)} className="absolute right-3 top-1/2 -translate-y-1/2">
            <span style={{ color: 'var(--text-muted)' }}>{showPinValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</span>
          </button>
        </div>
        {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}
        <div className="flex gap-2">
          <button onClick={cancelPin} className="flex-1 px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
          <button onClick={verifyPin} disabled={pin.length < 4} className="flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>Verify</button>
        </div>
      </div>
    </div>
  ) : null;

  return { requestPin, PinModal };
}
