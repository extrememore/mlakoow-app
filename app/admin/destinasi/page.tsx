'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Edit2, Trash2, Star, MapPin, ToggleLeft, ToggleRight, Loader, Eye, Filter, X } from 'lucide-react'
import { getDetailHref } from '@/lib/categoryRoutes'

interface Category {
  id: number
  name: string
  icon: string
  color: string
  slug: string
}

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
  menus?: string | null
  category: Category
}

export default function AdminDestinasiPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviewCount' | 'ticketPrice'>('name')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterNoMenu, setFilterNoMenu] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkActioning, setBulkActioning] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations?limit=200').then(r => r.json()),
      fetch('/api/destinations/categories').then(r => r.json()),
    ]).then(([destData, cats]) => {
      setDestinations(destData.destinations || destData)
      // Only parent categories for filter
      setCategories(cats.filter((c: Category) => !c.slug?.includes('-')).slice(0, 20))
      setLoading(false)
    })
  }, [])

  const filtered = destinations
    .filter(d => {
      const matchSearch = !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.area.toLowerCase().includes(search.toLowerCase())
      const matchCategory = !categoryFilter || d.category.slug === categoryFilter || d.category.name === categoryFilter
      const matchNoMenu = !filterNoMenu || !d.menus || d.menus === '[]'
      return matchSearch && matchCategory && matchNoMenu
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'reviewCount') return b.reviewCount - a.reviewCount
      if (sortBy === 'ticketPrice') return a.ticketPrice - b.ticketPrice
      return a.name.localeCompare(b.name)
    })

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

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(d => d.id))
    }
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleBulkAction(action: 'delete' | 'toggleFeatured') {
    if (action === 'delete' && !confirm(`Hapus ${selectedIds.length} destinasi terpilih? Data terkait akan ikut terhapus permanen.`)) return
    
    setBulkActioning(true)
    const res = await fetch('/api/admin/destinations/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: selectedIds }),
    })
    
    if (res.ok) {
      if (action === 'delete') {
        setDestinations(prev => prev.filter(d => !selectedIds.includes(d.id)))
        setSelectedIds([])
      } else if (action === 'toggleFeatured') {
        setDestinations(prev => prev.map(d => selectedIds.includes(d.id) ? { ...d, featured: !d.featured } : d))
        setSelectedIds([])
      }
    } else {
      alert('Gagal melakukan aksi massal.')
    }
    setBulkActioning(false)
  }

  const inputStyle = { padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #E5E9F0', fontSize: '0.82rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white', cursor: 'pointer' } as const

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1A2332', marginBottom: '4px' }}>Manajemen Destinasi</h1>
          <p style={{ color: '#8B98A9', fontSize: '0.9rem' }}>
            {filtered.length} dari {destinations.length} destinasi
            {categoryFilter && ` • Filter: ${categoryFilter}`}
          </p>
        </div>
        <Link href="/admin/destinasi/tambah" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#0A4A5E', color: 'white', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem' }}>
          <Plus size={18} /> Tambah Destinasi
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '340px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8B98A9' }} />
          <input
            type="text"
            placeholder="Cari nama atau area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '12px', border: '1.5px solid #E5E9F0', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif', outline: 'none', background: 'white', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: '160px' }}
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => (
            <option key={c.id} value={c.slug}>{c.icon} {c.name}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          style={{ ...inputStyle, minWidth: '140px' }}
        >
          <option value="name">Urut: Nama</option>
          <option value="rating">Urut: Rating ↓</option>
          <option value="reviewCount">Urut: Ulasan ↓</option>
          <option value="ticketPrice">Urut: Harga ↑</option>
        </select>

        {/* Clear filter */}
        {(search || categoryFilter || filterNoMenu) && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter(''); setFilterNoMenu(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif' }}
          >
            <X size={13} /> Reset
          </button>
        )}

        {/* Filter Tanpa Menu */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#4A5568', background: filterNoMenu ? '#F0FDF4' : 'white', padding: '8px 12px', borderRadius: '10px', border: `1.5px solid ${filterNoMenu ? '#86EFAC' : '#E5E9F0'}` }}>
          <input type="checkbox" checked={filterNoMenu} onChange={e => setFilterNoMenu(e.target.checked)} style={{ accentColor: '#059669' }} />
          Tanpa Menu
        </label>
      </div>

      {/* Category Quick-filter chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCategoryFilter('')}
          style={{ padding: '5px 14px', borderRadius: '50px', border: '1.5px solid', borderColor: !categoryFilter ? '#0A4A5E' : '#E5E9F0', background: !categoryFilter ? '#0A4A5E' : 'white', color: !categoryFilter ? 'white' : '#4A5568', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
        >
          Semua
        </button>
        {['wisata', 'kuliner', 'cafe', 'hiburan', 'oleh-oleh'].map(slug => {
          const cat = categories.find(c => c.slug === slug)
          if (!cat) return null
          return (
            <button
              key={slug}
              onClick={() => setCategoryFilter(slug)}
              style={{ padding: '5px 14px', borderRadius: '50px', border: '1.5px solid', borderColor: categoryFilter === slug ? cat.color : '#E5E9F0', background: categoryFilter === slug ? cat.color + '18' : 'white', color: categoryFilter === slug ? cat.color : '#4A5568', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
            >
              {cat.icon} {cat.name}
            </button>
          )
        })}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#1A2332', color: 'white', padding: '12px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', zIndex: 100 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedIds.length} Terpilih</div>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }}></div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleBulkAction('toggleFeatured')} disabled={bulkActioning} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Toggle Featured</button>
            <button onClick={() => handleBulkAction('delete')} disabled={bulkActioning} style={{ background: '#DC2626', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
          </div>
        </div>
      )}

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
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} style={{ accentColor: '#0A4A5E' }} />
                </th>
                {['Destinasi', 'Kategori', 'Area', 'Harga', 'Rating', '⭐ Featured', '💎 Gem', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.73rem', fontWeight: 700, color: '#8B98A9', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid #F0F4F8', background: selectedIds.includes(d.id) ? '#F0F9FF' : 'transparent' }} className="table-row">
                  <td style={{ padding: '10px 16px' }}>
                    <input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => toggleSelect(d.id)} style={{ accentColor: '#0A4A5E' }} />
                  </td>
                  {/* Destinasi */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={d.mainImage} alt={d.name} style={{ width: '40px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} onError={e => (e.currentTarget.style.display = 'none')} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9' }}>{d.reviewCount} ulasan</div>
                      </div>
                    </div>
                  </td>
                  {/* Kategori */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '8px', background: (d.category.color || '#0A4A5E') + '18', color: d.category.color || '#0A4A5E', whiteSpace: 'nowrap' }}>
                      {d.category.icon} {d.category.name}
                    </span>
                  </td>
                  {/* Area */}
                  <td style={{ padding: '10px 16px', fontSize: '0.82rem', color: '#4A5568', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} color="#8B98A9" />{d.area.replace('Surabaya ', '')}</span>
                  </td>
                  {/* Harga */}
                  <td style={{ padding: '10px 16px', fontSize: '0.85rem', fontWeight: 600, color: d.ticketPrice === 0 ? '#10B981' : '#1A2332', whiteSpace: 'nowrap' }}>
                    {d.ticketPrice === 0 ? 'Gratis' : `Rp ${d.ticketPrice.toLocaleString('id-ID')}`}
                  </td>
                  {/* Rating */}
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#F59E0B', fontWeight: 700 }}>
                      <Star size={13} fill="#F59E0B" />{d.rating.toFixed(1)}
                    </span>
                  </td>
                  {/* Featured toggle */}
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleFeatured(d.id, d.featured)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.featured ? '#FF6B35' : '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                      {d.featured ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>
                  {/* HiddenGem toggle */}
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => toggleHiddenGem(d.id, d.hiddenGem)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.hiddenGem ? '#7C3AED' : '#CBD5E1', display: 'flex', alignItems: 'center' }}>
                      {d.hiddenGem ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </td>
                  {/* Aksi */}
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Preview di website */}
                      <a
                        href={getDetailHref(d.slug, d.category.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Lihat di website"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', textDecoration: 'none' }}
                      >
                        <Eye size={14} />
                      </a>
                      {/* Edit */}
                      <Link href={`/admin/destinasi/${d.id}`} title="Edit" style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A4A5E' }}>
                        <Edit2 size={14} />
                      </Link>
                      {/* Hapus */}
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        title="Hapus"
                        style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', border: 'none', cursor: 'pointer' }}
                      >
                        {deleting === d.id ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8B98A9' }}>
            Tidak ada destinasi ditemukan
            {(search || categoryFilter) && (
              <button onClick={() => { setSearch(''); setCategoryFilter('') }} style={{ display: 'block', margin: '0.75rem auto 0', padding: '7px 18px', borderRadius: '50px', border: 'none', background: '#0A4A5E', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .table-row:hover { background: #F8FAFC; }
      `}</style>
    </div>
  )
}
