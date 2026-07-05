'use client';

import { Transaction } from '@/modules/transactions/types';
import { TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_COLORS } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';
import { accountService } from '@/modules/accounts/services/storage';
import { authService } from '@/modules/auth/services/storage';
import { Trash2, Edit, Eye, MoreVertical, ArrowRight, ArrowDownRight, ArrowUpRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  onView,
  selected = false,
  onSelect,
  showCheckbox = false,
}: TransactionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const typeColor = TRANSACTION_TYPE_COLORS[transaction.type];
  const typeLabel = TRANSACTION_TYPE_LABELS[transaction.type];

  const fromAccount = transaction.fromAccountId ? accountService.getById(transaction.fromAccountId) : null;
  const toAccount = transaction.toAccountId ? accountService.getById(transaction.toAccountId) : null;
  const createdByUser = authService.getUserById(transaction.createdBy);

  return (
    <div
      className="flex items-center justify-between p-4 border rounded-lg hover:opacity-95 transition-all"
      style={{
        borderColor: selected ? 'var(--brand)' : 'var(--border-color)',
        backgroundColor: selected ? 'var(--brand)0a' : 'var(--bg-card)',
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showCheckbox && (
          <input type="checkbox" checked={selected} onChange={() => onSelect?.(transaction.id)} className="w-5 h-5" />
        )}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: typeColor }}>
          {typeLabel.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{transaction.description}</p>
          <div className="flex items-center gap-1.5 text-xs flex-wrap mt-0.5" style={{ color: 'var(--text-muted)' }}>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white" style={{ backgroundColor: typeColor }}>{typeLabel}</span>
            <span>{formatDate(transaction.date)}</span>
            {fromAccount && toAccount && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <span style={{ color: fromAccount.color }}>{fromAccount.name}</span>
                  <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: toAccount.color }}>{toAccount.name}</span>
                </span>
              </>
            )}
            {!fromAccount && toAccount && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5" style={{ color: '#22c55e' }}>
                  <ArrowDownRight className="w-3 h-3" /> {toAccount.name}
                </span>
              </>
            )}
            {fromAccount && !toAccount && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5" style={{ color: '#ef4444' }}>
                  <ArrowUpRight className="w-3 h-3" /> {fromAccount.name}
                </span>
              </>
            )}
          </div>
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {transaction.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{tag}</span>
              ))}
            </div>
          )}
          {createdByUser && (
            <div className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{createdByUser.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-base font-bold" style={{ color: transaction.type === 'income' ? '#22c55e' : transaction.type === 'expense' ? '#ef4444' : 'var(--text-primary)' }}>
          {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}{formatCurrency(transaction.amount)}
        </span>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <button onClick={() => { onView(transaction.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Eye className="w-4 h-4" /> View</button>
              <button onClick={() => { onEdit(transaction.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Edit className="w-4 h-4" /> Edit</button>
              <button onClick={() => { onDelete(transaction.id); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /> Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
