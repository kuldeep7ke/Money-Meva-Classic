'use client';

import Link from 'next/link';
import { Home, Download, Smartphone, Monitor, Apple, Shield, Zap, Battery, ArrowLeft } from 'lucide-react';

export default function InstallPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/more" className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Install App</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Add Money Meva to your device for the best experience</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Battery className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Why Install?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <Zap className="w-4 h-4" />, title: 'Faster Access', desc: 'Open instantly from your home screen, no need to type the URL every time' },
                { icon: <Shield className="w-4 h-4" />, title: 'Works Offline', desc: 'View your data even without internet — all your finances are stored locally' },
                { icon: <Smartphone className="w-4 h-4" />, title: 'App-Like Experience', desc: 'Full-screen mode with no browser tabs or address bar distractions' },
                { icon: <Download className="w-4 h-4" />, title: 'Automatic Updates', desc: 'Always runs the latest version — updates apply automatically on launch' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }}>
                    <span style={{ color: 'white' }}>{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Desktop (Chrome / Edge)</h2>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Look at the right end of the address bar', detail: 'You will see a small install icon (a monitor with a download arrow)' },
                { step: '2', text: 'Click the install icon', detail: 'A dialog will appear asking if you want to install Money Meva' },
                { step: '3', text: 'Click "Install"', detail: 'The app will open in its own window, just like a desktop application' },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>{item.step}</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#3b82f610', border: '1px solid #3b82f630' }}>
              <p className="text-xs" style={{ color: '#3b82f6' }}>Tip: If you don&apos;t see the install icon, click the three-dot menu (⋮) → Cast, save, and share → Install page as app → Install</p>
            </div>
          </div>

          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5" style={{ color: '#22c55e' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Android (Chrome)</h2>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Open Money Meva in Chrome', detail: 'A banner may appear at the bottom saying "Install Money Meva?"' },
                { step: '2', text: 'Tap the three-dot menu (⋮)', detail: 'Located at the top-right corner of Chrome' },
                { step: '3', text: 'Tap "Install app"', detail: 'You may see it as "Add to Home screen" on some devices' },
                { step: '4', text: 'Tap "Install"', detail: 'The app will be added to your home screen with the Money Meva icon' },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>{item.step}</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5" style={{ color: '#8b5cf6' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>iPhone / iPad (Safari)</h2>
            </div>
            <ol className="space-y-4">
              {[
                { step: '1', text: 'Open Money Meva in Safari', detail: 'Make sure you are on the website, not in another browser' },
                { step: '2', text: 'Tap the Share button (☐↑)', detail: 'Located at the bottom-center of Safari on iPhone, top-right on iPad' },
                { step: '3', text: 'Scroll down and tap "Add to Home Screen"', detail: 'You may need to scroll past the suggested contacts and apps' },
                { step: '4', text: 'Tap "Add" in the top-right corner', detail: 'The app will appear on your home screen with the Money Meva icon' },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>{item.step}</div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-6 rounded-xl border" style={{ backgroundColor: '#FF8A3D10', borderColor: '#FF8A3D30' }}>
            <div className="flex items-center gap-2 mb-3">
              <Download className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>Installed already? Open Money Meva from your home screen and enjoy the full app experience!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
