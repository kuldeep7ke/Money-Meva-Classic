'use client';

import { useState, useEffect } from 'react';
import { Partner, PartnerGroup } from '@/modules/partners/types';
import { partnerService } from '@/modules/partners/services/storage';
import { PARTNER_TYPES, PARTNER_TYPE_LABELS, PartnerType } from '@/constants';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/storage';
import { Plus, Edit, Trash2, Archive, ArchiveRestore, X, Search, Users, FolderOpen, Home, User } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePinGuard } from '@/components/PinGuard';

const GROUP_COLORS = [
  '#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1',
];

export default function PartnersPage() {
  const { user } = useAuth();
  const userId = user?.id || 'user-1';
  const [partners, setPartners] = useState<Partner[]>([]);
  const [groups, setGroups] = useState<PartnerGroup[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PartnerType>('customer');
  const [formGroupId, setFormGroupId] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const { confirm } = useConfirm();
  const { requestPin, PinModal } = usePinGuard();
  const [formOpeningBalance, setFormOpeningBalance] = useState(0);
  const [formNotes, setFormNotes] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState(GROUP_COLORS[0]);
  const [filterType, setFilterType] = useState<'all' | PartnerType>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    partnerService.seedDefaults();
    setPartners(partnerService.getAll() || []);
    setGroups(partnerService.groups.getAll() || []);
  };

  const filtered = partners.filter((p) => {
    if (activeTab !== 'all' && p.groupId !== activeTab) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (search) {
      const lower = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(lower) ||
        p.email?.toLowerCase().includes(lower) ||
        p.phone?.includes(lower)
      );
    }
    return true;
  });

  const totalBalance = filtered.reduce((sum, p) => sum + p.currentBalance, 0);

  const getGroupById = (id: string) => groups.find((g) => g.id === id);

  const handleCreate = () => {
    if (!formName.trim()) return;
    partnerService.create({
      businessId: 'default',
      name: formName.trim(),
      type: formType,
      groupId: formGroupId || undefined,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      address: formAddress || undefined,
      openingBalance: formOpeningBalance,
      currentBalance: formOpeningBalance,
      notes: formNotes || undefined,
      status: 'active',
      createdBy: userId,
      updatedBy: userId,
    });
    resetForm();
    loadData();
  };

  const handleUpdate = () => {
    if (!editingId || !formName.trim()) return;
    partnerService.update(editingId, {
      name: formName.trim(),
      type: formType,
      groupId: formGroupId || undefined,
      email: formEmail || undefined,
      phone: formPhone || undefined,
      address: formAddress || undefined,
      openingBalance: formOpeningBalance,
      notes: formNotes || undefined,
      updatedBy: userId,
    });
    resetForm();
    loadData();
  };

  const handleDelete = async (id: string) => {
    requestPin(async () => {
      const partner = partners.find((p) => p.id === id);
      const ok = await confirm({
        title: 'Delete Partner',
        message: `Delete "${partner?.name}"? It will be moved to archive and can be restored later.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (ok) {
        partnerService.delete(id);
        loadData();
      }
    });
  };

  const handleArchive = (id: string) => {
    partnerService.archive(id);
    loadData();
  };

  const handleRestore = (id: string) => {
    partnerService.restore(id);
    loadData();
  };

  const startEdit = (p: Partner) => {
    requestPin(() => {
      setEditingId(p.id);
      setFormName(p.name);
      setFormType(p.type);
      setFormGroupId(p.groupId || '');
      setFormEmail(p.email || '');
      setFormPhone(p.phone || '');
      setFormAddress(p.address || '');
      setFormOpeningBalance(p.openingBalance);
      setFormNotes(p.notes || '');
      setShowForm(true);
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormType('customer');
    setFormGroupId('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormOpeningBalance(0);
    setFormNotes('');
    setShowForm(false);
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    partnerService.groups.create({
      businessId: 'default',
      name: groupName.trim(),
      description: groupDescription || undefined,
      color: groupColor,
      icon: 'folder',
      isArchived: false,
    });
    setGroupName('');
    setGroupDescription('');
    setGroupColor(GROUP_COLORS[0]);
    setShowGroupForm(false);
    loadData();
  };

  const handleUpdateGroup = () => {
    if (!editingGroupId || !groupName.trim()) return;
    partnerService.groups.update(editingGroupId, {
      name: groupName.trim(),
      description: groupDescription || undefined,
      color: groupColor,
    });
    setGroupName('');
    setGroupDescription('');
    setGroupColor(GROUP_COLORS[0]);
    setEditingGroupId(null);
    setShowGroupForm(false);
    loadData();
  };

  const handleDeleteGroup = async (id: string) => {
    requestPin(async () => {
      const group = groups.find((g) => g.id === id);
      const ok = await confirm({
        title: 'Delete Group',
        message: `Delete "${group?.name}"? Partners in this group will be unassigned.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (ok) {
        partners.filter((p) => p.groupId === id).forEach((p) => {
          partnerService.update(p.id, { groupId: undefined });
        });
        partnerService.groups.delete(id);
        if (activeTab === id) setActiveTab('all');
        loadData();
      }
    });
  };

  const startEditGroup = (g: PartnerGroup) => {
    setEditingGroupId(g.id);
    setGroupName(g.name);
    setGroupDescription(g.description || '');
    setGroupColor(g.color);
    setShowGroupForm(true);
  };

  const resetGroupForm = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupDescription('');
    setGroupColor(GROUP_COLORS[0]);
    setShowGroupForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Partners</h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-secondary)' }}>Manage customers, vendors, and contacts</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { resetGroupForm(); setShowGroupForm(true); }}
              className="flex items-center gap-2 px-4 py-3 border rounded-xl hover:opacity-80"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-card)' }}
            >
              <FolderOpen className="w-5 h-5" /> New Group
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-xl hover:opacity-90"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              <Plus className="w-5 h-5" /> Add Partner
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Partners</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</p>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#22c55e' }}>
                <span className="font-bold text-white">₹</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Balance</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#FFCF9A' }}>
                <span className="font-bold" style={{ color: '#1B1B1D' }}>✓</span>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Active</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{partners.filter((p) => p.status === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {showGroupForm && (
          <div className="p-6 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingGroupId ? 'Edit Group' : 'New Group'}</h2>
              <button onClick={resetGroupForm} className="p-1 rounded hover:opacity-80">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Group name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <input
                  type="text"
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Optional description"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Color</label>
                <div className="flex gap-2 flex-wrap">
                  {GROUP_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setGroupColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${groupColor === color ? 'scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color, borderColor: groupColor === color ? 'var(--text-primary)' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={resetGroupForm} className="px-4 py-2 border rounded-lg hover:opacity-80" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
              <button
                onClick={editingGroupId ? handleUpdateGroup : handleCreateGroup}
                disabled={!groupName.trim()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--brand)' }}
              >
                {editingGroupId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <div className="p-6 rounded-lg border mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{editingId ? 'Edit Partner' : 'New Partner'}</h2>
              <button onClick={resetForm} className="p-1 rounded hover:opacity-80">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Partner name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Group</label>
                <select
                  value={formGroupId}
                  onChange={(e) => setFormGroupId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="">No Group</option>
                  {groups.filter((g) => !g.isArchived).map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as PartnerType)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  {PARTNER_TYPES.map((t) => (
                    <option key={t} value={t}>{PARTNER_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Opening Balance</label>
                <input
                  type="number"
                  value={formOpeningBalance || ''}
                  onChange={(e) => setFormOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notes</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
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
        )}

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'all' ? 'var(--brand)' : 'var(--bg-card)',
              color: activeTab === 'all' ? '#FFFFFF' : 'var(--text-primary)',
              border: `1px solid ${activeTab === 'all' ? 'var(--brand)' : 'var(--border-color)'}`,
            }}
          >
            All ({partners.length})
          </button>
          {groups.filter((g) => !g.isArchived).map((g) => {
            const count = partners.filter((p) => p.groupId === g.id).length;
            return (
              <div key={g.id} className="flex items-center">
                <button
                  onClick={() => setActiveTab(g.id)}
                  className="px-4 py-2 rounded-l-lg text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: activeTab === g.id ? g.color : 'var(--bg-card)',
                    color: activeTab === g.id ? '#FFFFFF' : 'var(--text-primary)',
                    border: `1px solid ${activeTab === g.id ? g.color : 'var(--border-color)'}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === g.id ? '#FFFFFF' : g.color }} />
                  {g.name} ({count})
                </button>
                <div className="flex" style={{ border: `1px solid ${activeTab === g.id ? g.color : 'var(--border-color)'}`, borderLeft: 'none', borderRadius: '0 8px 8px 0' }}>
                  <button
                    onClick={() => startEditGroup(g)}
                    className="px-2 py-2 hover:opacity-80"
                    style={{ backgroundColor: activeTab === g.id ? g.color : 'var(--bg-card)', color: activeTab === g.id ? '#FFFFFF' : 'var(--text-muted)' }}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(g.id)}
                    className="px-2 py-2 hover:opacity-80 rounded-r-lg"
                    style={{ backgroundColor: activeTab === g.id ? g.color : 'var(--bg-card)', color: activeTab === g.id ? '#FFFFFF' : 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b flex items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search partners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className="px-3 py-1.5 text-sm rounded-full border transition-all"
                style={{
                  borderColor: filterType === 'all' ? 'var(--brand)' : 'var(--border-color)',
                  backgroundColor: filterType === 'all' ? 'var(--brand)' : 'var(--bg-secondary)',
                  color: filterType === 'all' ? '#FFFFFF' : 'var(--text-primary)',
                }}
              >
                All
              </button>
              {PARTNER_TYPES.map((t) => (
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
                  {PARTNER_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {filtered.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No partners found</div>
            ) : (
              filtered.map((p) => {
                const group = p.groupId ? getGroupById(p.groupId) : null;
                return (
                  <div key={p.id} className={`flex items-center justify-between p-4 ${p.status === 'archived' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ backgroundColor: group?.color || 'var(--brand)' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                          {group && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: group.color + '22', color: group.color }}>
                              {group.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {PARTNER_TYPE_LABELS[p.type]}
                          {p.email && ` • ${p.email}`}
                          {p.phone && ` • ${p.phone}`}
                          {p.status === 'archived' && ' • Archived'}
                        </p>
                        {authService.getUserById(p.createdBy) && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>by {authService.getUserById(p.createdBy)?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold" style={{ color: p.currentBalance >= 0 ? '#22c55e' : '#ef4444' }}>
                        {formatCurrency(p.currentBalance)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(p)} className="p-2 rounded hover:opacity-80" title="Edit">
                          <Edit className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                        {p.status === 'archived' ? (
                          <button onClick={() => handleRestore(p.id)} className="p-2 rounded hover:opacity-80" title="Restore">
                            <ArchiveRestore className="w-4 h-4" style={{ color: '#22c55e' }} />
                          </button>
                        ) : (
                          <button onClick={() => handleArchive(p.id)} className="p-2 rounded hover:opacity-80" title="Archive">
                            <Archive className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded hover:opacity-80" title="Delete">
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
