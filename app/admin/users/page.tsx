'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Shield, Trash2, Loader, Calendar, BookOpen, Star, Map } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  _count: { bookings: number; reviews: number; itineraries: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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
  const totalAdmins = users.filter(u => u.role === 'admin').length

  async function toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`${newRole === 'admin' ? 'Promote' : 'Demote'} ${user.name} menjadi ${newRole}?`)) return
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

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>
          Manajemen Pengguna
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{users.length} akun terdaftar</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Total Pengguna', val: totalUsers, color: '#0A4A5E', bg: '#E0F2FE', icon: Users },
          { label: 'Total Admin', val: totalAdmins, color: '#7C3AED', bg: '#EDE9FE', icon: Shield },
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
          {(['all', 'user', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '8px 16px', borderRadius: '50px', border: '2px solid',
                borderColor: roleFilter === r ? '#0A4A5E' : '#E5E9F0',
                background: roleFilter === r ? '#0A4A5E' : 'white',
                color: roleFilter === r ? 'white' : '#4A5568',
                fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              }}
            >
              {r === 'all' ? 'Semua' : r === 'admin' ? '🛡️ Admin' : '👤 User'}
              <span style={{ marginLeft: '6px', background: roleFilter === r ? 'rgba(255,255,255,0.25)' : '#F0F4F8', borderRadius: '50px', padding: '1px 7px', fontSize: '0.75rem' }}>
                {r === 'all' ? users.length : users.filter(u => u.role === r).length}
              </span>
            </button>
          ))}
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
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#0A4A5E,#1A7CA0)' : 'linear-gradient(135deg,#E0F2FE,#BAE6FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.role === 'admin' ? 'white' : '#0A4A5E', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: '#4A5568', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: u.role === 'admin' ? '#0A4A5E' : '#F0F4F8', color: u.role === 'admin' ? 'white' : '#4A5568' }}>
                      {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: u._count.itineraries > 0 ? '#059669' : '#CBD5E1' }}>
                      <Map size={13} />{u._count.itineraries}
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
                        title={u.role === 'admin' ? 'Demote ke User' : 'Promote ke Admin'}
                        style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', background: u.role === 'admin' ? '#FEF3C7' : '#EDE9FE', color: u.role === 'admin' ? '#D97706' : '#7C3AED', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {togglingId === u.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Shield size={12} />}
                        {u.role === 'admin' ? 'Demote' : 'Promote'}
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
