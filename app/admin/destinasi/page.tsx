'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit2, Trash2, Star, MapPin, ToggleLeft, ToggleRight, Loader } from 'lucide-react'

interface Destination {
  id: number
  name: string
  slug: string
  area: string
  ticketPrice: number
  rating: number
  reviewCount: number
  featured: boolean
  hiddenGem: boolean
  mainImage: string
  category: { name: string; icon: string; color: string }
}

export default function AdminDestinasiPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/destinations?limit=100')
      .then(r => r.json())
      .then(data => { setDestinations(data.destinations || data); setLoading(false) })
  }, [])

  const filtered = destinations.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.area.toLowerCase().includes(search.toLowerCase())
  )

  async function toggleFeatured(id: number, current: boolean) {
    await fetch(`/api/admin/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !current }),
    })
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, featured: !current } : d))
  }

  async function toggleHiddenGem(id: number, current: boolean) {
    await fetch(`/api/admin/destinations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hiddenGem: !current }),
    })
    setDestinations(prev => prev.map(d => d.id === id ? { ...d, hiddenGem: !current } : d))
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus destinasi ini? Data terkait (review, itinerary) juga akan ikut terhapus.')) return
    setDeleting(id)
    await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' })
    setDestinations(prev => prev.filter(d => d.id !== id))
    setDeleting(null)
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Manajemen Destinasi</h1>
          <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>{destinations.length} destinasi terdaftar</p>
        </div>
        <Link href="/admin/destinasi/tambah" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#0A4A5E', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem' }}>
          <Plus size={18} /> Tambah Destinasi
        </Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
        <input
          type="text"
          placeholder="Cari nama atau area..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '12px', border: '1px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white' }}
        />
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
                {['Destinasi', 'Kategori', 'Area', 'Tiket', 'Rating', 'Featured', 'Hidden Gem', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid #F0F4F8' }} className="table-row">
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={d.mainImage} alt={d.name} style={{ width: '40px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: d.category.color + '22', color: d.category.color }}>
                      {d.category.icon} {d.category.name}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#4A5568' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="#8B98A9" />{d.area.replace('Surabaya ', '')}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: d.ticketPrice === 0 ? '#10B981' : '#1A2332' }}>
                    {d.ticketPrice === 0 ? 'Gratis' : `Rp ${d.ticketPrice.toLocaleString('id-ID')}`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#F59E0B', fontWeight: 600 }}>
                      <Star size={13} fill="#F59E0B" />{d.rating.toFixed(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleFeatured(d.id, d.featured)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.featured ? '#FF6B35' : '#CBD5E1' }}>
                      {d.featured ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => toggleHiddenGem(d.id, d.hiddenGem)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.hiddenGem ? '#7C3AED' : '#CBD5E1' }}>
                      {d.hiddenGem ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/admin/destinasi/${d.id}`} title="Edit" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A4A5E' }}>
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        title="Hapus"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', border: 'none', cursor: 'pointer' }}
                      >
                        {deleting === d.id ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>Tidak ada destinasi ditemukan</div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .table-row:hover { background: #F8FAFC; }
      `}</style>
    </div>
  )
}
