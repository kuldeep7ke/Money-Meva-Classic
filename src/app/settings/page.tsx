'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings as SettingsIcon, Moon, Sun, Globe, Clock, Shield, Save, Monitor, Users, AlertTriangle } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePinGuard } from '@/components/PinGuard';

interface AppSettings {
  currency: string;
  dateFormat: string;
  language: string;
  sessionTimeout: number;
  pinEnabled: boolean;
  pin: string;
  businessName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'INR',
  dateFormat: 'dd/MM/yyyy',
  language: 'en',
  sessionTimeout: 15,
  pinEnabled: false,
  pin: '',
  businessName: 'My Business',
};

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

const DATE_FORMATS = [
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'yyyy-MM-dd',
  'dd-MM-yyyy',
  'MMM dd, yyyy',
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
];

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const { requestPin, PinModal } = usePinGuard();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    setMounted(true);
    loadSettings();
  }, []);

  const loadSettings = () => {
    if (typeof window === 'undefined') return;
    const data = localStorage.getItem('money_meva_settings');
    if (data) {
      try {
        setSettings(JSON.parse(data));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem('money_meva_settings', JSON.stringify(settings));
    if (settings.pin) localStorage.setItem('money_meva_pin', settings.pin);
    localStorage.setItem('money_meva_session', JSON.stringify({ timeout: settings.sessionTimeout, pinEnabled: settings.pinEnabled }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset Settings',
      message: 'Reset all settings to default?',
      confirmText: 'Reset',
      variant: 'warning',
    });
    if (ok) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem('money_meva_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Configure your app preferences</p>
          </div>
          <Link href="/" className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>General</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              {mounted && resolvedTheme === 'dark' ? <Moon className="w-5 h-5" style={{ color: 'var(--brand)' }} /> : <Sun className="w-5 h-5" style={{ color: 'var(--brand)' }} />}
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme</label>
                <div className="flex gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'system', label: 'System', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as 'light' | 'dark' | 'system')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition-all`}
                      style={{
                        borderColor: theme === t.value ? 'var(--brand)' : 'var(--border-color)',
                        backgroundColor: theme === t.value ? 'var(--brand)' : 'var(--bg-secondary)',
                        color: theme === t.value ? '#FFFFFF' : 'var(--text-primary)',
                      }}
                    >
                      <t.icon className="w-5 h-5" />
                      <div className="font-medium">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Region & Language</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {DATE_FORMATS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Session</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Auto-logout timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  min="5"
                  max="120"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>PIN Protection</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Lock screen after inactivity</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, pinEnabled: !settings.pinEnabled })}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ backgroundColor: settings.pinEnabled ? 'var(--brand)' : 'var(--border-color)' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                    style={{ left: settings.pinEnabled ? '28px' : '4px' }}
                  />
                </button>
              </div>
              {settings.pinEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Set PIN</label>
                  <input
                    type="password"
                    value={settings.pin || ''}
                    onChange={(e) => setSettings({ ...settings, pin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    placeholder="Enter 4-6 digit PIN"
                    maxLength={6}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t mt-4" style={{ borderColor: 'var(--border-color)' }}>
            <Link href="/users" className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Users className="w-4 h-4" /> Manage Users
            </Link>
            <button onClick={() => requestPin(() => router.push('/danger'))} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:opacity-80" style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: '#ef444408' }}>
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </button>
          </div>
        </div>
      </div>
      {PinModal}
    </div>
  );
}
