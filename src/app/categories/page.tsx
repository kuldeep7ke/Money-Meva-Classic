'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/modules/categories/types';
import { categoryService } from '@/modules/categories/services/storage';
import { Plus, Edit, Trash2, Archive, ArchiveRestore, X, Search, Home } from 'lucide-react';
import Link from 'next/link';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePinGuard } from '@/components/PinGuard';

const CATEGORY_COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
  '#0ea5e9', '#a855f7', '#10b981', '#d946ef', '#f43f5e',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(CATEGORY_COLORS[0]);
  const [formType, setFormType] = useState<'income' | 'expense' | 'both'>('both');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const { confirm } = useConfirm();
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    categoryService.seedDefaults();
    setCategories(categoryService.getAll());
  };

  const filtered = categories.filter((cat) => {
    if (filterType !== 'all' && cat.type !== filterType && cat.type !== 'both') return false;
    if (search) return cat.name.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const handleCreate = () => {
    if (!formName.trim()) return;
    categoryService.create({
      businessId: 'default',
      name: formName.trim(),
      color: formColor,
      icon: 'tag',
      type: formType,
      isArchived: false,
      createdBy: 'user-1',
      updatedBy: 'user-1',
    });
    resetForm();
    loadCategories();
  };

  const handleUpdate = () => {
    if (!editingId || !formName.trim()) return;
    categoryService.update(editingId, {
      name: formName.trim(),
      color: formColor,
      type: formType,
    });
    resetForm();
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    requestPin(async () => {
      const cat = categories.find((c) => c.id === id);
      const ok = await confirm({
        title: 'Delete Category',
        message: `Delete "${cat?.name}"? It will be moved to archive and can be restored later.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (ok) {
        categoryService.delete(id);
        loadCategories();
      }
    });
  };

  const handleArchive = (id: string) => {
    categoryService.archive(id);
    loadCategories();
  };

  const handleRestore = (id: string) => {
    categoryService.restore(id);
    loadCategories();
  };

  const startEdit = (cat: Category) => {
    requestPin(() => {
      setEditingId(cat.id);
      setFormName(cat.name);
      setFormColor(cat.color);
      setFormType(cat.type);
      setShowForm(true);
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormColor(CATEGORY_COLORS[0]);
    setFormType('both');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Categories</h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your transaction categories</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-xl hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-5 h-5" /> Add Category
            </button>
          </div>
        </div>

        {showForm && (
          <div className="p-6 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={resetForm} className="p-1 rounded hover:opacity-80">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${formColor === color ? 'scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color, borderColor: formColor === color ? 'var(--text-primary)' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'income' | 'expense' | 'both')}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={resetForm} className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={!formName.trim()}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 text-sm rounded-full border transition-all"
                  style={{
                    borderColor: filterType === t ? 'var(--brand)' : 'var(--border-color)',
                    backgroundColor: filterType === t ? 'var(--brand)' : 'var(--bg-secondary)',
                    color: filterType === t ? '#FFFFFF' : 'var(--text-primary)',
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filtered.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No categories found</div>
            ) : (
              filtered.map((cat) => (
                <div key={cat.id} className={`flex items-center justify-between p-4 ${cat.isArchived ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {cat.type === 'both' ? 'Income & Expense' : cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                        {cat.usageCount > 0 && ` • Used ${cat.usageCount}x`}
                        {cat.isArchived && ' • Archived'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(cat)} className="p-2 rounded hover:opacity-80" title="Edit">
                      <Edit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    {cat.isArchived ? (
                      <button onClick={() => handleRestore(cat.id)} className="p-2 rounded hover:opacity-80" title="Restore">
                        <ArchiveRestore className="w-4 h-4" style={{ color: '#22c55e' }} />
                      </button>
                    ) : (
                      <button onClick={() => handleArchive(cat.id)} className="p-2 rounded hover:opacity-80" title="Archive">
                        <Archive className="w-4 h-4" style={{ color: '#f59e0b' }} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(cat.id)} className="p-2 rounded hover:opacity-80" title="Delete">
                      <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
