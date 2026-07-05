'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PiggyBank, Target, Plus, Trash2, ArrowUpDown, SlidersHorizontal, Search, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn, getSortedCategories } from '@/lib/utils';
import { Transaction } from '@/types';
import { getTransactions, addTransaction, deleteTransaction, restoreTransaction, permanentDeleteTransaction, getArchivedTransactions, getPartners, checkDuplicateTransaction, getGoals, addGoal, deleteGoal } from '@/lib/store';

type TabType = 'savings' | 'goals';

export default function SavingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('savings');

  // Savings tab state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
  const type = 'saving' as const;

  const refresh = () => {
    setTransactions(getTransactions(type));
    setArchived(getArchivedTransactions().filter(t => t.type === type));
    setPartners(getPartners());
  };
  useEffect(() => { refresh(); setGoals(getGoals()); }, []);

  const [form, setForm] = useState({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], partnerAccountId: '', source: 'available' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    const date = form.date;
    const tx = { amount, type, category: form.category, description: form.description, date, partnerAccountId: form.partnerAccountId || undefined };
    const dup = checkDuplicateTransaction(tx);
    if (dup) { setDupWarning({ ...tx, existing: dup, source: form.source }); return; }
    addTransaction({ ...tx, isRecurring: false });

    if (form.source.startsWith('partner_')) {
      const pid = form.source.replace('partner_', '');
      addTransaction({ amount, type: 'expense', category: 'Savings Transfer', description: `Fund source for ${form.description || form.category}`, date, partnerAccountId: pid, isRecurring: false });
    }

    setShowAddModal(false);
    setForm({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], partnerAccountId: '', source: 'available' });
    refresh();
  };

  const handleDupConfirm = () => {
    if (!dupWarning) return;
    const amount = dupWarning.amount;
    addTransaction({ amount, type: dupWarning.type, category: dupWarning.category, description: dupWarning.description, date: dupWarning.date, partnerAccountId: dupWarning.partnerAccountId, isRecurring: false });

    const src = dupWarning.source || 'available';
    if (src.startsWith('partner_')) {
      const pid = src.replace('partner_', '');
      addTransaction({ amount, type: 'expense', category: 'Savings Transfer', description: `Fund source for ${dupWarning.description || dupWarning.category}`, date: dupWarning.date, partnerAccountId: pid, isRecurring: false });
    }

    setDupWarning(null);
    setShowAddModal(false);
    refresh();
  };

  const handleDelete = (id: string) => { deleteTransaction(id); setConfirmDelete(null); refresh(); };
  const handleRestore = (id: string) => { restoreTransaction(id); refresh(); };
  const handlePermanentDelete = (id: string) => { permanentDeleteTransaction(id); refresh(); };

  const filtered = useMemo(() => {
    return transactions
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
  }, [transactions, search, filterCategory, filterDateFrom, filterDateTo, filterMinAmount, filterMaxAmount, sortField, sortDir]);

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
    for (const t of filtered) {
      const key = getGroupKey(t.date, groupBy);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered, groupBy]);

  const categories = useMemo(() => getSortedCategories(['Emergency Fund', 'Goal Savings', 'Retirement', 'Education', 'Other'], 'saving'), []);

  // Goals state
  const [goals, setGoals] = useState<any[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: '', target: '', saved: '' });
  const [confirmDel, setConfirmDel] = useState<{ type: string; id: string } | null>(null);

  const refreshGoals = () => { setGoals(getGoals()); };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addGoal({ name: goalForm.name, target: Number(goalForm.target), saved: Number(goalForm.saved) || 0 });
    setShowGoalModal(false);
    setGoalForm({ name: '', target: '', saved: '' });
    refreshGoals();
  };

  const handleDeleteItem = (type: string, id: string) => {
    if (type === 'goal') deleteGoal(id);
    setConfirmDel(null);
    refreshGoals();
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'savings', label: 'Savings', icon: PiggyBank },
    { key: 'goals', label: 'Goals', icon: Target },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Savings</h1>
           <p className="text-slate-500 dark:text-slate-400">Track your savings goals and monthly deposits.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-brand-muted pb-4 flex-wrap">
          {tabs.map(tab => (
            <Button key={tab.key} variant={activeTab === tab.key ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab(tab.key)} className="gap-2">
              <tab.icon className="h-4 w-4" />{tab.label}
            </Button>
          ))}
        </div>

        {/* Tab: Savings */}
        {activeTab === 'savings' && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowArchive(!showArchive)} className="gap-2" type="button">
                  Archive {archived.length > 0 && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-1.5 py-0.5 rounded-full">{archived.length}</span>}
                </Button>
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-5 w-5" /> Add Saving
                </Button>
              </div>
            </div>

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
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">No transactions yet. Click &quot;Add&quot; to create one.</td></tr>
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
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{t.description}</td>
                          <td className="px-6 py-4 text-sm font-bold text-right text-green-600 dark:text-green-400">{formatCurrency(t.amount)}</td>
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
                {filtered.length > 0 && (
                  <tfoot className="bg-slate-50 dark:bg-brand-muted border-t border-slate-200 dark:border-slate-600">
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Total</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{filtered.length} entries</td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-green-600 dark:text-green-400">{formatCurrency(filtered.reduce((s, t) => s + t.amount, 0))}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {showArchive && (
              <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-700 shadow-sm overflow-x-auto">
                <div className="px-6 py-4 border-b border-amber-200 dark:border-amber-700 flex items-center justify-between">
                  <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">Archive</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowArchive(false)}>X</Button>
                </div>
                {archived.length === 0 ? (
                  <p className="px-6 py-8 text-center text-amber-600 dark:text-amber-400 text-sm">Archive is empty.</p>
                ) : (
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
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-700 dark:text-amber-400 hover:text-green-600 dark:hover:text-green-400" onClick={() => { handleRestore(t.id); }}>
                                Restore
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-700 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => { if (confirm('Permanently delete this item?')) handlePermanentDelete(t.id); }}>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}

        {/* Tab: Goals */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Goals</h2>
              <Button onClick={() => setShowGoalModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Goal</Button>
            </div>
            {goals.length === 0 ? (
             <p className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm p-8 text-center text-slate-500 dark:text-slate-400">
               <Target className="h-10 w-10 mx-auto mb-3 text-slate-300" />
               <span className="text-lg font-medium block">No goals set yet.</span>
               <span className="text-sm">Set financial goals and track your progress.</span>
             </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(g => {
                  const pct = g.target > 0 ? Math.min(Math.round((g.saved / g.target) * 100), 100) : 0;
                  return (
                    <div key={g.id} className="bg-white dark:bg-[#2A2522] p-5 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{g.name}</h3>
                        <div className="flex items-center gap-2">
                          {confirmDel?.type === 'goal' && confirmDel.id === g.id ? (
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="danger" className="h-7 px-2 text-xs" onClick={() => handleDeleteItem('goal', g.id)}>Yes</Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setConfirmDel(null)}>No</Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm" className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => setConfirmDel({ type: 'goal', id: g.id })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Target className="h-4 w-4 text-brand-secondary" />
                        </div>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Saved: {formatCurrency(g.saved)}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Target: {formatCurrency(g.target)}</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-brand-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-brand")} style={{ width: `${pct}%` }}></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-slate-400 dark:text-slate-500">{pct}% achieved</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Saving Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Add Saving</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Amount (₹)</label>
                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Category</label>
                  <input required list="saving-category-options" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Select or type a category" />
                  <datalist id="saving-category-options">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Source of Funds</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                  <option value="available">Available to Spend</option>
                  {partners.map(p => <option key={p.id} value={`partner_${p.id}`}>{p.name}</option>)}
                </select>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {form.source === 'available' ? 'Saving deducted from available balance.' :
                   'A corresponding expense entry will be created from this source.'}
                </p>
              </div>
              <div className="flex gap-3 pt-6">
                <Button variant="ghost" className="flex-1 py-3" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-3">Save</Button>
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">A similar entry already exists on this date:</p>
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

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">New Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Goal Name</label>
                <input required value={goalForm.name} onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Emergency Fund" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Target Amount</label>
                  <input required type="number" value={goalForm.target} onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="₹" /></div>
                <div className="space-y-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Saved So Far</label>
                  <input type="number" value={goalForm.saved} onChange={e => setGoalForm({ ...goalForm, saved: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="₹ 0" /></div>
              </div>
              <div className="flex gap-3 pt-6">
                <Button variant="ghost" className="flex-1 py-3" onClick={() => setShowGoalModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-3">Create Goal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
