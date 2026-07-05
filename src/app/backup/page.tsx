'use client';

import { useState } from 'react';
import { storage } from '@/modules/transactions/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { accountService } from '@/modules/accounts/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { categoryService } from '@/modules/categories/services/storage';
import { loanService } from '@/modules/loans/services/storage';
import { archiveService } from '@/modules/archive/services/storage';
import Link from 'next/link';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, Database, Cloud, Mail, Globe, Send } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';
import MathCaptcha from '@/components/MathCaptcha';

export default function BackupPage() {
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const { confirm } = useConfirm();

  const handleExport = () => {
    const data = storage.backup.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_meva_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    auditService.logBackup('Exported', 'user-1', 'default', 'Full backup exported');
  };

  const handleExportTransactions = () => {
    const transactions = storage.transactions.getAll();
    const json = JSON.stringify(transactions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_meva_transactions_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportPartners = () => {
    const partners = storage.partners.getAll();
    const json = JSON.stringify(partners, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_meva_partners_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleExportCategories = () => {
    const categories = storage.categories.getAll();
    const json = JSON.stringify(categories, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_meva_categories_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.transactions || data.partners || data.categories) {
          const ok = await confirm({
            title: 'Import Backup',
            message: 'This will merge imported data with existing data. Continue?',
            confirmText: 'Import',
            variant: 'warning',
          });
          if (ok) {
            storage.backup.importAll(data);
            auditService.logBackup('Imported', 'user-1', 'default', `Imported from ${file.name}`);
            setImportResult({ success: true, message: 'Backup imported successfully!' });
          }
        } else {
          setImportResult({ success: false, message: 'Invalid backup file format' });
        }
      } catch {
        setImportResult({ success: false, message: 'Failed to parse backup file' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReplaceImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.transactions || data.partners || data.categories) {
          const ok = await confirm({
            title: 'Replace All Data',
            message: 'WARNING: This will REPLACE all existing data. Are you sure?',
            confirmText: 'Replace',
            variant: 'danger',
          });
          if (ok) {
            storage.transactions.clear();
            partnerService.clear();
            partnerService.groups.clear();
            categoryService.clear();
            accountService.clear();
            loanService.clear();
            archiveService.clear();
            auditService.clear();
            storage.backup.importAll(data);
            auditService.logBackup('Replaced', 'user-1', 'default', `Data replaced from ${file.name}`);
            setImportResult({ success: true, message: 'Data replaced successfully!' });
          }
        } else {
          setImportResult({ success: false, message: 'Invalid backup file format' });
        }
      } catch {
        setImportResult({ success: false, message: 'Failed to parse backup file' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAll = () => {
    storage.transactions.clear();
    partnerService.clear();
    partnerService.groups.clear();
    categoryService.clear();
    accountService.clear();
    loanService.clear();
    archiveService.clear();
    auditService.clear();
    setShowClearConfirm(false);
    setCaptchaVerified(false);
    setImportResult({ success: true, message: 'All data cleared!' });
  };

  const getDataStats = () => {
    const transactions = storage.transactions.getAll();
    const partners = storage.partners.getAll();
    const categories = storage.categories.getAll();
    const audit = storage.audit.getAll();
    return { transactions: transactions.length, partners: partners.length, categories: categories.length, audit: audit.length };
  };

  const stats = getDataStats();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Backup & Restore</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Export or import your data</p>
          </div>
          <Link href="/" className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
            Home
          </Link>
        </div>

        {importResult && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3`} style={{ backgroundColor: importResult.success ? '#22c55e22' : '#ef444422', borderColor: importResult.success ? '#22c55e' : '#ef4444', borderWidth: 1 }}>
            {importResult.success ? <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} /> : <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />}
            <span style={{ color: 'var(--text-primary)' }}>{importResult.message}</span>
            <button onClick={() => setImportResult(null)} className="ml-auto" style={{ color: 'var(--text-muted)' }}>✕</button>
          </div>
        )}

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Data Overview</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>{stats.transactions}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Transactions</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.partners}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Partners</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--brand-secondary)' }}>{stats.categories}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Categories</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.audit}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Audit Logs</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: '#6366f110', borderColor: '#6366f130' }}>
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="w-5 h-5" style={{ color: '#6366f1' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cloud Sync Available</h2>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Want your data synced across all devices? Cloud and WordPress versions are now available.
          </p>
          <div className="space-y-2">
            <a href="mailto:info@marathimeva.com" className="flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: '#6366f1' }}>
              <Mail className="w-4 h-4" /> info@marathimeva.com
            </a>
            <a href="https://www.marathimeva.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium hover:opacity-80" style={{ color: '#6366f1' }}>
              <Globe className="w-4 h-4" /> www.marathimeva.com
            </a>
            <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Send className="w-4 h-4" /> Available on Telegram
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Export Data</h2>
          </div>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Download your data as JSON files</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Download className="w-4 h-4" /> Full Backup
            </button>
            <button
              onClick={handleExportTransactions}
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <Download className="w-4 h-4" /> Transactions Only
            </button>
            <button
              onClick={handleExportPartners}
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <Download className="w-4 h-4" /> Partners Only
            </button>
            <button
              onClick={handleExportCategories}
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            >
              <Download className="w-4 h-4" /> Categories Only
            </button>
          </div>
        </div>

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Import Data</h2>
          </div>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Restore data from a backup file</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90 cursor-pointer" style={{ backgroundColor: '#22c55e' }}>
              <Upload className="w-4 h-4" /> Merge Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg hover:opacity-90 cursor-pointer" style={{ backgroundColor: '#f59e0b' }}>
              <Upload className="w-4 h-4" /> Replace Import
              <input type="file" accept=".json" onChange={handleReplaceImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: '#ef4444' }}>
          <div className="flex items-center gap-2 mb-4">
            <Trash2 className="w-5 h-5" style={{ color: '#ef4444' }} />
            <h2 className="text-lg font-semibold" style={{ color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Permanently delete ALL data including transactions, partners, categories, audit logs, settings, and archived items. This cannot be undone.</p>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 border rounded-lg hover:opacity-80"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Clear All Data
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#ef444422' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444' }}>This will permanently delete everything. Export a backup first if needed.</span>
              </div>

              <MathCaptcha onVerify={setCaptchaVerified} />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearAll}
                  disabled={!captchaVerified}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Yes, Delete All Data
                </button>
                <button
                  onClick={() => { setShowClearConfirm(false); setCaptchaVerified(false); }}
                  className="px-4 py-2 border rounded-lg hover:opacity-80"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
