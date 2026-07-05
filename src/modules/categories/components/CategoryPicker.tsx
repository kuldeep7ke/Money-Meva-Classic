'use client';

import { useState, useEffect, useRef } from 'react';
import { Category } from '@/modules/categories/types';
import { categoryService } from '@/modules/categories/services/storage';
import { Plus, X, Search, Clock, Star, ChevronDown } from 'lucide-react';

interface CategoryPickerProps {
  value: string;
  onChange: (categoryId: string, category?: Category) => void;
  type?: 'income' | 'expense' | 'both';
  placeholder?: string;
}

const CATEGORY_COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
  '#0ea5e9', '#a855f7', '#10b981', '#d946ef', '#f43f5e',
];

export function CategoryPicker({ value, onChange, type = 'both', placeholder = 'Select category' }: CategoryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);
  const [mostUsedCategories, setMostUsedCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0]);
  const [newType, setNewType] = useState<'income' | 'expense' | 'both'>('both');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowNewForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = () => {
    categoryService.seedDefaults();
    const all = categoryService.getAll();
    setCategories(all);
    setRecentCategories(categoryService.getRecent(5));
    setMostUsedCategories(categoryService.getMostUsed(5));
  };

  const filteredCategories = categories.filter((cat) => {
    if (cat.isArchived) return false;
    if (type !== 'both' && cat.type !== type && cat.type !== 'both') return false;
    if (search) {
      return cat.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const selectedCategory = categories.find((cat) => cat.id === value);

  const handleSelect = (cat: Category) => {
    categoryService.incrementUsage(cat.id);
    onChange(cat.id, cat);
    setIsOpen(false);
    setSearch('');
    loadCategories();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const created = categoryService.create({
      businessId: 'default',
      name: newName.trim(),
      color: newColor,
      icon: 'tag',
      type: newType,
      isArchived: false,
      createdBy: 'user-1',
      updatedBy: 'user-1',
    });
    categoryService.incrementUsage(created.id);
    onChange(created.id, created);
    setNewName('');
    setNewColor(CATEGORY_COLORS[0]);
    setShowNewForm(false);
    setIsOpen(false);
    setSearch('');
    loadCategories();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:outline-none text-left text-sm"
        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: selectedCategory ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: selectedCategory.color }} />
            <span>{selectedCategory.name}</span>
          </div>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-80 overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-sm border rounded focus:outline-none"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-60">
            {!search && recentCategories.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-1 text-xs mb-1 px-2" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" /> Recent
                </div>
                {recentCategories.map((cat) => (
                  <button
                    key={`recent-${cat.id}`}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:opacity-80"
                    style={{ backgroundColor: value === cat.id ? '#3b82f618' : 'transparent', color: 'var(--text-primary)' }}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}

            {!search && mostUsedCategories.length > 0 && (
              <div className="p-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-1 text-xs mb-1 px-2" style={{ color: 'var(--text-muted)' }}>
                  <Star className="w-3 h-3" /> Most Used
                </div>
                {mostUsedCategories.map((cat) => (
                  <button
                    key={`used-${cat.id}`}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:opacity-80"
                    style={{ backgroundColor: value === cat.id ? '#3b82f618' : 'transparent', color: 'var(--text-primary)' }}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{cat.usageCount}x</span>
                  </button>
                ))}
              </div>
            )}

            <div className="p-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-1 text-xs mb-1 px-2" style={{ color: 'var(--text-muted)' }}>
                All Categories
              </div>
              {filteredCategories.length === 0 ? (
                <div className="text-center py-4 text-sm" style={{ color: 'var(--text-muted)' }}>No categories found</div>
              ) : (
                filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:opacity-80"
                    style={{ backgroundColor: value === cat.id ? '#3b82f618' : 'transparent', color: 'var(--text-primary)' }}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span>{cat.name}</span>
                    {cat.type !== 'both' && (
                      <span className="text-xs capitalize ml-auto" style={{ color: 'var(--text-muted)' }}>{cat.type}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="p-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            {showNewForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  autoFocus
                />
                <div className="flex gap-1 flex-wrap">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className="w-6 h-6 rounded-full border-2"
                      style={{ backgroundColor: color, borderColor: newColor === color ? 'var(--text-primary)' : 'transparent' }}
                    />
                  ))}
                </div>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as 'income' | 'expense' | 'both')}
                  className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="both">Both</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCreate} disabled={!newName.trim()} className="flex-1 px-3 py-1.5 text-white text-sm rounded disabled:opacity-50" style={{ backgroundColor: 'var(--brand)' }}>Create</button>
                  <button type="button" onClick={() => { setShowNewForm(false); setNewName(''); }} className="px-3 py-1.5 border text-sm rounded" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
                </div>
              </div>
            ) : filteredCategories.length === 0 && search ? (
              <button type="button" onClick={() => setShowNewForm(true)} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:opacity-80" style={{ color: 'var(--brand)' }}>
                <Plus className="w-4 h-4" /> Create &quot;{search}&quot;
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
