import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Eye } from 'lucide-react'
import { getDetailHref } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

export default async function OwnerDestinasiPage() {
  const session = await auth()
  const userId = session?.user ? parseInt((session.user as any).id) : null
  if (!userId) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
  if (user?.role !== 'owner') redirect('/')

  const destinations = await prisma.destination.findMany({
    where: { ownerId: userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Destinasi Saya</h1>
          <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{destinations.length} destinasi terdaftar</p>
        </div>
        <Link href="/owner/destinasi/tambah" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#6D28D9', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem' }}>
          <Plus size={18} /> Tambah Destinasi
        </Link>
      </div>

      {destinations.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '4rem', textAlign: 'center', border: '1px solid #E5E9F0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <p style={{ color: '#8B98A9', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Belum ada destinasi. Mulai tambahkan destinasi Anda!</p>
          <Link href="/owner/destinasi/tambah" style={{ textDecoration: 'none', padding: '10px 24px', background: '#6D28D9', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem' }}>+ Tambah Pertama</Link>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E5E9F0' }}>
                {['Destinasi', 'Kategori', 'Area', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {destinations.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={d.mainImage} alt={d.name} style={{ width: '42px', height: '38px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} onError={() => {}} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{d.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9' }}>{d.reviewCount} ulasan • ⭐ {d.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: d.category.color + '18', color: d.category.color }}>
                      {d.category.icon} {d.category.name}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4A5568' }}>{d.area}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '50px',
                      background: d.status === 'published' ? '#D1FAE5' : d.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                      color: d.status === 'published' ? '#059669' : d.status === 'pending' ? '#D97706' : '#DC2626',
                    }}>
                      {d.status === 'published' ? '✓ Published' : d.status === 'pending' ? '⏳ Menunggu Approval' : '✗ Ditolak'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {d.status === 'published' && (
                        <a href={getDetailHref(d.slug, d.category.slug)} target="_blank" rel="noopener noreferrer" style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', textDecoration: 'none' }}>
                          <Eye size={14} />
                        </a>
                      )}
                      <Link href={`/owner/destinasi/${d.id}`} style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6D28D9' }}>
                        <Edit2 size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`.table-row:hover { background: #F8FAFC; }`}</style>
    </div>
  )
}
