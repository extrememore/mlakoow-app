'use client'

import { useState, useEffect } from 'react'
import { Loader, CheckCircle, XCircle, Eye, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { getDetailHref } from '@/lib/categoryRoutes'

interface Destination {
  id: number
  name: string
  slug: string
  description: string
  mainImage: string
  area: string
  ticketPrice: number
  status: string
  createdAt: string
  category: { name: string; icon: string; color: string; slug: string }
  owner: { id: number; name: string; email: string } | null
}

export default function AdminApprovalPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all' | 'rejected'>('pending')
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/destinations/pending')
      .then(r => r.json())
      .then(data => { setDestinations(data); setLoading(false) })
  }, [])

  const filtered = filter === 'all'
    ? destinations
    : destinations.filter(d => d.status === filter)

  async function approve(id: number) {
    setProcessing(id)
    await fetch(`/api/admin/destinations/${id}/approve`, { method: 'PATCH' })
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, status: 'published' } : d))
    setProcessing(null)
  }

  async function reject(id: number) {
    if (!confirm('Tolak destinasi ini?')) return
    setProcessing(id)
    await fetch(`/api/admin/destinations/${id}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d))
    setProcessing(null)
  }

  const pendingCount = destinations.filter(d => d.status === 'pending').length

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>
          Approval Destinasi
          {pendingCount > 0 && (
            <span style={{ marginLeft: '10px', fontSize: '1rem', background: '#FEF3C7', color: '#D97706', padding: '4px 12px', borderRadius: '50px', fontWeight: 700 }}>
              {pendingCount} menunggu
            </span>
          )}
        </h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>Review dan approve destinasi yang diajukan oleh owner</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
        {([
          { key: 'pending', label: '⏳ Menunggu', color: '#D97706' },
          { key: 'all', label: '📋 Semua', color: '#4A5568' },
          { key: 'rejected', label: '✗ Ditolak', color: '#DC2626' },
        ] as const).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '8px 18px', borderRadius: '50px', border: '2px solid',
              borderColor: filter === key ? color : '#E5E9F0',
              background: filter === key ? color + '15' : 'white',
              color: filter === key ? color : '#8B98A9',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            }}
          >
            {label}
            <span style={{ marginLeft: '6px', background: filter === key ? color + '25' : '#F0F4F8', padding: '1px 8px', borderRadius: '50px', fontSize: '0.75rem' }}>
              {key === 'all' ? destinations.length : destinations.filter(d => d.status === key).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#8B98A9' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '4rem', textAlign: 'center', border: '1px solid #E5E9F0', color: '#8B98A9' }}>
          <CheckCircle size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>{filter === 'pending' ? 'Tidak ada destinasi yang menunggu approval 🎉' : 'Tidak ada destinasi ditemukan'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(d => (
            <div key={d.id} style={{ background: 'white', borderRadius: '20px', border: `2px solid ${d.status === 'pending' ? '#FDE68A' : d.status === 'published' ? '#A7F3D0' : '#FECACA'}`, overflow: 'hidden', display: 'flex' }}>
              {/* Image */}
              <img src={d.mainImage} alt={d.name} style={{ width: '200px', height: '160px', objectFit: 'cover', flexShrink: 0 }} onError={e => e.currentTarget.style.display = 'none'} />

              {/* Content */}
              <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1A2332', margin: 0 }}>{d.name}</h3>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: d.category.color + '18', color: d.category.color }}>
                          {d.category.icon} {d.category.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#8B98A9' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{d.area}</span>
                        <span>Rp {d.ticketPrice.toLocaleString('id-ID') || 'Gratis'}</span>
                        <span><Clock size={12} style={{ verticalAlign: 'middle' }} /> {new Date(d.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '5px 12px', borderRadius: '50px',
                      background: d.status === 'published' ? '#D1FAE5' : d.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                      color: d.status === 'published' ? '#059669' : d.status === 'pending' ? '#D97706' : '#DC2626',
                    }}>
                      {d.status === 'published' ? '✓ Published' : d.status === 'pending' ? '⏳ Menunggu' : '✗ Ditolak'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#4A5568', lineHeight: 1.6, margin: '0 0 10px', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box' }}>
                    {d.description}
                  </p>
                  {d.owner && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EDE9FE', padding: '4px 12px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600, color: '#6D28D9' }}>
                      🏪 Owner: {d.owner.name} ({d.owner.email})
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  {d.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approve(d.id)}
                        disabled={processing === d.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '50px', background: '#059669', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                      >
                        {processing === d.id ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
                        Approve
                      </button>
                      <button
                        onClick={() => reject(d.id)}
                        disabled={processing === d.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '50px', background: '#FEE2E2', color: '#DC2626', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                      >
                        <XCircle size={15} /> Tolak
                      </button>
                    </>
                  )}
                  {d.status === 'published' && (
                    <a href={getDetailHref(d.slug, d.category.slug)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '50px', background: '#D1FAE5', color: '#059669', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Eye size={14} /> Lihat di Website
                    </a>
                  )}
                  {d.status === 'rejected' && (
                    <button
                      onClick={() => approve(d.id)}
                      disabled={processing === d.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '50px', background: '#D1FAE5', color: '#059669', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                    >
                      <CheckCircle size={15} /> Approve Sekarang
                    </button>
                  )}
                  <Link href={`/admin/destinasi/${d.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '50px', background: '#E0F2FE', color: '#0A4A5E', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                    Edit Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
