'use client';

import { useState, useEffect } from 'react';
import { archiveService, ArchiveItem } from '@/modules/archive/services/storage';
import { storage } from '@/modules/transactions/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { categoryService } from '@/modules/categories/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { formatCurrency } from '@/utils';
import { Home, Trash2, RotateCcw, Search, Filter, Database } from 'lucide-react';
import Link from 'next/link';
import { usePinGuard } from '@/components/PinGuard';

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [stats, setStats] = useState({ total: 0, transactions: 0, partners: 0, categories: 0 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setItems(archiveService.getAll());
    setStats(archiveService.getStats());
  };

  const filtered = items.filter((item) => {
    if (activeTab !== 'all' && item.entityType !== activeTab) return false;
    if (search) {
      const lower = search.toLowerCase();
      const data = item.data;
      return (
        data.description?.toLowerCase().includes(lower) ||
        data.name?.toLowerCase().includes(lower) ||
        data.title?.toLowerCase().includes(lower) ||
        item.entityId.toLowerCase().includes(lower)
      );
    }
    return true;
  });

  const handleRestore = (archiveItem: ArchiveItem) => {
    const { entityType, data } = archiveItem;
    if (entityType === 'transaction') {
      storage.transactions.create(data);
    } else if (entityType === 'partner') {
      partnerService.create(data);
    } else if (entityType === 'category') {
      categoryService.create(data);
    }
    archiveService.restore(archiveItem.id);
    auditService.log({ action: `Restored ${entityType}`, entity: entityType, entityId: data.id, userId: 'user-1', businessId: 'default', details: `Restored from archive` });
    loadData();
  };

  const handlePermanentDelete = (archiveId: string) => {
    requestPin(() => {
      archiveService.permanentlyDelete(archiveId);
      setConfirmDelete(null);
      loadData();
    });
  };

  const handleClearAll = () => {
    requestPin(() => {
      archiveService.clear();
      setConfirmClear(false);
      loadData();
    });
  };

  const getItemName = (item: ArchiveItem) => {
    const d = item.data;
    return d.description || d.name || d.title || item.entityId.slice(0, 8);
  };

  const getItemAmount = (item: ArchiveItem) => {
    if (item.entityType === 'transaction') return item.data.amount;
    if (item.entityType === 'partner') return item.data.currentBalance;
    return null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Archive</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Deleted items can be restored from here</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
              <Home className="w-5 h-5" /> Home
            </button>
            {items.length > 0 && (
              <button onClick={() => setConfirmClear(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'var(--bg-card)' }}>
                <Trash2 className="w-5 h-5" /> Clear Archive
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'var(--brand)' },
            { label: 'Transactions', value: stats.transactions, color: '#22c55e' },
            { label: 'Partners', value: stats.partners, color: '#3b82f6' },
            { label: 'Categories', value: stats.categories, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {confirmClear && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#ef444422', borderColor: '#ef4444' }}>
            <p className="mb-3" style={{ color: '#ef4444' }}>Permanently delete all archived items? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={handleClearAll} className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: '#ef4444' }}>Yes, Clear All</button>
              <button onClick={() => setConfirmClear(false)} className="px-4 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-2 flex-1">
            {['all', 'transaction', 'partner', 'category'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="px-4 py-2 rounded-lg text-sm font-medium capitalize" style={{ backgroundColor: activeTab === tab ? 'var(--brand)' : 'var(--bg-card)', color: activeTab === tab ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                {tab === 'all' ? 'All' : `${tab}s`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No archived items</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filtered.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: item.entityType === 'transaction' ? '#22c55e' : item.entityType === 'partner' ? '#3b82f6' : '#f59e0b' }}>
                      {item.entityType.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{getItemName(item)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.entityType} · Deleted {new Date(item.deletedAt).toLocaleString()}
                        {item.restoreCount > 0 && <span> · Restored {item.restoreCount}x</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getItemAmount(item) !== null && (
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(getItemAmount(item)!)}</span>
                    )}
                    <button onClick={() => handleRestore(item)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#22c55e22' }} title="Restore"><RotateCcw className="w-4 h-4" style={{ color: '#22c55e' }} /></button>
                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handlePermanentDelete(item.id)} className="px-2 py-1 text-white text-xs rounded" style={{ backgroundColor: '#ef4444' }}>Delete</button>
                        <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 border text-xs rounded" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(item.id)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#ef444422' }} title="Permanent Delete"><Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
