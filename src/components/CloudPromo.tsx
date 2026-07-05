'use client';

import { useEffect, useState } from 'react';
import { Cloud, Globe, Database, Send, X, ExternalLink } from 'lucide-react';

const PROMO_KEY = 'money_meva_cloud_promo';

export default function CloudPromo() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem(PROMO_KEY);
    if (last) {
      const daysSince = (Date.now() - Number(last)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }
    const t = setTimeout(() => {
      if (Math.random() < 0.3) {
        setVisible(true);
      }
    }, 60000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(PROMO_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="max-w-md w-full rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6366f118' }}>
              <Cloud className="w-6 h-6" style={{ color: '#6366f1' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Cloud Sync Available</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Take your data wherever you go</p>
            </div>
            <button onClick={dismiss} className="p-1 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#6366f118' }}>
                <Database className="w-4 h-4" style={{ color: '#6366f1' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Supabase Cloud Version</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Sync across all your devices. Your data stays backed up and accessible anywhere — with real-time collaboration.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f59e0b18' }}>
                <Globe className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>WordPress Version</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Self-host on your own server. Full control over your data with WordPress integration.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#22c55e18' }}>
                <Send className="w-4 h-4" style={{ color: '#22c55e' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Available on Telegram</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Get updates, support, and cloud plan inquiries directly via Telegram.</p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <a
              href="mailto:info@marathimeva.com"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: '#6366f1' }}
            >
              <ExternalLink className="w-4 h-4" /> Contact Us — info@marathimeva.com
            </a>
            <a
              href="https://www.marathimeva.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-xl hover:opacity-80 transition-all border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <Globe className="w-4 h-4" /> Visit www.marathimeva.com
            </a>
            <button
              onClick={dismiss}
              className="block w-full text-center text-xs hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              Dismiss — remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
