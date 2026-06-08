import { prisma } from '@/lib/prisma'
import { Users, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { bookings: true, reviews: true, itineraries: true } },
    },
  })

  const totalUsers = users.filter(u => u.role === 'user').length
  const totalAdmins = users.filter(u => u.role === 'admin').length

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Manajemen Pengguna</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{users.length} akun terdaftar</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Pengguna', val: totalUsers, color: '#0A4A5E', bg: '#E0F2FE' },
          { label: 'Total Admin', val: totalAdmins, color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Total Akun', val: users.length, color: '#059669', bg: '#D1FAE5' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0' }}>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color: c.color }}>{c.val}</div>
            <div style={{ fontSize: '0.8rem', color: '#8B98A9', marginTop: '4px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E9F0' }}>
              {['Pengguna', 'Email', 'Role', 'Booking', 'Review', 'Itinerary', 'Bergabung'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? '#0A4A5E' : '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.role === 'admin' ? 'white' : '#0A4A5E', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{u.name}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4A5568' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: u.role === 'admin' ? '#0A4A5E' : '#F0F4F8', color: u.role === 'admin' ? 'white' : '#4A5568' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 700, color: '#1A2332', textAlign: 'center' }}>{u._count.bookings}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 700, color: '#1A2332', textAlign: 'center' }}>{u._count.reviews}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 700, color: '#1A2332', textAlign: 'center' }}>{u._count.itineraries}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#8B98A9' }}>
                    <Calendar size={12} />
                    {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`.table-row:hover { background: #F8FAFC; }`}</style>
    </div>
  )
}
