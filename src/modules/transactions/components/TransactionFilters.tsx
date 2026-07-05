'use client';

import { useState } from 'react';
import { TransactionFilters as Filters } from '@/modules/transactions/types';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TransactionType } from '@/constants';
import { Filter, X } from 'lucide-react';

interface TransactionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = !!(
    (filters.type && filters.type.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.minAmount ||
    filters.maxAmount
  );

  const handleTypeToggle = (type: TransactionType) => {
    const current = filters.type || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onFiltersChange({ ...filters, type: updated.length > 0 ? updated : undefined });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    onFiltersChange({ ...filters, [field]: value || undefined });
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: string) => {
    onFiltersChange({ ...filters, [field]: value ? parseFloat(value) : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:opacity-80"
          style={{
            borderColor: hasActiveFilters ? '#3b82f6' : 'var(--border-color)',
            color: 'var(--text-primary)',
            backgroundColor: hasActiveFilters ? '#3b82f612' : 'var(--bg-card)',
          }}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {(filters.type?.length || 0) + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0) + (filters.minAmount ? 1 : 0) + (filters.maxAmount ? 1 : 0)}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 border rounded-lg space-y-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Transaction Types</label>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className="px-3 py-1 text-sm rounded-full border"
                  style={{
                    backgroundColor: filters.type?.includes(type) ? '#3b82f6' : 'var(--bg-card)',
                    color: filters.type?.includes(type) ? 'white' : 'var(--text-primary)',
                    borderColor: filters.type?.includes(type) ? '#3b82f6' : 'var(--border-color)',
                  }}
                >
                  {TRANSACTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Date From</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Date To</label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleDateChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Max Amount</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxAmount || ''}
                onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
