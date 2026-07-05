'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/storage';
import { User, UserRole, ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS } from '@/modules/auth/types';
import { formatCurrency } from '@/utils';
import { useConfirm } from '@/components/ConfirmDialog';
import { usePinGuard } from '@/components/PinGuard';
import { Shield, UserPlus, Edit, Trash2, MoreVertical, X, Lock, Eye, EyeOff, Users, Home } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { confirm } = useConfirm();
  const { requestPin, PinModal } = usePinGuard();

  useEffect(() => {
    setUsers(authService.getUsers());
  }, []);

  const resetForm = () => {
    setName(''); setEmail(''); setRole('user'); setPin('');
    setEditUser(null); setShowForm(false); setError(''); setShowPin(false);
  };

  const handleSubmit = () => {
    setError('');
    if (!name.trim()) { setError('Name required'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Valid email required'); return; }
    if (!editUser && pin.length < 4) { setError('PIN must be 4+ digits'); return; }

    if (editUser) {
      const updates: Partial<User> = { name: name.trim(), email: email.trim(), role };
      if (pin.length >= 4) updates.pin = pin;
      authService.updateUser(editUser.id, updates);
    } else {
      authService.createUser({ name: name.trim(), email: email.trim(), role, pin });
    }
    setUsers(authService.getUsers());
    resetForm();
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) { setError("Can't delete yourself"); return; }
    requestPin(async () => {
      const ok = await confirm({
        title: 'Delete User',
        message: `Delete "${user.name}"? They will lose access immediately.`,
        confirmText: 'Delete',
        variant: 'danger',
      });
      if (!ok) return;
      authService.deleteUser(user.id);
      setUsers(authService.getUsers());
      setShowMenu(null);
    });
  };

  const handleEdit = (user: User) => {
    requestPin(() => {
      setEditUser(user);
      setName(user.name); setEmail(user.email); setRole(user.role); setPin('');
      setShowForm(true); setShowMenu(null);
    });
  };

  const canManage = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{users.length} user(s) · Your role: <span className="font-bold" style={{ color: ROLE_COLORS[currentUser?.role || 'user'] }}>{ROLE_LABELS[currentUser?.role || 'user']}</span></p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--brand)' }}>
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-4 rounded-xl border space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{editUser ? 'Edit User' : 'New User'}</h3>
              <button onClick={resetForm}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Role *</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{editUser ? 'New PIN (leave blank to keep)' : 'PIN *'}</label>
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-3 py-2 text-sm border rounded-lg pr-10" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder={editUser ? '••••' : '4-6 digits'} maxLength={6} />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-2 top-1/2 -translate-y-1/2"><span style={{ color: 'var(--text-muted)' }}>{showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</span></button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Role Permissions</p>
              <div className="flex flex-wrap gap-1">
                {ROLE_PERMISSIONS[role].slice(0, 10).map((p) => (
                  <span key={p} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${ROLE_COLORS[role]}18`, color: ROLE_COLORS[role] }}>{p}</span>
                ))}
                {ROLE_PERMISSIONS[role].length > 10 && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>+{ROLE_PERMISSIONS[role].length - 10} more</span>}
              </div>
            </div>

            {error && <p className="text-xs text-center" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="px-4 py-2 text-sm border rounded-lg" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm text-white rounded-lg" style={{ backgroundColor: 'var(--brand)' }}>{editUser ? 'Update' : 'Create'}</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: ROLE_COLORS[u.role] }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    {u.id === currentUser?.id && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--brand)18', color: 'var(--brand)' }}>YOU</span>}
                  </div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{u.email} · Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                {canManage && u.id !== currentUser?.id && (
                  <div className="relative">
                    <button onClick={() => setShowMenu(showMenu === u.id ? null : u.id)} className="p-1.5 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <MoreVertical className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    {showMenu === u.id && (
                      <div className="absolute right-0 top-full mt-1 border rounded-lg shadow-lg z-10 min-w-[120px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <button onClick={() => handleEdit(u)} className="w-full px-3 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Edit className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => handleDelete(u)} className="w-full px-3 py-2 text-left text-sm hover:opacity-80 flex items-center gap-2" style={{ color: '#ef4444' }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Role Access Overview</h3>
          <div className="space-y-3">
            {(['admin', 'manager', 'user'] as UserRole[]).map((r) => (
              <div key={r} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[r] }} />
                  <span className="text-xs font-bold" style={{ color: ROLE_COLORS[r] }}>{ROLE_LABELS[r]}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({ROLE_PERMISSIONS[r].length} permissions)</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[r].map((p) => (
                    <span key={p} className="text-[9px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
