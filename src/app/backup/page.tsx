'use client';

import { useState, useRef } from 'react';
import { storage, validateBackup, type BackupData, type ImportResults } from '@/modules/transactions/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { APP_VERSION } from '@/constants';
import Link from 'next/link';
import { Download, Upload, AlertTriangle, CheckCircle, Database, FileJson, Clock, Tag, X, Cloud, Globe, Send, ExternalLink, Home } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';

type SelectedFile = {
  name: string;
  data: BackupData;
  validation: ReturnType<typeof validateBackup>;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function BackupPage() {
  const [importResult, setImportResult] = useState<{ success: boolean; results?: ImportResults; message: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [importing, setImporting] = useState(false);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();

  const handleExport = () => {
    const data = storage.backup.exportAll();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_meva_backup_${data.version}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    auditService.logBackup('Exported', 'user-1', 'default', 'Full backup exported');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, mode: 'merge' | 'replace') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const validation = validateBackup(raw);

        if (!validation.valid) {
          setImportResult({ success: false, message: validation.error || 'Invalid backup file' });
          setSelectedFile(null);
          return;
        }

        if (!raw.transactions && !raw.partners && !raw.categories && !raw.accounts && !raw.audit) {
          setImportResult({ success: false, message: 'Backup file contains no recognizable data' });
          setSelectedFile(null);
          return;
        }

        const ok = await confirm({
          title: mode === 'merge' ? 'Merge Import' : 'Replace All Data',
          message: mode === 'merge'
            ? 'New records will be added. Existing records with the same ID will be skipped.'
            : 'WARNING: This will replace ALL existing data with the backup contents.',
          confirmText: mode === 'merge' ? 'Merge' : 'Replace',
          variant: mode === 'merge' ? 'warning' : 'danger',
        });

        if (!ok) {
          setSelectedFile(null);
          return;
        }

        setImporting(true);
        const results = storage.backup.importAll(raw, mode);
        auditService.logBackup(mode === 'merge' ? 'Imported' : 'Replaced', 'user-1', 'default', `${mode} import from ${file.name}`);
        setImportResult({
          success: true,
          results,
          message: mode === 'merge' ? 'Data merged successfully' : 'Data replaced successfully',
        });
        setSelectedFile(null);
      } catch {
        setImportResult({ success: false, message: 'Failed to parse backup file' });
        setSelectedFile(null);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Backup & Restore</h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>Export or import your data</p>
            </div>
          </div>
        </div>

        {importResult && (
          <div className={`mb-6 p-4 rounded-lg border ${importResult.success ? '' : ''}`} style={{ backgroundColor: importResult.success ? '#22c55e0d' : '#ef44440d', borderColor: importResult.success ? '#22c55e' : '#ef4444' }}>
            <div className="flex items-start gap-3">
              {importResult.success ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#22c55e' }} /> : <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#ef4444' }} />}
              <div className="flex-1 min-w-0">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{importResult.message}</p>
                {importResult.results && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { label: 'Transactions', result: importResult.results.transactions },
                      { label: 'Partners', result: importResult.results.partners },
                      { label: 'Categories', result: importResult.results.categories },
                      { label: 'Accounts', result: importResult.results.accounts },
                      { label: 'Audit Logs', result: importResult.results.audit },
                    ].map(({ label, result }) => (
                      result.total > 0 && (
                        <div key={label} className="text-sm px-3 py-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <p style={{ color: 'var(--text-muted)' }}>{label}</p>
                          <p style={{ color: 'var(--text-primary)' }}>
                            <span style={{ color: '#22c55e' }}>+{result.imported}</span>
                            {result.skipped > 0 && <span className="ml-2" style={{ color: '#f59e0b' }}>{result.skipped} skipped</span>}
                          </p>
                        </div>
                      )
                    ))}
                    {importResult.results.warning && (
                      <div className="col-span-full flex items-center gap-2 p-2 rounded" style={{ backgroundColor: '#f59e0b1a' }}>
                        <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="text-sm" style={{ color: '#f59e0b' }}>{importResult.results.warning}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setImportResult(null)} className="shrink-0" style={{ color: 'var(--text-muted)' }}>✕</button>
            </div>
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

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Export</h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Download a full backup as JSON. The file includes app version and timestamp for compatibility checking.
          </p>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <Download className="w-4 h-4" /> Download Backup (v{APP_VERSION})
          </button>
        </div>

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5" style={{ color: 'var(--brand)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Import</h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Restore data from a backup file. Duplicate entries (same ID) are automatically skipped during import.
          </p>

          {selectedFile && (
            <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileJson className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</span>
                </div>
                <button onClick={() => setSelectedFile(null)} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Backup version: <strong style={{ color: 'var(--text-primary)' }}>v{selectedFile.data.version}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Exported: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(selectedFile.data.exportedAt)}</strong></span>
                </div>
                {selectedFile.validation.warning && (
                  <div className="flex items-center gap-2 mt-2 p-2 rounded" style={{ backgroundColor: '#f59e0b1a' }}>
                    <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b' }}>{selectedFile.validation.warning}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {importing && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: '#6366f110' }}>
              <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Importing data...</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#22c55e' }}>
              <Upload className="w-4 h-4" /> Merge Import
              <input ref={mergeInputRef} type="file" accept=".json" onChange={(e) => handleFileSelect(e, 'merge')} className="hidden" disabled={importing} />
            </label>
            <label className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#f59e0b' }}>
              <Upload className="w-4 h-4" /> Replace Import
              <input ref={replaceInputRef} type="file" accept=".json" onChange={(e) => handleFileSelect(e, 'replace')} className="hidden" disabled={importing} />
            </label>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            Merge adds new records and skips duplicates. Replace clears all existing data first.
          </p>
        </div>

        <div className="p-6 rounded-lg border shadow-sm mb-6" style={{ backgroundColor: '#6366f108', borderColor: '#6366f120' }}>
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="w-5 h-5" style={{ color: '#6366f1' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Cloud Version Available</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Want sync across all devices, WordPress self-hosting, or real-time collaboration? We have paid plans for every need.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Database className="w-4 h-4 shrink-0" style={{ color: '#6366f1' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Supabase Cloud</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time sync across devices</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Globe className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>WordPress Plugin</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Self-host on your own server</p>
              </div>
            </div>
            <a href="https://t.me/marathimeva" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Send className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Available on Telegram</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>t.me/marathimeva</p>
              </div>
            </a>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:info@marathimeva.com" className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90" style={{ backgroundColor: '#6366f1' }}>
              <ExternalLink className="w-4 h-4" /> Contact Us
            </a>
            <a href="https://www.marathimeva.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
              <Globe className="w-4 h-4" /> www.marathimeva.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}