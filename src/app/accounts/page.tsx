'use client';

import { useState, useEffect } from 'react';
import { Account, AccountType } from '@/modules/accounts/types';
import { accountService } from '@/modules/accounts/services/storage';
import { formatCurrency } from '@/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePinGuard } from '@/components/PinGuard';
import { Landmark, Smartphone, Wallet, Banknote, Plus, Edit, Trash2, ArrowRightLeft, MoreVertical, X, Home } from 'lucide-react';
import Link from 'next/link';

const ACCOUNT_ICONS: Record<string, React.ReactNode> = {
  banknote: <Banknote className="w-5 h-5" />,
  landmark: <Landmark className="w-5 h-5" />,
  smartphone: <Smartphone className="w-5 h-5" />,
  wallet: <Wallet className="w-5 h-5" />,
};

const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'upi', label: 'UPI' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'other', label: 'Other' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [color, setColor] = useState('#22c55e');
  const [notes, setNotes] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const { confirm } = useConfirm();
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => {
    setAccounts(accountService.getAll());
  }, []);

  const summary = accountService.getSummary();

  const resetForm = () => {
    setName('');
    setType('cash');
    setColor('#22c55e');
    setNotes('');
    setEditAccount(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editAccount) {
      accountService.update(editAccount.id, { name: name.trim(), type, color, notes: notes || undefined });
    } else {
      accountService.create({ name: name.trim(), type, balance: 0, currency: 'INR', icon: type === 'bank' ? 'landmark' : type === 'upi' ? 'smartphone' : type === 'wallet' ? 'wallet' : 'banknote', color, isArchived: false, notes: notes || undefined });
    }
    setAccounts(accountService.getAll());
    resetForm();
  };

  const handleDelete = async (account: Account) => {
    requestPin(async () => {
      const ok = await confirm({
        title: 'Delete Account',
        message: `Delete "${account.name}"? This cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (!ok) return;
      accountService.delete(account.id);
      setAccounts(accountService.getAll());
      setShowMenu(null);
    });
  };

  const handleEdit = (account: Account) => {
    requestPin(() => {
      setEditAccount(account);
      setName(account.name);
      setType(account.type);
      setColor(account.color);
      setNotes(account.notes || '');
      setShowForm(true);
      setShowMenu(null);
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Accounts</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your money accounts and track balances</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Total Balance</p>
          <p className="text-3xl sm:text-4xl font-bold" style={{ color: summary.totalBalance >= 0 ? '#22c55e' : '#ef4444' }}>
            {formatCurrency(summary.totalBalance)}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{summary.totalAccounts} account(s)</p>
        </div>

        {showForm && (
          <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{editAccount ? 'Edit Account' : 'New Account'}</h3>
              <button onClick={resetForm}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="e.g. SBI Savings" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as AccountType)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
              <div className="flex gap-2">
                {ACCOUNT_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2" style={{ backgroundColor: c, borderColor: color === c ? 'var(--text-primary)' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Optional notes" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!name.trim()} className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>{editAccount ? 'Update' : 'Create'}</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${account.color}20` }}>
                  <span style={{ color: account.color }}>{ACCOUNT_ICONS[account.icon] || <Wallet className="w-6 h-6" />}</span>
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{account.name}</p>
                  <p className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{account.type}{account.notes ? ` · ${account.notes}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg sm:text-xl font-bold" style={{ color: account.balance >= 0 ? '#22c55e' : '#ef4444' }}>{formatCurrency(account.balance)}</span>
                <div className="relative">
                  <button onClick={() => setShowMenu(showMenu === account.id ? null : account.id)} className="p-1.5 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                  {showMenu === account.id && (
                    <div className="absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                      <button onClick={() => handleEdit(account)} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Edit className="w-4 h-4" /> Edit</button>
                      <button onClick={() => { window.location.href = `/accounts/ledger?id=${account.id}`; }} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><ArrowRightLeft className="w-4 h-4" /> Ledger</button>
                      <button onClick={() => handleDelete(account)} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No accounts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
