'use client';

import { useState, useEffect } from 'react';
import { Transaction, SplitDetail } from '@/modules/transactions/types';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, RECURRING_FREQUENCIES, RecurringFrequency, TransactionType } from '@/constants';
import { CategoryPicker } from '@/modules/categories/components/CategoryPicker';
import { categoryService } from '@/modules/categories/services/storage';
import { accountService } from '@/modules/accounts/services/storage';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Account } from '@/modules/accounts/types';
import { formatCurrency, generateId } from '@/utils';
import { X, Plus, Trash2, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const { user } = useAuth();
  const userId = user?.id || 'user-1';
  const [formData, setFormData] = useState({
    businessId: 'default',
    userId,
    type: 'expense' as TransactionType,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    partnerId: '',
    tags: [] as string[],
    notes: '',
    isRecurring: false,
    recurringFrequency: undefined as RecurringFrequency | undefined,
    recurringEndDate: '',
    fromAccountId: '',
    toAccountId: '',
    createdBy: userId,
    updatedBy: userId,
  });
  const [tagInput, setTagInput] = useState('');
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([]);
  const [showQuickCategory, setShowQuickCategory] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatColor, setQuickCatColor] = useState('#3b82f6');
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    setAccounts(accountService.getAll());
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        businessId: transaction.businessId,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        categoryId: transaction.categoryId,
        partnerId: transaction.partnerId || '',
        tags: transaction.tags || [],
        notes: transaction.notes || '',
        isRecurring: transaction.isRecurring,
        recurringFrequency: transaction.recurringFrequency,
        recurringEndDate: transaction.recurringEndDate || '',
        fromAccountId: transaction.fromAccountId || '',
        toAccountId: transaction.toAccountId || '',
        createdBy: transaction.createdBy,
        updatedBy: userId,
      });
      if ('splitDetails' in transaction) {
        setSplitDetails((transaction as { splitDetails: SplitDetail[] }).splitDetails || []);
      }
    }
  }, [transaction]);

  const getSmartDefaults = (type: TransactionType) => {
    const cash = accounts.find((a) => a.type === 'cash');
    const bank = accounts.find((a) => a.type === 'bank');
    switch (type) {
      case 'income': return { fromAccountId: '', toAccountId: bank?.id || cash?.id || '' };
      case 'expense': return { fromAccountId: bank?.id || cash?.id || '', toAccountId: '' };
      case 'transfer': return { fromAccountId: bank?.id || cash?.id || '', toAccountId: cash?.id || bank?.id || '' };
      default: return { fromAccountId: '', toAccountId: '' };
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    const defaults = getSmartDefaults(type);
    setFormData({ ...formData, type, ...defaults });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const addSplitDetail = () => {
    setSplitDetails([...splitDetails, { partnerId: '', amount: 0, isPaid: false }]);
  };

  const updateSplitDetail = (index: number, field: keyof SplitDetail, value: string | number | boolean) => {
    const updated = [...splitDetails];
    updated[index] = { ...updated[index], [field]: value };
    setSplitDetails(updated);
  };

  const removeSplitDetail = (index: number) => {
    setSplitDetails(splitDetails.filter((_, i) => i !== index));
  };

  const QUICK_CAT_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  const handleQuickCreateCategory = () => {
    if (!quickCatName.trim()) return;
    const catType = formData.type === 'income' || formData.type === 'expense' ? formData.type : 'both';
    const created = categoryService.create({
      businessId: 'default',
      name: quickCatName.trim(),
      color: quickCatColor,
      icon: 'tag',
      type: catType,
      isArchived: false,
      createdBy: userId,
      updatedBy: userId,
    });
    categoryService.incrementUsage(created.id);
    setFormData({ ...formData, categoryId: created.id });
    setQuickCatName('');
    setQuickCatColor('#3b82f6');
    setShowQuickCategory(false);
  };

  const fromAccount = accounts.find((a) => a.id === formData.fromAccountId);
  const toAccount = accounts.find((a) => a.id === formData.toAccountId);
  const showFlow = formData.type === 'income' || formData.type === 'expense' || formData.type === 'transfer';
  const isTransfer = formData.type === 'transfer';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {transaction ? 'Edit Transaction' : 'New Transaction'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>
      </div>

      {showFlow && accounts.length > 0 && (
        <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-[10px] font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Money Flow</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                {isTransfer ? 'From Account *' : formData.type === 'expense' ? 'Pay From *' : 'Received To *'}
              </label>
              {(isTransfer || formData.type === 'expense') ? (
                <select
                  value={formData.fromAccountId}
                  onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border rounded-lg"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="">Select</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg" style={{ backgroundColor: '#22c55e15' }}>
                  <ArrowDownRight className="w-3 h-3" style={{ color: '#22c55e' }} />
                  <span style={{ color: '#22c55e' }}>Money In</span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                {isTransfer ? 'To Account *' : formData.type === 'income' ? 'Deposit To *' : 'Paid To *'}
              </label>
              {(isTransfer || formData.type === 'income') ? (
                <select
                  value={formData.toAccountId}
                  onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                  className="w-full px-2 py-1.5 text-xs border rounded-lg"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  required
                >
                  <option value="">Select</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs rounded-lg" style={{ backgroundColor: '#ef444415' }}>
                  <ArrowUpRight className="w-3 h-3" style={{ color: '#ef4444' }} />
                  <span style={{ color: '#ef4444' }}>Money Out</span>
                </div>
              )}
            </div>
          </div>
          {fromAccount && toAccount && formData.amount > 0 && (
            <div className="mt-2 p-2 rounded-lg text-[11px]" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
              <span style={{ color: fromAccount.color }}>{fromAccount.name}</span>
              {' → '}
              <span style={{ color: toAccount.color }}>{toAccount.name}</span>
              {' · '}
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(formData.amount)}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
            className="w-full px-3 py-2 text-sm border rounded-lg"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            required
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>{TRANSACTION_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Amount *</label>
          <input
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Description *</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          placeholder="e.g. Grocery shopping, Salary received"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
            style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Category *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <CategoryPicker
                value={formData.categoryId}
                onChange={(categoryId) => setFormData({ ...formData, categoryId })}
                type={formData.type === 'income' || formData.type === 'expense' ? formData.type : 'both'}
                placeholder="Select"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQuickCategory(!showQuickCategory)}
              className="flex items-center gap-1 px-2 py-1.5 border rounded-lg text-xs whitespace-nowrap"
              style={{ borderColor: 'var(--border-color)', color: 'var(--brand)' }}
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          {showQuickCategory && (
            <div className="mt-2 p-3 rounded-lg border space-y-2" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <input type="text" placeholder="Category name" value={quickCatName} onChange={(e) => setQuickCatName(e.target.value)} className="w-full px-2 py-1.5 text-xs border rounded" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleQuickCreateCategory(); } }} />
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {QUICK_CAT_COLORS.map((c) => <button key={c} type="button" onClick={() => setQuickCatColor(c)} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c, borderColor: quickCatColor === c ? 'var(--text-primary)' : 'transparent' }} />)}
                </div>
                <div className="flex-1" />
                <button type="button" onClick={handleQuickCreateCategory} disabled={!quickCatName.trim()} className="px-3 py-1 text-white text-xs rounded disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>Add</button>
                <button type="button" onClick={() => { setShowQuickCategory(false); setQuickCatName(''); }} className="px-3 py-1 border text-xs rounded" style={{ borderColor: 'var(--border-color)' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Partner</label>
        <input
          type="text"
          value={formData.partnerId}
          onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          placeholder="Partner ID (optional)"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Tags</label>
        <div className="flex gap-2">
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1 px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Add tag + Enter" />
          <button type="button" onClick={addTag} className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Plus className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {formData.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--brand)18', color: 'var(--brand)' }}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          rows={2}
          placeholder="Optional notes"
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isRecurring" checked={formData.isRecurring} onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })} className="w-4 h-4" />
        <label htmlFor="isRecurring" className="text-sm" style={{ color: 'var(--text-primary)' }}>Recurring Transaction</label>
      </div>

      {formData.isRecurring && (
        <div className="grid grid-cols-2 gap-4 pl-6">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Frequency *</label>
            <select value={formData.recurringFrequency || ''} onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as RecurringFrequency })} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} required>
              <option value="">Select</option>
              {RECURRING_FREQUENCIES.map((freq) => <option key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>End Date *</label>
            <input type="date" value={formData.recurringEndDate} onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} required />
          </div>
        </div>
      )}

      {formData.type === 'split_bills' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Split Details</label>
            <button type="button" onClick={addSplitDetail} className="flex items-center gap-1 text-xs" style={{ color: 'var(--brand)' }}>
              <Plus className="w-3 h-3" /> Add Split
            </button>
          </div>
          {splitDetails.map((detail, index) => (
            <div key={index} className="flex items-center gap-2 pl-6">
              <input type="text" value={detail.partnerId} onChange={(e) => updateSplitDetail(index, 'partnerId', e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Partner ID" />
              <input type="number" value={detail.amount || ''} onChange={(e) => updateSplitDetail(index, 'amount', parseFloat(e.target.value) || 0)} className="w-28 px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder="Amount" />
              <label className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={detail.isPaid} onChange={(e) => updateSplitDetail(index, 'isPaid', e.target.checked)} className="w-4 h-4" /> Paid
              </label>
              <button type="button" onClick={() => removeSplitDetail(index)} style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>
          {transaction ? 'Update Transaction' : 'Create Transaction'}
        </button>
      </div>
    </form>
  );
}
