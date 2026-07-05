'use client';

import Link from 'next/link';
import { Home, Shield, FileText, Mail, Info } from 'lucide-react';
import { APP_VERSION } from '@/constants';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>About Money Meva</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Shared Finance Management Application</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
            <Home className="w-5 h-5" /> Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand)' }}>
                <span className="text-3xl font-bold text-white">₹</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Money Meva</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Smart Finance Management</p>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva is a comprehensive shared finance management application designed for individuals,
              families, and small businesses. Track transactions, manage partners, monitor loans and investments,
              and gain insights into your financial health.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>App Information</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Version', value: `v${APP_VERSION}` },
                { label: 'License', value: 'Proprietary' },
                { label: 'Platform', value: 'Web (Next.js)' },
                { label: 'Storage', value: 'Offline-first (IndexedDB)' },
                { label: 'Last Updated', value: new Date().toLocaleDateString() },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Features</h2>
            </div>
            <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li>• 13 transaction types (income, expense, transfer, loan, EMI, etc.)</li>
              <li>• Partner management with groups and balance tracking</li>
              <li>• Category management with usage tracking</li>
              <li>• Loan and investment tracking with EMI schedules</li>
              <li>• Recurring transactions with auto-generation</li>
              <li>• Reports and analytics with charts</li>
              <li>• Full backup and restore functionality</li>
              <li>• Archive system for deleted items</li>
              <li>• Session lock with PIN protection</li>
              <li>• Dark mode support</li>
              <li>• Export to CSV, JSON, Excel, PDF</li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Link href="/about" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Info className="w-4 h-4" /> About
            </Link>
            <Link href="/contact" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Mail className="w-4 h-4" /> Contact
            </Link>
            <Link href="/privacy" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Shield className="w-4 h-4" /> Privacy
            </Link>
            <Link href="/terms" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <FileText className="w-4 h-4" /> Terms
            </Link>
          </div>

          <div className="text-center pt-4 pb-8" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">© {new Date().getFullYear()} Money Meva. All rights reserved.</p>
            <p className="text-xs mt-1">Built with ❤️ for better financial management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
