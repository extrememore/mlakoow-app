import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Ticket, Calendar } from 'lucide-react'

async function getBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, destination: true },
  })
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings()

  const total = bookings.length
  const pending = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  const revenue = bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + b.totalPrice, 0)

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Manajemen Pemesanan</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{total} total pemesanan</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Booking', val: total, color: '#0A4A5E', bg: '#E0F2FE' },
          { label: 'Pending', val: pending, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Confirmed', val: confirmed, color: '#059669', bg: '#D1FAE5' },
          { label: 'Pendapatan', val: `Rp ${(revenue / 1000).toFixed(0)}K`, color: '#7C3AED', bg: '#EDE9FE' },
        ].map(c => (
          <div key={c.label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0' }}>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color: c.color, marginBottom: '4px' }}>{c.val}</div>
            <div style={{ fontSize: '0.8rem', color: '#8B98A9' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E9F0' }}>
              {['Kode', 'Pengguna', 'Destinasi', 'Tanggal Kunjungan', 'Tiket', 'Total', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>Belum ada pemesanan</td></tr>
            ) : bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                <td style={{ padding: '12px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#0A4A5E', fontFamily: 'monospace' }}>{b.bookingCode}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1A2332' }}>{b.user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>{b.user.email}</div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#1A2332', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.destination.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.82rem', color: '#4A5568' }}>
                    <Calendar size={13} />
                    {new Date(b.visitDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Ticket size={13} color="#8B98A9" /> {b.ticketCount}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#1A2332' }}>Rp {b.totalPrice.toLocaleString('id-ID')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px',
                    background: b.status === 'confirmed' ? '#D1FAE5' : b.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                    color: b.status === 'confirmed' ? '#059669' : b.status === 'cancelled' ? '#DC2626' : '#D97706',
                  }}>
                    {b.status === 'confirmed' ? '✓ Confirmed' : b.status === 'cancelled' ? '✗ Cancelled' : '⏳ Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link href={`/admin/bookings/${b.id}`} style={{ fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600, textDecoration: 'none', padding: '5px 12px', borderRadius: '8px', background: '#E0F2FE' }}>
                    Detail
                  </Link>
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
