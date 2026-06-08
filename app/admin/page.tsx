import { prisma } from '@/lib/prisma'
import { MapPin, Users, Ticket, Star, TrendingUp, BookOpen, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const [
    totalDestinations,
    totalUsers,
    totalBookings,
    totalReviews,
    pendingBookings,
    confirmedBookings,
    featuredDestinations,
    recentBookings,
    topDestinations,
    recentReviews,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.user.count({ where: { role: 'user' } }),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.booking.count({ where: { status: 'pending' } }),
    prisma.booking.count({ where: { status: 'confirmed' } }),
    prisma.destination.count({ where: { featured: true } }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, destination: true },
    }),
    prisma.destination.findMany({
      take: 5,
      orderBy: { reviewCount: 'desc' },
      include: { category: true },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, destination: true },
    }),
  ])

  const totalRevenue = await prisma.booking.aggregate({
    _sum: { totalPrice: true },
    where: { status: 'confirmed' },
  })

  return {
    totalDestinations, totalUsers, totalBookings, totalReviews,
    pendingBookings, confirmedBookings, featuredDestinations,
    recentBookings, topDestinations, recentReviews,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Destinasi', value: stats.totalDestinations, icon: MapPin, color: '#0A4A5E', bg: '#E0F2FE', link: '/admin/destinasi' },
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: '#7C3AED', bg: '#EDE9FE', link: '/admin/users' },
    { label: 'Total Pemesanan', value: stats.totalBookings, icon: Ticket, color: '#D97706', bg: '#FEF3C7', link: '/admin/bookings' },
    { label: 'Total Ulasan', value: stats.totalReviews, icon: Star, color: '#059669', bg: '#D1FAE5', link: '/admin/ulasan' },
    { label: 'Pending Booking', value: stats.pendingBookings, icon: Clock, color: '#DC2626', bg: '#FEE2E2', link: '/admin/bookings' },
    { label: 'Booking Confirmed', value: stats.confirmedBookings, icon: CheckCircle, color: '#059669', bg: '#D1FAE5', link: '/admin/bookings' },
    { label: 'Featured Destinasi', value: stats.featuredDestinations, icon: TrendingUp, color: '#FF6B35', bg: '#FFF5F1', link: '/admin/destinasi' },
    { label: 'Total Pendapatan', value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}jt`, icon: BookOpen, color: '#0A4A5E', bg: '#E0F2FE', link: '/admin/bookings' },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Selamat datang di Admin Panel MLAKOOW</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0', transition: 'all 0.2s', cursor: 'pointer' }} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={20} color={card.color} />
                </div>
              </div>
              <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#1A2332', marginBottom: '2px' }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#8B98A9', fontWeight: 500 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Recent Bookings */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Pemesanan Terbaru</h2>
            <Link href="/admin/bookings" style={{ fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.recentBookings.length === 0 ? (
              <p style={{ color: '#8B98A9', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>Belum ada pemesanan</p>
            ) : stats.recentBookings.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '10px', background: '#F8FAFC' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.destination.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8B98A9' }}>{b.user.name} • {b.ticketCount} tiket</div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                  background: b.status === 'confirmed' ? '#D1FAE5' : b.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                  color: b.status === 'confirmed' ? '#059669' : b.status === 'cancelled' ? '#DC2626' : '#D97706',
                }}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Destinasi Terpopuler</h2>
            <Link href="/admin/destinasi" style={{ fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stats.topDestinations.map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '10px', background: '#F8FAFC' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: i === 0 ? '#FF6B35' : '#E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? 'white' : '#8B98A9', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#8B98A9' }}>{d.category.icon} {d.category.name} • ⭐ {d.rating.toFixed(1)}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8B98A9', flexShrink: 0 }}>{d.reviewCount} ulasan</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Ulasan Terbaru</h2>
          <Link href="/admin/ulasan" style={{ fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
          {stats.recentReviews.length === 0 ? (
            <p style={{ color: '#8B98A9', fontSize: '0.85rem' }}>Belum ada ulasan</p>
          ) : stats.recentReviews.map((r) => (
            <div key={r.id} style={{ padding: '0.875rem', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #F0F4F8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2332' }}>{r.user.name}</div>
                <div style={{ color: '#F59E0B', fontSize: '0.8rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8B98A9', marginBottom: '6px' }}>{r.destination.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#4A5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(10,74,94,0.1); }
      `}</style>
    </div>
  )
}
