'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ItineraryPickerModal from '@/components/ui/ItineraryPickerModal'
import {
  Heart, Share2, Copy, Check, Trash2, MapPin, Star, Wallet,
  Loader, ExternalLink, Lock, Globe, CalendarPlus, Search,
} from 'lucide-react'

interface WishlistDestination {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  reviewCount: number
  ticketPrice: number
  description: string
  estimatedDuration: number
  category: { name: string; icon: string; color: string; slug: string }
}

interface WishlistItem {
  id: number
  destinationId: number
  createdAt: string
  destination: WishlistDestination
}

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [copied, setCopied] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [generatingToken, setGeneratingToken] = useState(false)

  useEffect(() => {
    fetch('/api/wishlist')
      .then((r) => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then((data) => {
        if (data) {
          setItems(data.items || [])
          setShareToken(data.shareToken)
          setIsPublic(data.isPublic ?? true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function removeItem(destinationId: number) {
    setRemovingId(destinationId)
    await fetch(`/api/wishlist?destinationId=${destinationId}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((i) => i.destinationId !== destinationId))
    setRemovingId(null)
  }

  async function generateShareLink() {
    setGeneratingToken(true)
    const res = await fetch('/api/wishlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_token' }),
    })
    const data = await res.json()
    setShareToken(data.token)
    setGeneratingToken(false)
  }

  async function togglePublic() {
    const res = await fetch('/api/wishlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_public' }),
    })
    const data = await res.json()
    setIsPublic(data.isPublic)
    setShareToken(data.token)
  }

  function copyShareLink() {
    if (!shareToken) return
    const url = `${window.location.origin}/wishlist/shared/${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getHref(item: WishlistDestination) {
    const slug = item.slug
    const cat = item.category.slug
    if (cat === 'kuliner') return `/kuliner/${slug}`
    if (cat === 'cafe') return `/cafe/${slug}`
    if (cat === 'oleh-oleh') return `/oleh-oleh/${slug}`
    if (cat === 'hiburan' || cat === 'spot-foto') return `/hiburan/${slug}`
    return `/wisata/${slug}`
  }

  const categories = [...new Set(items.map((i) => i.destination.category.name))]
  const filtered = items.filter((i) => {
    const matchSearch = !searchQuery || i.destination.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.destination.area.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !filterCategory || i.destination.category.name === filterCategory
    return matchSearch && matchCat
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A855F7 100%)', padding: '3rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={24} fill="white" color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>KOLEKSI SAYA</div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, margin: 0 }}>Wishlist Saya</h1>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
            {items.length > 0
              ? `${items.length} destinasi tersimpan — siap jadi petualangan berikutmu!`
              : 'Belum ada destinasi yang disimpan'}
          </p>

          {/* Share Panel */}
          {items.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', maxWidth: '560px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>
                  <Share2 size={16} /> Bagikan Wishlist
                </div>
                {shareToken && (
                  <button
                    onClick={togglePublic}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                  >
                    {isPublic ? <><Globe size={12} /> Publik</> : <><Lock size={12} /> Privat</>}
                  </button>
                )}
              </div>

              {!shareToken ? (
                <button
                  onClick={generateShareLink}
                  disabled={generatingToken}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', background: 'white', borderRadius: '10px', border: 'none', color: '#7C3AED', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}
                >
                  {generatingToken ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Share2 size={16} />}
                  {generatingToken ? 'Membuat link...' : 'Buat Link Berbagi'}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/wishlist/shared/${shareToken}`}
                  </div>
                  <button
                    onClick={copyShareLink}
                    style={{ padding: '0.6rem 1rem', background: 'white', borderRadius: '10px', border: 'none', color: copied ? '#10B981' : '#7C3AED', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, fontFamily: 'Outfit, sans-serif' }}
                  >
                    {copied ? <><Check size={14} /> Disalin!</> : <><Copy size={14} /> Salin</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#8B98A9' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Memuat koleksi...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', border: '1px solid #E5E9F0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🤍</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1A2332', marginBottom: '0.75rem' }}>Wishlist Masih Kosong</h2>
            <p style={{ color: '#8B98A9', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
              Temukan destinasi seru di Surabaya dan simpan di sini untuk dikunjungi nanti!
            </p>
            <Link href="/wisata" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              🗺️ Jelajahi Destinasi
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} color="#8B98A9" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari di wishlist..."
                  style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '38px', paddingRight: '1rem', paddingTop: '0.65rem', paddingBottom: '0.65rem', borderRadius: '12px', border: '1.5px solid #E5E9F0', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ padding: '0.65rem 1rem', borderRadius: '12px', border: '1.5px solid #E5E9F0', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none', cursor: 'pointer', minWidth: '160px' }}
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ color: '#8B98A9', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {filtered.length} dari {items.length} destinasi
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filtered.map((item) => {
                const d = item.destination
                const href = getHref(d)
                const isRemoving = removingId === d.id

                return (
                  <div
                    key={item.id}
                    style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E9F0', overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isRemoving ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', paddingTop: '55%', overflow: 'hidden' }}>
                      <img
                        src={d.mainImage}
                        alt={d.name}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = '/placeholder.png' }}
                      />
                      {/* Category badge */}
                      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                        <span className="badge" style={{ background: d.category.color + '22', color: d.category.color, border: `1px solid ${d.category.color}44` }}>
                          {d.category.icon} {d.category.name}
                        </span>
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(d.id)}
                        disabled={isRemoving}
                        style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        title="Hapus dari wishlist"
                      >
                        {isRemoving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} color="#EF4444" />}
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1A2332', marginBottom: '2px' }}>{d.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#8B98A9', marginBottom: '0.5rem' }}>
                        <MapPin size={13} color="#C0392B" /> {d.area}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#4A5568', lineHeight: 1.5, flex: 1 }} className="line-clamp-2">
                        {d.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #F0F4F8', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={13} fill="#F59E0B" color="#F59E0B" />
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{d.rating > 0 ? d.rating.toFixed(1) : 'Baru'}</span>
                          {d.reviewCount > 0 && <span style={{ fontSize: '0.75rem', color: '#8B98A9' }}>({d.reviewCount})</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Wallet size={12} color="#0A4A5E" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A4A5E' }}>
                            {d.ticketPrice === 0 ? 'Gratis' : `Rp ${d.ticketPrice.toLocaleString('id-ID')}`}
                          </span>
                        </div>
                      </div>

                      {/* CTAs */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                        <Link
                          href={href}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.65rem', borderRadius: '10px', background: '#F0F7FA', color: '#0A4A5E', textDecoration: 'none', fontWeight: 600, fontSize: '0.8rem', border: '1.5px solid #BAE6FD' }}
                        >
                          <ExternalLink size={13} /> Lihat Detail
                        </Link>
                        <ItineraryPickerModal
                          destinationId={d.id}
                          destinationName={d.name}
                          destinationSlug={d.slug}
                          trigger={
                            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '0.65rem', borderRadius: '10px', background: '#EFF6FF', color: '#1E40AF', fontWeight: 600, fontSize: '0.8rem', border: '1.5px solid #BFDBFE', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                              <CalendarPlus size={13} /> Itinerary
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && searchQuery && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8B98A9' }}>
                <p>Tidak ada hasil untuk "<strong>{searchQuery}</strong>"</p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
