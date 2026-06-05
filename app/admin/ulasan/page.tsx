'use client'

import { useState, useEffect } from 'react'
import { Trash2, Star, Loader, Filter } from 'lucide-react'

interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  user: { name: string; email: string }
  destination: { name: string; slug: string }
}

export default function AdminUlasanPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/reviews')
      .then(r => r.json())
      .then(data => { setReviews(data); setLoading(false) })
  }, [])

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.rating === filter)

  async function handleDelete(id: number) {
    if (!confirm('Hapus ulasan ini?')) return
    setDeleting(id)
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    setReviews(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0'

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Moderasi Ulasan</h1>
        <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{reviews.length} ulasan • Rata-rata ⭐ {avgRating}</p>
      </div>

      {/* Filter by rating */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 5, 4, 3, 2, 1].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            style={{
              padding: '6px 16px', borderRadius: '50px', border: '2px solid',
              borderColor: filter === f ? '#0A4A5E' : '#E5E9F0',
              background: filter === f ? '#0A4A5E' : 'white',
              color: filter === f ? 'white' : '#4A5568',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
            }}
          >
            {f === 'all' ? 'Semua' : `${'★'.repeat(f as number)} (${reviews.filter(r => r.rating === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>
          <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #E5E9F0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>{r.user.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8B98A9' }}>{r.user.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '1px', color: '#F59E0B', fontSize: '1rem' }}>
                  {'★'.repeat(r.rating)}
                  <span style={{ color: '#E5E9F0' }}>{'★'.repeat(5 - r.rating)}</span>
                </div>
              </div>

              {/* Destination */}
              <div style={{ fontSize: '0.8rem', color: '#0A4A5E', fontWeight: 600, background: '#E0F2FE', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', alignSelf: 'flex-start' }}>
                📍 {r.destination.name}
              </div>

              {/* Comment */}
              <p style={{ fontSize: '0.875rem', color: '#4A5568', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #F0F4F8' }}>
                <span style={{ fontSize: '0.75rem', color: '#8B98A9' }}>
                  {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', fontFamily: 'Outfit, sans-serif' }}
                >
                  {deleting === r.id ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>
              Tidak ada ulasan ditemukan
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
