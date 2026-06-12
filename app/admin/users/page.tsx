'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Shield, Trash2, Loader, Calendar, BookOpen, Star, Map, Plus, X, Eye, EyeOff } from 'lucide-react'
import { ROLE_META } from '@/lib/roles'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  _count: { bookings: number; reviews: number; itineraries: number; ownedDestinations: number }
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: '👑 Super Admin',
  admin: '🛡️ Admin',
  owner: '🏪 Owner',
  user: '👤 User',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'owner' | 'admin' | 'superadmin'>('all')
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false) })
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const totalUsers = users.filter(u => u.role === 'user').length
  const totalAdmins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length
  const totalOwners = users.filter(u => u.role === 'owner').length

  async function toggleRole(user: User) {
    const options = {
      superadmin: ['admin', 'user'],
      admin: ['superadmin', 'owner', 'user'],
      owner: ['user', 'admin'],
      user: ['owner', 'admin'],
    } as Record<string, string[]>
    const nextRoles = options[user.role] || ['user']
    const newRole = nextRoles[0] // simplest: cycle to next
    const label = ROLE_LABELS[newRole] || newRole
    if (!confirm(`Ubah role ${user.name} menjadi ${label}?`)) return
    setTogglingId(user.id)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    setTogglingId(null)
  }

  async function deleteUser(user: User) {
    if (!confirm(`Hapus akun ${user.name}? Semua data (booking, review, itinerary) akan ikut terhapus.`)) return
    setDeletingId(user.id)
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    setUsers(prev => prev.filter(u => u.id !== user.id))
    setDeletingId(null)
  }

  async function createUser() {
    setAddError(''); setAddLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm),
    })
    const data = await res.json()
    if (res.ok) {
      setUsers(prev => [{ ...data, _count: { bookings: 0, reviews: 0, itineraries: 0, ownedDestinations: 0 } }, ...prev])
      setAddForm({ name: '', email: '', password: '', role: 'user' })
      setShowAddForm(false)
    } else {
      setAddError(data.error || 'Gagal membuat user')
    }
    setAddLoading(false)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 13px', borderRadius: '10px', border: '1.5px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white', boxSizing: 'border-box' }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Manajemen Pengguna</h1>
          <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{users.length} akun terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: showAddForm ? '#F0F4F8' : '#0A4A5E', color: showAddForm ? '#4A5568' : 'white', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
        >
          {showAddForm ? <><X size={16} /> Batal</> : <><Plus size={16} /> Tambah Pengguna</>}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Pengguna', val: totalUsers, color: '#0A4A5E', bg: '#E0F2FE', icon: Users },
          { label: 'Owner/Pengelola', val: totalOwners, color: '#7C3AED', bg: '#EDE9FE', icon: Shield },
          { label: 'Total Admin', val: totalAdmins, color: '#D97706', bg: '#FEF3C7', icon: Shield },
          { label: 'Total Akun', val: users.length, color: '#059669', bg: '#D1FAE5', icon: Users },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <c.icon size={20} color={c.color} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.6rem', color: c.color, lineHeight: 1 }}>{c.val}</div>
              <div style={{ fontSize: '0.78rem', color: '#8B98A9', marginTop: '2px' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '2px solid #0A4A5E', marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '1.25rem' }}>➕ Tambah Pengguna Baru</h2>
          {addError && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>⚠️ {addError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div><label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#4A5568', marginBottom: '5px' }}>Nama Lengkap *</label>
              <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#4A5568', marginBottom: '5px' }}>Email *</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="john@email.com" style={inputStyle} /></div>
            <div><label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#4A5568', marginBottom: '5px' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 6 karakter" style={{ ...inputStyle, paddingRight: '36px' }} />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B98A9' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div><label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#4A5568', marginBottom: '5px' }}>Role *</label>
              <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} style={inputStyle}>
                <option value="user">👤 User</option>
                <option value="owner">🏪 Owner/Pengelola</option>
                <option value="admin">🛡️ Admin</option>
                <option value="superadmin">👑 Super Admin</option>
              </select>
            </div>
            <button onClick={createUser} disabled={addLoading || !addForm.name || !addForm.email || !addForm.password} style={{ padding: '9px 18px', borderRadius: '10px', background: '#0A4A5E', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {addLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
              Buat Akun
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '12px', border: '1.5px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'user', 'owner', 'admin', 'superadmin'] as const).map(r => {
            const meta = r === 'all' ? null : ROLE_META[r]
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '8px 14px', borderRadius: '50px', border: '2px solid',
                  borderColor: roleFilter === r ? (meta?.color || '#0A4A5E') : '#E5E9F0',
                  background: roleFilter === r ? (meta?.color || '#0A4A5E') + '15' : 'white',
                  color: roleFilter === r ? (meta?.color || '#0A4A5E') : '#4A5568',
                  fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                {r === 'all' ? 'Semua' : `${meta?.emoji} ${meta?.label}`}
                <span style={{ marginLeft: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '50px', padding: '1px 7px', fontSize: '0.72rem' }}>
                  {r === 'all' ? users.length : users.filter(u => u.role === r).length}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E9F0' }}>
                {['Pengguna', 'Email', 'Role', 'Booking', 'Review', 'Itinerary', 'Bergabung', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                  {/* Avatar + Name */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%',
                        background: u.role === 'superadmin' ? 'linear-gradient(135deg,#D97706,#F59E0B)'
                          : u.role === 'admin' ? 'linear-gradient(135deg,#0A4A5E,#1A7CA0)'
                          : u.role === 'owner' ? 'linear-gradient(135deg,#6D28D9,#8B5CF6)'
                          : 'linear-gradient(135deg,#E0F2FE,#BAE6FD)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: u.role === 'user' ? '#0A4A5E' : 'white',
                        fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4A5568', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                      background: ROLE_META[u.role]?.bg || '#F0F4F8',
                      color: ROLE_META[u.role]?.color || '#4A5568' }}>
                      {ROLE_META[u.role]?.emoji} {ROLE_META[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: u._count.bookings > 0 ? '#D97706' : '#CBD5E1' }}>
                      <BookOpen size={13} />{u._count.bookings}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: u._count.reviews > 0 ? '#F59E0B' : '#CBD5E1' }}>
                      <Star size={13} />{u._count.reviews}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: u._count.ownedDestinations > 0 ? '#7C3AED' : '#CBD5E1' }}>
                      🏪{u._count.ownedDestinations}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#8B98A9' }}>
                      <Calendar size={12} />
                      {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Promote/Demote */}
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={togglingId === u.id}
                        title={`Ubah role ${u.name}`}
                        style={{ padding: '5px 10px', borderRadius: '8px', border: 'none',
                          background: ROLE_META[u.role]?.bg || '#F0F4F8',
                          color: ROLE_META[u.role]?.color || '#4A5568',
                          cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {togglingId === u.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Shield size={12} />}
                        Ubah Role
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteUser(u)}
                        disabled={deletingId === u.id}
                        title="Hapus akun"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FEE2E2', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {deletingId === u.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>Tidak ada pengguna ditemukan</div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .table-row:hover { background: #F8FAFC; }
      `}</style>
    </div>
  )
}
