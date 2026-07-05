'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setFormName('');
    setFormEmail('');
    setFormSubject('');
    setFormMessage('');
  };

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
              { icon: <Mail className="w-5 h-5 text-white" />, title: 'Email', value: 'support@moneymeva.com', color: '#22c55e' },
              { icon: <Phone className="w-5 h-5 text-white" />, title: 'Phone', value: '+91 98765 43210', color: '#3b82f6' },
              { icon: <MapPin className="w-5 h-5 text-white" />, title: 'Location', value: 'Mumbai, India', color: '#f59e0b' },
            ].map((c, i) => (
              <div key={i} className="p-5 rounded-lg border text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: c.color }}>{c.icon}</div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Send a Message</h2>

            {sent && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#22c55e22', border: '1px solid #22c55e' }}>
                <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                <span style={{ color: '#22c55e' }}>Message sent! We&apos;ll get back to you soon.</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                  <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" value={formSubject} onChange={(e) => setFormSubject(e.target.value)} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Message *</label>
                <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} rows={5} placeholder="Your message..." />
              </div>
              <button onClick={handleSubmit} disabled={!formName.trim() || !formEmail.trim() || !formMessage.trim()} className="flex items-center gap-2 px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>
                <Send className="w-4 h-4" /> Send Message
              </button>
            </div>
          </div>

          <div className="text-center pt-4 pb-8" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">© {new Date().getFullYear()} Money Meva. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
