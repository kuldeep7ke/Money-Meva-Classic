'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, Undo2, AlertTriangle, ArrowUpDown, X, Archive, SlidersHorizontal, CalendarDays } from 'lucide-react';
import { formatCurrency, cn, getSortedCategories } from '@/lib/utils';
import { TransactionType, Transaction } from '@/types';
import { getTransactions, addTransaction, deleteTransaction, restoreTransaction, permanentDeleteTransaction, getArchivedTransactions, getPartners, checkDuplicateTransaction, addAdjustment } from '@/lib/store';
import PinPrompt from '@/components/PinPrompt';
import { hasPins } from '@/lib/pinStore';

interface TransactionPageProps {
  type: TransactionType;
  title: string;
  description: string;
}

export default function TransactionPage({ type, title, description }: TransactionPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pinArchiveAction, setPinArchiveAction] = useState<{ id: string; action: 'restore' | 'delete' } | null>(null);
  const [dupWarning, setDupWarning] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [archived, setArchived] = useState<Transaction[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  const refresh = () => {
    setTransactions(getTransactions(type));
    setArchived(getArchivedTransactions().filter(t => t.type === type));
    setPartners(getPartners());
  };

  useEffect(() => { refresh(); }, [type]);

  const [form, setForm] = useState({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], partnerAccountId: '', investSource: 'cash' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const tx = { amount, type, category: form.category, description: form.description, date: form.date, partnerAccountId: form.partnerAccountId || undefined };
    const dup = checkDuplicateTransaction(tx);
    if (dup) {
      setDupWarning({ ...tx, existing: dup, investSource: form.investSource });
      return;
    }
    addTransaction({ ...tx, isRecurring: false });

    if (type === 'investment' && form.investSource !== 'cash') {
      if (form.investSource === 'savings') {
        addTransaction({ amount, type: 'expense', category: 'Savings Withdrawal', description: `Fund source for ${form.description || form.category}`, date: form.date, partnerAccountId: undefined, isRecurring: false });
      } else if (form.investSource === 'adjustment') {
        addAdjustment({ amount: -amount, accountType: 'personal', notes: `Fund source for ${form.description || form.category}`, date: form.date });
      } else if (form.investSource.startsWith('partner_')) {
        const pid = form.investSource.replace('partner_', '');
        addTransaction({ amount, type: 'expense', category: 'Partner Investment', description: `Fund source for ${form.description || form.category}`, date: form.date, partnerAccountId: pid, isRecurring: false });
      }
    }

    setShowAddModal(false);
    setForm({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], partnerAccountId: '', investSource: 'cash' });
    refresh();
  };

  const handleDupConfirm = () => {
    if (!dupWarning) return;
    const amount = dupWarning.amount;
    addTransaction({ amount, type: dupWarning.type, category: dupWarning.category, description: dupWarning.description, date: dupWarning.date, partnerAccountId: dupWarning.partnerAccountId, isRecurring: false });

    if (type === 'investment' && dupWarning.investSource && dupWarning.investSource !== 'cash') {
      if (dupWarning.investSource === 'savings') {
        addTransaction({ amount, type: 'expense', category: 'Savings Withdrawal', description: `Fund source for ${dupWarning.description || dupWarning.category}`, date: dupWarning.date, partnerAccountId: undefined, isRecurring: false });
      } else if (dupWarning.investSource === 'adjustment') {
        addAdjustment({ amount: -amount, accountType: 'personal', notes: `Fund source for ${dupWarning.description || dupWarning.category}`, date: dupWarning.date });
      } else if (dupWarning.investSource.startsWith('partner_')) {
        const pid = dupWarning.investSource.replace('partner_', '');
        addTransaction({ amount, type: 'expense', category: 'Partner Investment', description: `Fund source for ${dupWarning.description || dupWarning.category}`, date: dupWarning.date, partnerAccountId: pid, isRecurring: false });
      }
    }

    setDupWarning(null);
    setShowAddModal(false);
    setForm({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], partnerAccountId: '', investSource: 'cash' });
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setConfirmDelete(null);
    refresh();
  };

  const handleRestore = (id: string) => {
    restoreTransaction(id);
    refresh();
  };

  const handlePermanentDelete = (id: string) => {
    permanentDeleteTransaction(id);
    refresh();
  };

  const filtered = transactions
    .filter(t =>
      (!search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCategory || t.category === filterCategory) &&
      (!filterDateFrom || t.date >= filterDateFrom) &&
      (!filterDateTo || t.date <= filterDateTo) &&
      (!filterMinAmount || t.amount >= Number(filterMinAmount)) &&
      (!filterMaxAmount || t.amount <= Number(filterMaxAmount))
    )
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'date') return mul * (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
      return mul * (a.amount - b.amount);
    });

  const filteredSorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'date') return mul * (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
      return mul * (a.amount - b.amount);
    });
  }, [filtered, sortField, sortDir]);

  const getGroupKey = (d: string, g: string) => {
    const dt = new Date(d + 'T00:00:00');
    if (g === 'month') return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (g === 'week') {
      const day = dt.getDay();
      const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(dt.setDate(diff));
      return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
    }
    return d;
  };

  const getGroupLabel = (key: string, g: string) => {
    if (g === 'month') {
      const [y, m] = key.split('-');
      return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    }
    if (g === 'week') {
      const d = new Date(key + 'T00:00:00');
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      const fmt = (dt: Date) => dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `${fmt(d)} - ${fmt(end)}`;
    }
    return new Date(key + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filteredSorted) {
      const key = getGroupKey(t.date, groupBy);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredSorted, groupBy]);

  const baseCategories = type === 'income' ? ['Salary', 'Freelance', 'Business', 'Interest', 'Dividends', 'Rental', 'Other']
    : type === 'saving' ? ['Emergency Fund', 'Goal Savings', 'Retirement', 'Education', 'Other']
    : type === 'investment' ? ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Real Estate', 'Gold', 'Crypto', 'Other']
    : ['Rent', 'Groceries', 'Utilities', 'Transport', 'Healthcare', 'Entertainment', 'Dining', 'Shopping', 'Bills', 'Insurance', 'Education', 'Other'];
  const categories = useMemo(() => getSortedCategories(baseCategories, type), [type]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowArchive(!showArchive)} className="gap-2" type="button">
              <Trash2 className="h-4 w-4" />
              Archive {archived.length > 0 && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-1.5 py-0.5 rounded-full">{archived.length}</span>}
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Add {type === 'income' ? 'Income' : type === 'saving' ? 'Saving' : type === 'investment' ? 'Investment' : 'Expense'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted dark:bg-[#2A2522] dark:text-slate-100 outline-none focus:ring-2 focus:ring-brand"
              placeholder="Search by description or category..." />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </Button>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-brand-muted rounded-lg p-0.5">
            {(['day', 'week', 'month'] as const).map(g => (
              <button key={g} onClick={() => setGroupBy(g)}
                className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  groupBy === g ? "bg-white dark:bg-[#2A2522] text-slate-900 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                )}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-[#2A2522] p-4 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm">
                <option value="">All</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">From Date</label>
              <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">To Date</label>
              <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Min Amount</label>
              <input type="number" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} placeholder="₹0"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Max Amount</label>
              <input type="number" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} placeholder="₹99999"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm" />
            </div>
            <div className="col-span-full flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">Quick:</span>
              {[
                { label: 'Today', days: 0 },
                { label: 'This Week', days: 7 },
                { label: 'This Month', days: 30 },
                { label: 'Last Month', days: 60 },
                { label: 'This Quarter', days: 90 },
              ].map(p => (
                <button key={p.label} type="button" onClick={() => {
                  const to = new Date();
                  const from = new Date();
                  if (p.days === 60) {
                    from.setMonth(from.getMonth() - 1);
                    from.setDate(1);
                    to.setDate(0);
                  } else if (p.days === 0) {
                    // today only
                  } else {
                    from.setDate(from.getDate() - p.days);
                  }
                  setFilterDateFrom(from.toISOString().split('T')[0]);
                  setFilterDateTo(to.toISOString().split('T')[0]);
                }}
                  className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-brand-muted hover:bg-slate-100 dark:hover:bg-brand-muted/50 text-slate-600 dark:text-slate-400 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
            <div className="col-span-full flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Sort:</span>
              <select value={sortField} onChange={e => setSortField(e.target.value as 'date' | 'amount')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm">
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <select value={sortDir} onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand text-sm">
                <option value="desc">Newest / Highest</option>
                <option value="asc">Oldest / Lowest</option>
              </select>
              <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setFilterDateFrom(''); setFilterDateTo(''); setFilterMinAmount(''); setFilterMaxAmount(''); setSortField('date'); setSortDir('desc'); }} className="text-xs text-brand dark:text-brand-secondary">
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Main List */}
        <div className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50 dark:bg-brand-muted border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 w-[50px] text-center">#</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 w-[200px]">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right w-[130px]">
                  <button onClick={() => { if (sortField === 'amount') { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); } else { setSortField('amount'); setSortDir('desc'); } }}
                    className="flex items-center gap-1.5 ml-auto hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredSorted.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">No transactions yet. Click "Add" to create one.</td></tr>
              )}
              {groups.map(([groupKey, txns]) => (
                <React.Fragment key={groupKey}>
                  <tr className="bg-slate-50 dark:bg-brand-muted/50">
                    <td colSpan={5} className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {getGroupLabel(groupKey, groupBy)}
                    </td>
                  </tr>
                  {txns.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-center text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-brand-muted text-slate-600 dark:text-slate-300 text-xs font-medium">{t.category}</span>
                        {t.partnerAccountId && <span className="ml-1 px-2 py-1 rounded-full bg-brand-secondary dark:bg-brand-muted/30 text-brand dark:text-brand-secondary text-xs">partner</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{t.description}</td>
                      <td className={cn("px-6 py-4 text-sm font-bold text-right", type === 'income' || type === 'saving' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {confirmDelete === t.id ? (
                          <div className="flex justify-end gap-1 items-center">
                            <Button size="sm" variant="danger" className="h-6 px-1.5 text-xs min-w-0" onClick={() => handleDelete(t.id)}>Yes</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs min-w-0" onClick={() => setConfirmDelete(null)}>No</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => setConfirmDelete(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            {filteredSorted.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-brand-muted border-t border-slate-200 dark:border-slate-600">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Total</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{filteredSorted.length} entries</td>
                  <td className={cn("px-6 py-4 text-sm font-bold text-right", type === 'income' || type === 'saving' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                    {formatCurrency(filteredSorted.reduce((s, t) => s + t.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Archive Panel */}
        {showArchive && (
          <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-700 shadow-sm overflow-x-auto">
            <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-700 flex items-center justify-between">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Archive className="h-4 w-4" /> Archive
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowArchive(false)}><X className="h-4 w-4" /></Button>
            </div>
            {archived.length === 0 ? (
              <p className="px-6 py-8 text-center text-amber-600 dark:text-amber-400 text-sm">Archive is empty.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-amber-200 dark:divide-amber-700">
                    {archived.map(t => (
                      <tr key={t.id} className="hover:bg-amber-100/50 dark:hover:bg-amber-800/30 transition-colors">
                        <td className="px-6 py-3 text-sm text-amber-700 dark:text-amber-400">{t.date}</td>
                        <td className="px-6 py-3 text-sm text-amber-700 dark:text-amber-400">{t.category}</td>
                        <td className="px-6 py-3 text-sm text-amber-700 dark:text-amber-400">{t.description}</td>
                        <td className="px-6 py-3 text-sm font-bold text-right text-amber-700 dark:text-amber-400">{formatCurrency(t.amount)}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-700 dark:text-amber-400 hover:text-green-600 dark:hover:text-green-400" onClick={() => {
                              if (hasPins()) setPinArchiveAction({ id: t.id, action: 'restore' }); else handleRestore(t.id);
                            }}>
                              <Undo2 className="h-3 w-3 mr-1" /> Restore
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => {
                              if (hasPins()) setPinArchiveAction({ id: t.id, action: 'delete' }); else if (confirm('Permanently delete this item?')) handlePermanentDelete(t.id);
                            }}>
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Add {title.slice(0, -1)}</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Amount (₹)</label>
                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Category</label>
                  <input required list={`${type}-category-options`} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Select or type a category" />
                  <datalist id={`${type}-category-options`}>
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Date</label>
                  <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Add a note..." />
              </div>
              {type === 'investment' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Source of Funds</label>
                  <select value={form.investSource} onChange={e => setForm({ ...form, investSource: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                    <option value="cash">Cash Account (Available to Spend)</option>
                    <option value="savings">Savings</option>
                    {partners.map(p => <option key={p.id} value={`partner_${p.id}`}>{p.name} (Partner)</option>)}
                    <option value="adjustment">Adjustment</option>
                  </select>
                  <p className="text-xs text-slate-400 dark:text-slate-500">A corresponding outflow entry will be created from this source</p>
                </div>
              )}
              {partners.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Link to Partner Account (optional)</label>
                  <select value={form.partnerAccountId} onChange={e => setForm({ ...form, partnerAccountId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                    <option value="">None</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-6">
                <Button variant="ghost" className="flex-1 py-3" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-3">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Warning */}
      {dupWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDupWarning(null)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-md w-full p-6 shadow-2xl border-l-4 border-amber-500" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Possible Duplicate</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              A similar entry already exists on this date:
            </p>
            <div className="bg-slate-50 dark:bg-brand-muted/50 rounded-xl p-4 mb-5 text-sm space-y-1">
              <p><span className="font-medium text-slate-700 dark:text-slate-300">Existing:</span> <span className="text-slate-600 dark:text-slate-400">{dupWarning.existing.description || dupWarning.existing.category} — {formatCurrency(dupWarning.existing.amount)}</span></p>
              <p><span className="font-medium text-slate-700 dark:text-slate-300">New:</span> <span className="text-slate-600 dark:text-slate-400">{dupWarning.description || dupWarning.category} — {formatCurrency(dupWarning.amount)}</span></p>
              <p className="text-slate-400 dark:text-slate-500 text-xs">{dupWarning.date} · {dupWarning.type}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setDupWarning(null)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleDupConfirm}>Add Anyway</Button>
            </div>
          </div>
        </div>
      )}

      <PinPrompt
        open={pinArchiveAction !== null}
        onClose={() => setPinArchiveAction(null)}
        onSuccess={() => {
          if (!pinArchiveAction) return;
          if (pinArchiveAction.action === 'restore') handleRestore(pinArchiveAction.id);
          else handlePermanentDelete(pinArchiveAction.id);
          setPinArchiveAction(null);
        }}
        title={pinArchiveAction?.action === 'restore' ? 'Restore Item' : 'Permanently Delete'}
        message={`Enter a PIN to ${pinArchiveAction?.action === 'restore' ? 'restore' : 'permanently delete'} this item from archive`}
      />
    </DashboardLayout>
  );
}
