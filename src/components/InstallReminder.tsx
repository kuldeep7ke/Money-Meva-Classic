'use client';

import { Smartphone, Monitor, Apple, X } from 'lucide-react';
import Link from 'next/link';

const INSTALL_KEY = 'money_meva_install_reminder';

export default function InstallReminder({ onDismiss }: { onDismiss: () => void }) {
  const dismiss = () => {
    localStorage.setItem(INSTALL_KEY, String(Date.now()));
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="max-w-md w-full rounded-2xl border overflow-hidden shadow-2xl animate-in" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#22c55e18' }}>
              <Smartphone className="w-6 h-6" style={{ color: '#22c55e' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Install Money Meva</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Get the best experience with one tap</p>
            </div>
            <button onClick={dismiss} className="p-1 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Add Money Meva to your home screen for a faster, app-like experience. Works offline and opens instantly.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>How to install</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f618' }}>
                  <Monitor className="w-4 h-4" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Desktop</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click the install icon in the address bar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#22c55e18' }}>
                  <Smartphone className="w-4 h-4" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Android</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Chrome menu &rarr; Install app</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#8b5cf618' }}>
                  <Apple className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>iPhone / iPad</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Share button &rarr; Add to Home Screen</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <Link
              href="/install"
              onClick={dismiss}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: '#22c55e' }}
            >
              Learn More
            </Link>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 text-sm font-medium rounded-xl hover:opacity-80 transition-all border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              Not Now
            </button>
          </div>
          <p className="text-[10px] text-center mt-3" style={{ color: 'var(--text-muted)' }}>Reminder will reappear in 7 days</p>
        </div>
      </div>
    </div>
  );
}
