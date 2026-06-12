import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, role: true },
  })
  if (user?.role !== 'owner') redirect('/')

  const destinations = await prisma.destination.findMany({
    where: { ownerId: userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total: destinations.length,
    published: destinations.filter(d => d.status === 'published').length,
    pending: destinations.filter(d => d.status === 'pending').length,
    rejected: destinations.filter(d => d.status === 'rejected').length,
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>
          Selamat datang, {user.name} 👋
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Kelola destinasi wisata Anda di sini</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Destinasi', value: stats.total, icon: MapPin, color: '#6D28D9', bg: '#EDE9FE' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: '#059669', bg: '#D1FAE5' },
          { label: 'Menunggu Approval', value: stats.pending, icon: Clock, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <card.icon size={20} color={card.color} />
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#1A2332', marginBottom: '2px' }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#8B98A9' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Destinations */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', border: '1px solid #E5E9F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332' }}>Destinasi Terbaru</h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/owner/destinasi" style={{ fontSize: '0.8rem', color: '#6D28D9', fontWeight: 600, textDecoration: 'none' }}>Lihat semua →</Link>
            <Link href="/owner/destinasi/tambah" style={{ fontSize: '0.8rem', background: '#6D28D9', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '6px 14px', borderRadius: '50px' }}>+ Tambah</Link>
          </div>
        </div>

        {destinations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8B98A9' }}>
            <MapPin size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Belum ada destinasi. <Link href="/owner/destinasi/tambah" style={{ color: '#6D28D9', fontWeight: 600 }}>Tambah sekarang →</Link></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {destinations.slice(0, 5).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.75rem', borderRadius: '12px', background: '#F8FAFC' }}>
                <img src={d.mainImage} alt={d.name} style={{ width: '48px', height: '42px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} onError={() => {}} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>{d.category.icon} {d.category.name} • {d.area}</div>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: '50px',
                  background: d.status === 'published' ? '#D1FAE5' : d.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                  color: d.status === 'published' ? '#059669' : d.status === 'pending' ? '#D97706' : '#DC2626',
                }}>
                  {d.status === 'published' ? '✓ Published' : d.status === 'pending' ? '⏳ Menunggu' : '✗ Ditolak'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', borderRadius: '16px', padding: '1.25rem', border: '1px solid #C4B5FD' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#5B21B6', marginBottom: '0.5rem' }}>ℹ️ Cara Kerja Sistem</h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#6D28D9', fontSize: '0.82rem', lineHeight: 1.8 }}>
          <li>Tambahkan destinasi baru melalui menu <strong>Tambah Destinasi</strong></li>
          <li>Destinasi baru akan berstatus <strong>Menunggu Approval</strong> dari admin</li>
          <li>Admin akan mereview dan meng-approve/menolak destinasi Anda</li>
          <li>Destinasi yang diapprove akan langsung tampil di website publik</li>
          <li>Anda dapat mengedit destinasi yang sudah published kapan saja</li>
        </ul>
      </div>
    </div>
  )
}
