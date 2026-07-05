'use client';

import { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import { auditService } from '@/modules/transactions/services/audit';
import { formatDate } from '@/utils';
import { Home, Search, Filter, Trash2, Download } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({ entity: '', search: '', dateFrom: '', dateTo: '' });
  const [showClear, setShowClear] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = () => {
    const all = auditService.getLogs({});
    setLogs(all);
  };

  const filtered = logs.filter((log) => {
    if (filters.entity && log.entity !== filters.entity) return false;
    if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) return false;
    if (filters.search) {
      const lower = filters.search.toLowerCase();
      return log.action.toLowerCase().includes(lower) || log.details?.toLowerCase().includes(lower) || log.entityId.toLowerCase().includes(lower);
    }
    return true;
  });

  const handleClear = async () => {
    const ok = await confirm({
      title: 'Clear Audit Logs',
      message: 'Clear all audit logs? This action cannot be undone.',
      confirmText: 'Clear All',
      variant: 'danger',
    });
    if (ok) {
      auditService.clear();
      loadLogs();
      setShowClear(false);
    }
  };

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'transaction': return '#22c55e';
      case 'partner': return '#3b82f6';
      case 'category': return '#f59e0b';
      case 'user': return '#8b5cf6';
      case 'backup': return '#ef4444';
      default: return 'var(--brand)';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Audit Log</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Track all changes and actions</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Home className="w-5 h-5" /> Home
            </button>
            <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Download className="w-5 h-5" /> Export
            </button>
            <button onClick={() => setShowClear(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'var(--bg-card)' }}>
              <Trash2 className="w-5 h-5" /> Clear
            </button>
          </div>
        </div>

        {showClear && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#ef444422', borderColor: '#ef4444' }}>
            <p className="mb-3" style={{ color: '#ef4444' }}>Clear all audit logs? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleClear} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: '#ef4444' }}>Yes, Clear All</button>
              <button onClick={() => setShowClear(false)} className="px-4 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="p-4 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4" style={{ color: 'var(--brand)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Entity</label>
              <select value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="">All</option>
                <option value="transaction">Transaction</option>
                <option value="partner">Partner</option>
                <option value="category">Category</option>
                <option value="user">User</option>
                <option value="backup">Backup</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Search</label>
              <input type="text" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search actions..." className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{filtered.length} log(s) found</span>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>No audit logs found</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filtered.map((log) => (
                <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getEntityColor(log.entity) }} />
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{log.action}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {log.entity} · {log.entityId.slice(0, 8)}...
                        {log.details && <span> · {log.details}</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
