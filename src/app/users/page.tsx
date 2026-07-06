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
    <div className="min-h-screen p-4 sm:px-6 md:px-8 py-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {PinModal}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Users</h1>
              <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>{users.length} user(s) · Your role: <span className="font-bold" style={{ color: ROLE_COLORS[currentUser?.role || 'user'] }}>{ROLE_LABELS[currentUser?.role || 'user']}</span></p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-5 py-3 text-white rounded-xl text-base font-bold" style={{ backgroundColor: 'var(--brand)' }}>
              <UserPlus className="w-5 h-5" /> Add User
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-6 rounded-2xl border space-y-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{editUser ? 'Edit User' : 'New User'}</h3>
              <button onClick={resetForm} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}><X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-base border rounded-xl" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 text-base border rounded-xl" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Role *</label>
                <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-4 py-3 text-base border rounded-xl" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{editUser ? 'New PIN (leave blank to keep)' : 'PIN *'}</label>
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 text-base border rounded-xl pr-12" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }} placeholder={editUser ? '••••' : '4-6 digits'} maxLength={6} />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"><span style={{ color: 'var(--text-muted)' }}>{showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</span></button>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Role Permissions</p>
              <div className="flex flex-wrap gap-2">
                {ROLE_PERMISSIONS[role].slice(0, 10).map((p) => (
                  <span key={p} className="text-sm px-3 py-1.5 rounded-lg font-semibold" style={{ backgroundColor: `${ROLE_COLORS[role]}18`, color: ROLE_COLORS[role] }}>{p}</span>
                ))}
                {ROLE_PERMISSIONS[role].length > 10 && <span className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>+{ROLE_PERMISSIONS[role].length - 10} more</span>}
              </div>
            </div>

            {error && <p className="text-base text-center font-medium" style={{ color: '#ef4444' }}>{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={resetForm} className="px-5 py-3 text-base font-semibold border rounded-xl" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleSubmit} className="px-5 py-3 text-base font-bold text-white rounded-xl" style={{ backgroundColor: 'var(--brand)' }}>{editUser ? 'Update' : 'Create'}</button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-5 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: ROLE_COLORS[u.role] }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                    {u.id === currentUser?.id && <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ backgroundColor: 'var(--brand)18', color: 'var(--brand)' }}>YOU</span>}
                  </div>
                  <p className="text-base mt-0.5" style={{ color: 'var(--text-muted)' }}>{u.email} · Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}>{ROLE_LABELS[u.role]}</span>
                {canManage && u.id !== currentUser?.id && (
                  <div className="relative">
                    <button onClick={() => setShowMenu(showMenu === u.id ? null : u.id)} className="p-2 rounded-xl hover:opacity-80" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                    {showMenu === u.id && (
                      <div className="absolute right-0 top-full mt-1 border rounded-xl shadow-lg z-10 min-w-[140px]" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                        <button onClick={() => handleEdit(u)} className="w-full px-4 py-3 text-left text-base font-medium hover:opacity-80 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}><Edit className="w-4 h-4" /> Edit</button>
                        <button onClick={() => handleDelete(u)} className="w-full px-4 py-3 text-left text-base font-medium hover:opacity-80 flex items-center gap-3" style={{ color: '#ef4444' }}><Trash2 className="w-4 h-4" /> Delete</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-xl font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Role Access Overview</h3>
          <div className="space-y-5">
            {(['admin', 'manager', 'user'] as UserRole[]).map((r) => (
              <div key={r} className="p-5 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: ROLE_COLORS[r] }} />
                  <span className="text-lg font-bold" style={{ color: ROLE_COLORS[r] }}>{ROLE_LABELS[r]}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({ROLE_PERMISSIONS[r].length} permissions)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_PERMISSIONS[r].map((p) => (
                    <span key={p} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>{p}</span>
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
