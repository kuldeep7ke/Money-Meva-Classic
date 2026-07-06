'use client';

import { useState, useEffect } from 'react';
import { archiveService, ArchiveItem } from '@/modules/archive/services/storage';
import { storage } from '@/modules/transactions/services/storage';
import { partnerService } from '@/modules/partners/services/storage';
import { categoryService } from '@/modules/categories/services/storage';
import { auditService } from '@/modules/transactions/services/audit';
import { formatCurrency } from '@/utils';
import { Home, Trash2, RotateCcw, Search, Database, CheckSquare } from 'lucide-react';
import { usePinGuard } from '@/components/PinGuard';

export default function ArchivePage() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [stats, setStats] = useState({ total: 0, transactions: 0, partners: 0, categories: 0 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    const all = archiveService.getAll();
    setItems(all);
    setStats(archiveService.getStats());
    setSelectedIds([]);
    setIsSelectMode(false);
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

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((i) => i.id));
    }
  };

  const handleBulkRestore = () => {
    requestPin(() => {
      selectedIds.forEach((id) => {
        const item = archiveService.getById(id);
        if (!item) return;
        const { entityType, data } = item;
        if (entityType === 'transaction') storage.transactions.create(data);
        else if (entityType === 'partner') partnerService.create(data);
        else if (entityType === 'category') categoryService.create(data);
        auditService.log({ action: `Restored ${entityType}`, entity: entityType, entityId: data.id, userId: 'user-1', businessId: 'default', details: `Restored from archive` });
      });
      archiveService.bulkRestore(selectedIds);
      loadData();
    });
  };

  const handleBulkDelete = () => {
    requestPin(() => {
      archiveService.bulkPermanentDelete(selectedIds);
      loadData();
    });
  };

  const handleRestore = (archiveItem: ArchiveItem) => {
    const { entityType, data } = archiveItem;
    if (entityType === 'transaction') storage.transactions.create(data);
    else if (entityType === 'partner') partnerService.create(data);
    else if (entityType === 'category') categoryService.create(data);
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
              <button onClick={() => { setSelectedIds([]); setIsSelectMode(!isSelectMode); }} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: isSelectMode ? 'var(--brand)' : 'var(--border-color)', color: isSelectMode ? 'var(--brand)' : 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}>
                <CheckSquare className="w-5 h-5" /> {isSelectMode ? 'Cancel' : 'Select'}
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

        {isSelectMode && selectedIds.length > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedIds.length} selected</span>
            <div className="flex-1" />
            <button onClick={handleBulkRestore} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: '#22c55e' }}>
              <RotateCcw className="w-3.5 h-3.5" /> Restore All
            </button>
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: '#ef4444' }}>
              <Trash2 className="w-3.5 h-3.5" /> Delete All
            </button>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No archived items</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {isSelectMode && (
                <div className="px-4 py-2 flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                  <button onClick={handleSelectAll} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                    {selectedIds.length === filtered.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              )}
              {filtered.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSelectMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--brand)' }}
                      />
                    )}
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: item.entityType === 'transaction' ? '#22c55e' : item.entityType === 'partner' ? '#3b82f6' : '#f59e0b' }}>
                      {item.entityType.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{getItemName(item)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {item.entityType} · Deleted {new Date(item.deletedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getItemAmount(item) !== null && (
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(getItemAmount(item)!)}</span>
                    )}
                    {!isSelectMode && (
                      <>
                        <button onClick={() => handleRestore(item)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#22c55e22' }} title="Restore"><RotateCcw className="w-4 h-4" style={{ color: '#22c55e' }} /></button>
                        {confirmDelete === item.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handlePermanentDelete(item.id)} className="px-2 py-1 text-white text-xs rounded" style={{ backgroundColor: '#ef4444' }}>Delete</button>
                            <button onClick={() => setConfirmDelete(null)} className="px-2 py-1 border text-xs rounded" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(item.id)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#ef444422' }} title="Permanent Delete"><Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} /></button>
                        )}
                      </>
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
