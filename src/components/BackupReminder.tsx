'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Download, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/modules/transactions/services/storage';

const REMINDER_KEY = 'money_meva_backup_reminder';

export default function BackupReminder() {
  const [visible, setVisible] = useState(false);
  const [txCount, setTxCount] = useState(0);

  useEffect(() => {
    const count = storage.transactions.getAll().length;
    setTxCount(count);

    const lastDismissed = localStorage.getItem(REMINDER_KEY);
    if (!lastDismissed) {
      setVisible(true);
      return;
    }
    const daysSinceDismiss = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismiss >= 7) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(REMINDER_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  const isNewUser = txCount < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="max-w-md w-full rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f59e0b18' }}>
              <AlertTriangle className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Your Data Lives Here</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Important information about your privacy</p>
            </div>
            <button onClick={dismiss} className="p-1 rounded-lg hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#3b82f618' }}>
                <svg className="w-4 h-4" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Stored Locally on This Device</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All your financial data is saved only in this browser&apos;s storage. No data is sent to any server or cloud.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef444418' }}>
                <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Lost If Browser Data Is Cleared</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Clearing cookies, cache, or uninstalling the browser app <span className="font-bold" style={{ color: '#ef4444' }}>will permanently delete</span> all your data — and it cannot be recovered.
                </p>
              </div>
            </div>

            {isNewUser ? (
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }}>
                  <Upload className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Import Your Existing Data</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Have data from another device or a previous backup? Import it now so you don&apos;t lose your financial history. Just go to <span className="font-bold" style={{ color: 'var(--brand)' }}>More {'>'} Backup</span> and upload your file.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#22c55e18' }}>
                  <Download className="w-4 h-4" style={{ color: '#22c55e' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Backup Regularly to Stay Safe</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Export your data weekly or monthly. Keep backups on your computer, Google Drive, email, or cloud storage. A <span className="font-bold" style={{ color: 'var(--brand)' }}>5-minute backup</span> can save years of financial records.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-5">
            <Link
              href="/backup"
              onClick={dismiss}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              {isNewUser ? (
                <><Upload className="w-4 h-4" /> Import Data</>
              ) : (
                <><Download className="w-4 h-4" /> Backup Now</>
              )}
            </Link>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 text-sm font-medium rounded-xl hover:opacity-80 transition-all border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              {isNewUser ? "I'll Do It Later" : 'Remind Later'}
            </button>
          </div>
          <p className="text-[10px] text-center mt-3" style={{ color: 'var(--text-muted)' }}>
            {isNewUser
              ? 'This reminder will not appear again after you import or add 3 transactions.'
              : 'Reminder will reappear in 7 days if you choose &quot;Remind Later&quot;'}
          </p>
        </div>
      </div>
    </div>
  );
}
