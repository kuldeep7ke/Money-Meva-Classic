'use client';

import Link from 'next/link';
import { Home, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Terms & Conditions</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
            <Home className="w-5 h-5" /> Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" style={{ color: 'var(--brand)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Acceptance of Terms</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              By accessing or using Money Meva, you agree to be bound by these Terms and Conditions.
              If you do not agree with any part of these terms, you may not use the application.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>1. Use License</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Permission is granted to use Money Meva for personal and commercial financial management.
              This license does not include right to modify, distribute, sell, or derivative works
              based on the application.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>2. User Responsibilities</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              You are responsible for maintaining the confidentiality of your data and PIN.
              You are responsible for all activities that occur under your use of the application.
              You agree to regularly back up your data.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>3. Data Accuracy</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva is a tool for recording and tracking financial data. We do not guarantee
              the accuracy of calculations or reports. You are responsible for verifying all
              financial information. This application is not a substitute for professional financial advice.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>4. Data Loss</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Since all data is stored locally in your browser, data may be lost if you clear browser
              data, switch browsers, or experience device failure. We strongly recommend regular backups.
              We are not responsible for any data loss.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>5. Limitation of Liability</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Money Meva is provided &quot;as is&quot; without warranties of any kind. We shall not be liable
              for any damages arising from the use or inability to use the application, including
              but not limited to data loss, financial losses, or business interruptions.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>6. Modifications</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the application after changes
              constitutes acceptance of the modified terms.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>7. Governing Law</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              These terms shall be governed by and construed in accordance with applicable laws.
              Any disputes shall be resolved in the appropriate courts of jurisdiction.
            </p>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>8. Contact</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              For questions about these Terms & Conditions, contact us at{' '}
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
