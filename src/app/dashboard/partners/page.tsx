'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus, Wallet, TrendingUp, TrendingDown, MoreVertical, Trash2, X, Undo2, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getPartners, addPartner, deletePartner, updatePartner, getPartnerPnL, getTransactions, addTransaction, checkDuplicateTransaction } from '@/lib/store';


const DEFAULT_VENDORS = [
  { name: 'Cash', type: 'Wallet', group: 'vendor' as const, description: 'Physical cash on hand', budgetWindowStart: '', budgetWindowEnd: '', initialInvestment: 0 },
  { name: 'Bank', type: 'Bank Account', group: 'vendor' as const, description: 'Bank account funds', budgetWindowStart: '', budgetWindowEnd: '', initialInvestment: 0 },
  { name: 'UPI Wallet', type: 'Digital Wallet', group: 'vendor' as const, description: 'UPI/digital wallet balance', budgetWindowStart: '', budgetWindowEnd: '', initialInvestment: 0 },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([]);
  useEffect(() => {
    const existing = getPartners();
    const hasDefaults = existing.some(p => DEFAULT_VENDORS.some(d => d.name === p.name));
    if (!hasDefaults) {
      DEFAULT_VENDORS.forEach(d => addPartner(d));
    }
    refresh();
  }, []);

  const refresh = () => {
    setPartners(getPartners().map(p => ({ ...p, ...getPartnerPnL(p.id) })));
  };

  const [activeGroup, setActiveGroup] = useState<'all' | 'customer' | 'vendor' | 'contact'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dupWarning, setDupWarning] = useState<any | null>(null);

  const [form, setForm] = useState({ name: '', type: '', group: 'vendor' as 'customer' | 'vendor' | 'contact', description: '', budgetWindowStart: '', budgetWindowEnd: '', initialInvestment: '' });
  const [isCustomType, setIsCustomType] = useState(false);
  const [txForm, setTxForm] = useState({ amount: '', type: 'income' as 'income' | 'expense', category: '', description: '', date: new Date().toISOString().split('T')[0], reflectPersonal: true });

  const filteredPartners = activeGroup === 'all' ? partners : partners.filter(p => p.group === activeGroup);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addPartner({
      name: form.name,
      type: isCustomType ? form.type : form.type,
      group: form.group,
      description: form.description,
      budgetWindowStart: form.budgetWindowStart,
      budgetWindowEnd: form.budgetWindowEnd,
      initialInvestment: Number(form.initialInvestment) || 0,
    });
    setShowAddModal(false);
    setForm({ name: '', type: '', group: 'vendor', description: '', budgetWindowStart: '', budgetWindowEnd: '', initialInvestment: '' });
    setIsCustomType(false);
    refresh();
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showTxModal) return;
    const amount = Number(txForm.amount);
    const date = txForm.date;
    const tx = { amount, type: txForm.type, category: txForm.category, description: txForm.description, date, partnerAccountId: showTxModal };
    const dup = checkDuplicateTransaction(tx);
    if (dup) {
      setDupWarning({ ...tx, existing: dup, reflectPersonal: txForm.reflectPersonal });
      return;
    }
    addTransaction({ ...tx, isRecurring: false });

    if (txForm.reflectPersonal) {
      addTransaction({ amount, type: txForm.type, category: txForm.category, description: `${txForm.description} (${partners.find(p => p.id === showTxModal)?.name || 'Partner'})`, date, partnerAccountId: undefined, isRecurring: false });
    }

    setShowTxModal(null);
    setTxForm({ amount: '', type: 'income', category: '', description: '', date: new Date().toISOString().split('T')[0], reflectPersonal: true });
    refresh();
  };

  const handleDupConfirm = () => {
    if (!dupWarning) return;
    const amount = dupWarning.amount;
    addTransaction({ amount, type: dupWarning.type, category: dupWarning.category, description: dupWarning.description, date: dupWarning.date, partnerAccountId: dupWarning.partnerAccountId, isRecurring: false });

    if (dupWarning.reflectPersonal) {
      addTransaction({ amount, type: dupWarning.type, category: dupWarning.category, description: `${dupWarning.description} (Partner)`, date: dupWarning.date, partnerAccountId: undefined, isRecurring: false });
    }

    setDupWarning(null);
    setShowTxModal(null);
    setTxForm({ amount: '', type: 'income', category: '', description: '', date: new Date().toISOString().split('T')[0], reflectPersonal: true });
    refresh();
  };

  const handleDelete = (id: string) => {
    deletePartner(id);
    setConfirmDelete(null);
    refresh();
  };

  const totalInvested = partners.reduce((s, p) => s + (p.initialInvestment || 0), 0);
  const totalValue = partners.reduce((s, p) => s + ((p.initialInvestment || 0) + (p.net || 0)), 0);

  const partnerTypeOptions = useMemo(() => {
    const stats = new Map<string, { count: number; lastUsed: number }>();
    partners.forEach(p => {
      const type = String(p.type || '').trim();
      if (!type) return;
      const lastUsed = new Date(p.updatedAt || p.createdAt || 0).getTime();
      const current = stats.get(type) || { count: 0, lastUsed: 0 };
      stats.set(type, { count: current.count + 1, lastUsed: Math.max(current.lastUsed, lastUsed) });
    });
    return Array.from(stats.entries())
      .sort((a, b) => b[1].count - a[1].count || b[1].lastUsed - a[1].lastUsed)
      .map(([type]) => type);
  }, [partners]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Partner Accounts</h1>
            <p className="text-slate-500 dark:text-slate-400">Track your joint ventures and project budgets.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Partner Account
          </Button>
        </div>

        {partners.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-brand to-purple-600 p-5 rounded-2xl shadow-lg text-white">
                <p className="text-sm opacity-80 mb-1">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                <p className="text-xs opacity-60 mt-1">Across {partners.length} partner account{partners.length > 1 ? 's' : ''}</p>
              </div>
              <div className="bg-white dark:bg-[#2A2522] p-5 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Net P&L</p>
                <p className={cn("text-2xl font-bold", totalValue - totalInvested >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  {formatCurrency(totalValue - totalInvested)}
                </p>
              </div>
              <div className="bg-white dark:bg-[#2A2522] p-5 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(totalValue)}</p>
              </div>
            </div>

            {/* Group Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: partners.length },
                { key: 'vendor', label: 'Vendors', count: partners.filter(p => p.group === 'vendor').length },
                { key: 'customer', label: 'Customers', count: partners.filter(p => p.group === 'customer').length },
                { key: 'contact', label: 'Contacts', count: partners.filter(p => p.group === 'contact').length },
              ].map(g => (
                <button key={g.key} onClick={() => setActiveGroup(g.key as any)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    activeGroup === g.key ? "bg-brand text-white shadow-sm" : "bg-white dark:bg-[#2A2522] border border-slate-200 dark:border-brand-muted text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}>
                  {g.label} ({g.count})
                </button>
              ))}
            </div>
          </>
        )}

        {partners.length === 0 && (
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm p-12 text-center">
            <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No partner accounts yet</h3>
             <p className="text-slate-400 dark:text-slate-500 mb-6">Create a partnership to track shared budgets and P&L.</p>
            <Button onClick={() => setShowAddModal(true)}>Create First Account</Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredPartners.length === 0 && partners.length > 0 && (
            <div className="bg-white dark:bg-[#2A2522] rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm p-8 text-center">
              <p className="text-slate-400 dark:text-slate-500">No {activeGroup}s found in this group.</p>
            </div>
          )}
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white dark:bg-[#2A2522] p-6 rounded-2xl border border-slate-200 dark:border-brand-muted shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-secondary dark:bg-brand-muted/30 rounded-xl text-brand dark:text-brand-secondary"><Wallet className="h-6 w-6" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{partner.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-brand-muted rounded-full text-xs font-medium">{partner.type}</span>
                      <span>•</span>
                      <span>{partner.budgetWindowStart || 'Start'} - {partner.budgetWindowEnd || 'End'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {confirmDelete === partner.id ? (
                    <div className="flex gap-1 items-center">
                      <Button size="sm" variant="danger" className="h-6 px-1.5 text-xs min-w-0" onClick={() => handleDelete(partner.id)}>Yes</Button>
                      <Button size="sm" variant="ghost" className="h-6 px-1.5 text-xs min-w-0" onClick={() => setConfirmDelete(null)}>No</Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400" onClick={() => setConfirmDelete(partner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-brand-muted rounded-xl border border-slate-100 dark:border-brand-muted">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Investment</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(partner.initialInvestment)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-brand-muted rounded-xl border border-slate-100 dark:border-brand-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Net P&L</p>
                    {partner.net >= 0 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                  </div>
                  <p className={cn("text-xl font-bold", partner.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>{formatCurrency(partner.net)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Income: {formatCurrency(partner.income)} / Expense: {formatCurrency(partner.expense)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-brand-muted rounded-xl border border-slate-100 dark:border-brand-muted">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Total Value</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(partner.initialInvestment + partner.net)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowTxModal(partner.id)}>
                  Add Transaction
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto text-slate-500 dark:text-slate-400" onClick={() => {
                  const txs = getTransactions().filter(t => t.partnerAccountId === partner.id);
                  alert(`Transactions: ${txs.length}\nTotal Income: ${formatCurrency(partner.income)}\nTotal Expense: ${formatCurrency(partner.expense)}`);
                }}>
                  View History
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">New Partner Account</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Account Name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="e.g. Sunrise Farm Venture" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Group</label>
                  <select value={form.group} onChange={e => setForm({ ...form, group: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                    <option value="vendor">Vendor</option>
                    <option value="customer">Customer</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Type</label>
                    {!isCustomType ? (
                      <select 
                        value={form.type} 
                        onChange={e => {
                          if (e.target.value === 'CREATE_NEW') {
                            setIsCustomType(true);
                            setForm({ ...form, type: '' });
                          } else {
                            setForm({ ...form, type: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand"
                      >
                        <option value="">Select Type</option>
                        {partnerTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        <option value="CREATE_NEW" className="font-bold text-brand">+ Create new Type</option>
                      </select>
                    ) : (
                      <input required autoFocus value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Enter custom type" />
                    )}
                  </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Initial Investment</label>
                  <input type="number" value={form.initialInvestment} onChange={e => setForm({ ...form, initialInvestment: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="₹ 0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Start Date</label>
                  <input type="date" value={form.budgetWindowStart} onChange={e => setForm({ ...form, budgetWindowStart: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">End Date</label>
                  <input type="date" value={form.budgetWindowEnd} onChange={e => setForm({ ...form, budgetWindowEnd: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand resize-none h-20" placeholder="Optional notes..." />
              </div>
              <div className="flex gap-3 pt-6">
                <Button variant="ghost" className="flex-1 py-3" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 py-3">Create Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTxModal(null)}>
          <div className="bg-white dark:bg-[#2A2522] rounded-2xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Add Partner Transaction</h2>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Type</label>
                  <select value={txForm.type} onChange={e => setTxForm({ ...txForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Amount</label>
                  <input required type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="₹ 0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Custom Category</label>
                  <input required value={txForm.category} onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Enter category" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Date</label>
                  <input required type="date" value={txForm.date} onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Description</label>
                <input required value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-brand-muted outline-none focus:ring-2 focus:ring-brand" placeholder="Transaction details" />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" checked={txForm.reflectPersonal} onChange={e => setTxForm({ ...txForm, reflectPersonal: e.target.checked })}
                  className="rounded border-slate-300 dark:border-brand-muted text-brand focus:ring-brand" />
                Also reflect in personal account
              </label>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 py-3" onClick={() => setShowTxModal(null)}>Cancel</Button>
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
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">A similar entry already exists:</p>
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
    </DashboardLayout>
  );
}
