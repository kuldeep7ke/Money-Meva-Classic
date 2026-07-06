'use client';

import { useState, useEffect } from 'react';
import { Loan, LoanType, LOAN_TYPES, LoanStats } from '@/modules/loans/types';
import { loanService } from '@/modules/loans/services/storage';
import { formatCurrency } from '@/utils';
import { Home, Plus, Edit, Trash2, CheckCircle, X, CreditCard, TrendingUp, Wallet, PiggyBank, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useConfirm } from '@/components/ConfirmDialog';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats>({ totalGiven: 0, totalTaken: 0, totalInvested: 0, totalSaved: 0, activeLoans: 0, monthlyEmiDue: 0 });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { confirm } = useConfirm();
  const [form, setForm] = useState({
    partnerName: '', type: 'given' as LoanType, title: '', principalAmount: 0, interestRate: 0, emiAmount: 0, totalEmis: 12, paidEmis: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', nextPaymentDate: '', notes: '',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setLoans(loanService.getAll());
    setStats(loanService.getStats());
  };

  const filtered = activeTab === 'all' ? loans : loans.filter((l) => l.type === activeTab);

  const resetForm = () => {
    setForm({ partnerName: '', type: 'given', title: '', principalAmount: 0, interestRate: 0, emiAmount: 0, totalEmis: 12, paidEmis: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', nextPaymentDate: '', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.partnerName.trim()) return;
    loanService.create({
      businessId: 'default', partnerName: form.partnerName.trim(), type: form.type, title: form.title.trim(),
      principalAmount: form.principalAmount, interestRate: form.interestRate, emiAmount: form.emiAmount || form.principalAmount / form.totalEmis,
      totalEmis: form.totalEmis, paidEmis: form.paidEmis, startDate: form.startDate,
      endDate: form.endDate || new Date(new Date(form.startDate).setMonth(new Date(form.startDate).getMonth() + form.totalEmis)).toISOString().split('T')[0],
      nextPaymentDate: form.nextPaymentDate || form.startDate, status: 'active', createdBy: 'user-1', updatedBy: 'user-1',
    });
    resetForm();
    loadData();
  };

  const handleEdit = (loan: Loan) => {
    setForm({ partnerName: loan.partnerName, type: loan.type, title: loan.title, principalAmount: loan.principalAmount, interestRate: loan.interestRate, emiAmount: loan.emiAmount, totalEmis: loan.totalEmis, paidEmis: loan.paidEmis, startDate: loan.startDate, endDate: loan.endDate, nextPaymentDate: loan.nextPaymentDate, notes: loan.notes || '' });
    setEditingId(loan.id);
    setShowForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !form.title.trim()) return;
    loanService.update(editingId, { partnerName: form.partnerName.trim(), type: form.type, title: form.title.trim(), principalAmount: form.principalAmount, interestRate: form.interestRate, emiAmount: form.emiAmount, totalEmis: form.totalEmis, paidEmis: form.paidEmis, startDate: form.startDate, endDate: form.endDate, nextPaymentDate: form.nextPaymentDate, notes: form.notes || undefined });
    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    const loan = loans.find((l) => l.id === id);
    const ok = await confirm({
      title: 'Delete Loan',
      message: `Delete "${loan?.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (ok) { loanService.delete(id); loadData(); }
  };

  const handleRecordPayment = (id: string) => {
    loanService.recordPayment(id);
    loadData();
  };

  const getTypeIcon = (type: LoanType) => {
    switch (type) {
      case 'given': return <Banknote className="w-5 h-5 text-white" />;
      case 'taken': return <Banknote className="w-5 h-5 text-white" />;
      case 'emi': return <CreditCard className="w-5 h-5 text-white" />;
      case 'investment': return <TrendingUp className="w-5 h-5 text-white" />;
      case 'savings': return <PiggyBank className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Loans & Investments</h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>Track loans, EMIs, investments and savings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 text-white rounded-xl hover:opacity-90" style={{ backgroundColor: 'var(--brand)' }}>
              <Plus className="w-5 h-5" /> Add Loan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Given Out', value: stats.totalGiven, icon: <Banknote className="w-5 h-5 text-white" />, color: '#8b5cf6' },
            { label: 'Taken', value: stats.totalTaken, icon: <Banknote className="w-5 h-5 text-white" />, color: '#ec4899' },
            { label: 'Invested', value: stats.totalInvested, icon: <TrendingUp className="w-5 h-5 text-white" />, color: '#06b6d4' },
            { label: 'Saved', value: stats.totalSaved, icon: <PiggyBank className="w-5 h-5 text-white" />, color: '#10b981' },
            { label: 'Monthly EMI Due', value: stats.monthlyEmiDue, icon: <CreditCard className="w-5 h-5 text-white" />, color: 'var(--brand)' },
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: s.color }}>{s.icon}</div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(s.value)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium`} style={{ backgroundColor: activeTab === 'all' ? 'var(--brand)' : 'var(--bg-card)', color: activeTab === 'all' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>All</button>
          {LOAN_TYPES.map((lt) => (
            <button key={lt.value} onClick={() => setActiveTab(lt.value)} className="px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium" style={{ backgroundColor: activeTab === lt.value ? lt.color : 'var(--bg-card)', color: activeTab === lt.value ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border-color)' }}>{lt.label}</button>
          ))}
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Loan' : 'New Loan'}</h2>
              <button onClick={resetForm} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Partner Name *</label><input type="text" value={form.partnerName} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type *</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LoanType })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{LOAN_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Principal Amount *</label><input type="number" value={form.principalAmount || ''} onChange={(e) => setForm({ ...form, principalAmount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} min="0" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Interest Rate (%)</label><input type="number" value={form.interestRate || ''} onChange={(e) => setForm({ ...form, interestRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} min="0" step="0.1" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>EMI Amount</label><input type="number" value={form.emiAmount || ''} onChange={(e) => setForm({ ...form, emiAmount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} min="0" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Total EMIs</label><input type="number" value={form.totalEmis} onChange={(e) => setForm({ ...form, totalEmis: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} min="1" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Paid EMIs</label><input type="number" value={form.paidEmis} onChange={(e) => setForm({ ...form, paidEmis: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} min="0" /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} /></div>
              <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Next Payment Date</label><input type="date" value={form.nextPaymentDate} onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} /></div>
            </div>
            <div className="mt-4"><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} rows={2} /></div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button onClick={resetForm} className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={editingId ? handleUpdate : handleCreate} className="px-4 py-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--brand)' }}>{editingId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        )}

        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          {filtered.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--text-muted)' }}>No loans found</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filtered.map((loan) => {
                const remaining = loan.principalAmount - loan.paidEmis * loan.emiAmount;
                const progress = loan.totalEmis > 0 ? (loan.paidEmis / loan.totalEmis) * 100 : 0;
                const typeInfo = LOAN_TYPES.find((lt) => lt.value === loan.type);
                return (
                  <div key={loan.id} className="p-4 flex items-center justify-between hover:opacity-95">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: typeInfo?.color || 'var(--brand)' }}>{getTypeIcon(loan.type)}</div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{loan.title}</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{loan.partnerName} · {typeInfo?.label} · {loan.paidEmis}/{loan.totalEmis} EMIs</p>
                        <div className="w-32 h-1.5 rounded-full mt-1" style={{ backgroundColor: 'var(--border-color)' }}><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: typeInfo?.color || 'var(--brand)' }} /></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(remaining)}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>remaining</p>
                      </div>
                      {loan.status === 'active' && (
                        <button onClick={() => handleRecordPayment(loan.id)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#22c55e22' }} title="Record Payment"><CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} /></button>
                      )}
                      <button onClick={() => handleEdit(loan)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}><Edit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                      <button onClick={() => handleDelete(loan.id)} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: '#ef444422' }}><Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
