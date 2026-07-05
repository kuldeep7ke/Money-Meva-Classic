'use client';

import Link from 'next/link';
import { Home, Mail, Globe, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Contact Us</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>We&apos;d love to hear from you</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
            <Home className="w-5 h-5" /> Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Mail className="w-5 h-5 text-white" />, title: 'Email', value: 'info@marathimeva.com', color: '#22c55e' },
              { icon: <Globe className="w-5 h-5 text-white" />, title: 'Website', value: 'www.marathimeva.com', color: '#3b82f6' },
              { icon: <MapPin className="w-5 h-5 text-white" />, title: 'Location', value: 'Mumbai, India', color: '#f59e0b' },
            ].map((c, i) => (
              <div key={i} className="p-5 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: c.color }}>{c.icon}</div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{c.value}</p>
              </div>
            ))}
          </div>



          <div className="text-center pt-4 pb-8" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">© {new Date().getFullYear()} Money Meva. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
