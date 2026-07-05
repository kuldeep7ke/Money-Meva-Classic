'use client';

import Link from 'next/link';
import { Home, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
            <Home className="w-5 h-5" /> Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Introduction</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how
              your information is collected, used, and safeguarded when you use our application.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Data Collection</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva operates entirely offline. All your financial data (transactions, partners, categories, settings)
              is stored locally in your browser&apos;s IndexedDB. We do not collect, transmit, or store any of your data
              on external servers.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. Data Usage</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your data stays on your device and is used solely for the functionality of the application —
              managing transactions, tracking finances, generating reports, and providing insights.
              No data is shared with third parties.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>3. Data Security</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Since all data is stored locally on your device, security depends on your device&apos;s security.
              We recommend using PIN protection, keeping your browser updated, and regularly backing up
              your data using the app&apos;s export feature.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>4. Data Backup & Export</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              You can export your data at any time using the Backup feature. Exported files contain
              all your financial data in JSON format. You are responsible for the security of exported files.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>5. Cookies & Tracking</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva does not use cookies, analytics, tracking pixels, or any form of user tracking.
              The application runs entirely in your browser without any external data connections.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>6. Children&apos;s Privacy</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva is not directed at children under 13. We do not knowingly collect information
              from children. If you are a parent and believe your child has provided us with personal
              information, please contact us.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>7. Changes to This Policy</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the application after changes constitutes
              acceptance of the new policy.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Contact Us</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <span className="font-medium" style={{ color: 'var(--brand)' }}>support@moneymeva.com</span>
            </p>
          </div>

          <div className="text-center pt-4 pb-8" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">© {new Date().getFullYear()} Money Meva. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
