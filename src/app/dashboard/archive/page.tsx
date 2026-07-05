'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Archive, Undo2, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getAllArchivedItems, restoreArchivedItem, permanentDeleteArchivedItem, permanentDeleteAllArchived } from '@/lib/store';
import { ArchivedItem, ArchiveItemType } from '@/types';
import PinPrompt from '@/components/PinPrompt';
import { hasPins } from '@/lib/pinStore';

export default function ArchivePage() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pinAction, setPinAction] = useState<{ type: 'restore' | 'delete' | 'clear'; item?: ArchivedItem } | null>(null);

  const refresh = () => setItems(getAllArchivedItems());

  useEffect(() => { refresh(); }, []);

  const requirePin = (action: 'restore' | 'delete' | 'clear', item?: ArchivedItem) => {
    if (hasPins()) {
      setPinAction({ type: action, item });
    } else {
      executeAction(action, item);
    }
  };

  const executeAction = async (type: string, item?: ArchivedItem) => {
    if (type === 'restore' && item) {
      restoreArchivedItem(item.type as ArchiveItemType, item.id);
    } else if (type === 'delete' && item) {
      permanentDeleteArchivedItem(item.type as ArchiveItemType, item.id);
    } else if (type === 'clear') {
      await permanentDeleteAllArchived();
      setConfirmClear(false);
    }
    refresh();
  };

  const handleRestore = (item: ArchivedItem) => requirePin('restore', item);
  const handleDelete = (item: ArchivedItem) => requirePin('delete', item);
  const handleClearAll = () => requirePin('clear');

  const typeBadge = (type: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      transaction: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Transaction' },
      recurring: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', label: 'Recurring' },
      reminder: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Reminder' },
      partner: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', label: 'Partner' },
      budget: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400', label: 'Budget' },
      adjustment: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', label: 'Adjustment' },
      goal: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', label: 'Goal' },
    };
    const m = map[type] || map.transaction;
    return <span className={cn("px-2 py-1 rounded-full text-xs font-medium", m.bg, m.text)}>{m.label}</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Archive</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Restore or permanently delete archived items</p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-2">
              {confirmClear ? (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-xl border border-red-200 dark:border-red-700">
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">Delete all {items.length} items?</span>
                  <Button size="sm" variant="danger" onClick={handleClearAll} className="h-8">Yes</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)} className="h-8">No</Button>
                </div>
              ) : (
                <Button variant="outline" className="gap-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700" onClick={() => setConfirmClear(true)}>
                  <Trash2 className="h-4 w-4" /> Empty Archive
                </Button>
              )}
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-brand-light dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm p-12 text-center">
            <Archive className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Archive is empty</h3>
            <p className="text-slate-400 dark:text-slate-500">Deleted items will appear here</p>
          </div>
        ) : (
          <div className="bg-brand-light dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-brand-muted border-b border-slate-200 dark:border-brand-muted">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 w-[100px]">Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Item</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Details</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right w-[120px]">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 w-[110px]">Archived</th>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-brand-muted">
                  {items.map(item => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-slate-50 dark:hover:bg-brand-muted/50 transition-colors">
                      <td className="px-6 py-4">{typeBadge(item.type)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{item.subtitle}</td>
                      <td className={cn("px-6 py-4 text-sm font-bold text-right", item.amount > 0 ? "text-green-600 dark:text-green-400" : "text-slate-700 dark:text-slate-300")}>
                        {item.amount ? formatCurrency(item.amount) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-500">{new Date(item.deletedAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-brand hover:text-green-600" onClick={() => handleRestore(item)}>
                            <Undo2 className="h-3 w-3 mr-1" /> Restore
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => handleDelete(item)}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <PinPrompt
        open={pinAction !== null}
        onClose={() => setPinAction(null)}
        onSuccess={() => {
          if (pinAction) { const a = pinAction; setPinAction(null); executeAction(a.type, a.item); }
        }}
        title={pinAction?.type === 'clear' ? 'Clear All Archive' : pinAction?.type === 'restore' ? 'Restore Item' : 'Delete Item'}
        message={pinAction?.type === 'clear' ? 'Enter a PIN to permanently delete all archived items' : `Enter a PIN to ${pinAction?.type === 'restore' ? 'restore' : 'permanently delete'} this item`}
      />
    </DashboardLayout>
  );
}