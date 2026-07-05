'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface SessionContextType {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
  setInterval: (minutes: number) => void;
  pinEnabled: boolean;
  setPinEnabled: (enabled: boolean) => void;
  pin: string;
  setPin: (pin: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = 'money_meva_session';
const PIN_KEY = 'money_meva_pin';

function getSettings() {
  if (typeof window === 'undefined') return { timeout: 15, pinEnabled: false };
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { return { timeout: 15, pinEnabled: false }; }
  }
  return { timeout: 15, pinEnabled: false };
}

function saveSettings(settings: { timeout: number; pinEnabled: boolean }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getPin(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PIN_KEY) || '';
}

function savePin(pin: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_KEY, pin);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [settings, setSettings] = useState({ timeout: 15, pinEnabled: false });
  const [pin, setPinState] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getSettings();
    setSettings(s);
    setPinState(getPin());
  }, []);

  useEffect(() => {
    if (!mounted || !settings.pinEnabled) return;

    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsLocked(true), settings.timeout * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => document.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, resetTimer));
    };
  }, [mounted, settings.pinEnabled, settings.timeout]);

  const lock = useCallback(() => {
    if (settings.pinEnabled && pin) setIsLocked(true);
  }, [settings.pinEnabled, pin]);

  const unlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  const setInterval = useCallback((minutes: number) => {
    const newSettings = { ...settings, timeout: minutes };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const setPinEnabled = useCallback((enabled: boolean) => {
    const newSettings = { ...settings, pinEnabled: enabled };
    setSettings(newSettings);
    saveSettings(newSettings);
  }, [settings]);

  const setPin = useCallback((newPin: string) => {
    setPinState(newPin);
    savePin(newPin);
  }, []);

  return (
    <SessionContext.Provider value={{ isLocked, lock, unlock, setInterval, pinEnabled: settings.pinEnabled, setPinEnabled, pin, setPin }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}

export function SessionLockScreen() {
  const { isLocked, unlock, pin } = useSession();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleUnlock = () => {
    if (input === pin) {
      unlock();
      setInput('');
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="p-8 rounded-lg border shadow-lg" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand)' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Session Locked</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Enter PIN to unlock</p>
        </div>
        <input
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] border rounded-lg mb-4"
          style={{ borderColor: error ? '#ef4444' : 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          placeholder="••••"
          autoFocus
          maxLength={6}
        />
        {error && <p className="text-sm text-center mb-4" style={{ color: '#ef4444' }}>Incorrect PIN</p>}
        <button onClick={handleUnlock} className="w-full py-3 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--brand)' }}>Unlock</button>
      </div>
    </div>
  );
}
