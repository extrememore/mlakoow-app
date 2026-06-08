'use client'

import { useState, useEffect, useCallback } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DestinationCard from '@/components/ui/DestinationCard'
import { Search, X, MapPin, ChevronDown, UtensilsCrossed } from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
  color: string
}

interface Destination {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  reviewCount: number
  ticketPrice: number
  featured: boolean
  hiddenGem: boolean
  estimatedDuration: number
  description: string
  category: Category
}

const AREAS = ['Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan', 'Surabaya Timur', 'Surabaya Barat']

// Kuliner sub-tags untuk filtering extra
const KULINER_TAGS = [
  { label: 'Semua', value: '' },
  { label: '⭐ Populer', value: 'featured' },
  { label: '💎 Hidden Gem', value: 'hidden' },
]

export default function KulinerPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [activeTag, setActiveTag] = useState('')

  const fetchKuliner = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('category', 'kuliner')
    params.set('limit', '24')
    if (search) params.set('search', search)
    if (selectedArea) params.set('area', selectedArea)
    if (activeTag === 'featured') params.set('featured', 'true')
    if (activeTag === 'hidden') params.set('hiddenGem', 'true')

    const res = await fetch(`/api/destinations?${params}`)
    const data = await res.json()
    setDestinations(data.destinations || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, selectedArea, activeTag])

  useEffect(() => {
    fetchKuliner()
  }, [fetchKuliner])

  const hasFilters = search || selectedArea || activeTag

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7B1A00 0%, #C0392B 50%, #E67E22 100%)',
          padding: '3rem 1.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '10%',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UtensilsCrossed size={20} color="white" />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              KULINER & OLEH-OLEH SURABAYA
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Wisata Kuliner Surabaya 🍜
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', maxWidth: '580px', lineHeight: 1.7 }}>
            Temukan {total > 0 ? `${total}` : ''} destinasi kuliner legendaris Surabaya — dari Rawon, Rujak Cingur, Pecel Semanggi, hingga pusat oleh-oleh terbaik kota ini.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            {[
              { emoji: '🍛', label: 'Kuliner Khas' },
              { emoji: '🛍️', label: 'Oleh-oleh' },
              { emoji: '📍', label: 'Tersebar di Surabaya' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '50px', padding: '6px 14px' }}>
                <span style={{ fontSize: '1rem' }}>{s.emoji}</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #E5E9F0',
          padding: '1.25rem 1.5rem',
          position: 'sticky',
          top: '68px',
          zIndex: 40,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search
              size={18}
              color="#8B98A9"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kuliner atau tempat makan..."
              className="input-field"
              style={{ paddingLeft: '2.75rem', paddingTop: '0.65rem', paddingBottom: '0.65rem' }}
            />
          </div>

          {/* Area filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="input-field"
              style={{
                paddingTop: '0.65rem',
                paddingBottom: '0.65rem',
                paddingRight: '2.5rem',
                appearance: 'none',
                cursor: 'pointer',
                minWidth: '180px',
              }}
            >
              <option value="">Semua Area</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <ChevronDown
              size={16}
              color="#8B98A9"
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
          </div>

          {/* Tag pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {KULINER_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setActiveTag(tag.value)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '50px',
                  border: activeTag === tag.value ? '2px solid #C0392B' : '2px solid #E5E9F0',
                  background: activeTag === tag.value ? '#C0392B' : 'white',
                  color: activeTag === tag.value ? 'white' : '#4A5568',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setSelectedArea(''); setActiveTag('') }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FEE2E2',
                border: 'none',
                borderRadius: '12px',
                padding: '0.65rem 1rem',
                color: '#B91C1C',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontFamily: 'Outfit, sans-serif',
                flexShrink: 0,
              }}
            >
              <X size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', flex: 1 }}>
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', background: 'white' }}>
                <div className="skeleton" style={{ paddingTop: '58%', width: '100%' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              color: '#8B98A9',
            }}
          >
            <UtensilsCrossed size={56} style={{ opacity: 0.25, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4A5568', marginBottom: '0.5rem' }}>
              Kuliner tidak ditemukan
            </h3>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem', color: '#4A5568', fontSize: '0.9rem' }}>
              Menampilkan <strong style={{ color: '#C0392B' }}>{destinations.length}</strong> dari <strong>{total}</strong> kuliner & oleh-oleh
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {destinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  id={dest.id}
                  name={dest.name}
                  slug={dest.slug}
                  area={dest.area}
                  mainImage={dest.mainImage}
                  rating={dest.rating}
                  reviewCount={dest.reviewCount}
                  ticketPrice={dest.ticketPrice}
                  featured={dest.featured}
                  hiddenGem={dest.hiddenGem}
                  estimatedDuration={dest.estimatedDuration}
                  category={dest.category}
                  description={dest.description}
                />
              ))}
            </div>

            {/* Oleh-oleh tips banner */}
            <div
              style={{
                marginTop: '3rem',
                background: 'linear-gradient(135deg, #FFF5F0 0%, #FFF1E6 100%)',
                border: '1px solid #FDDCBE',
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛍️</div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#7B1A00', marginBottom: '0.5rem' }}>
                  Tips Belanja Oleh-oleh Khas Surabaya
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {[
                    '🦈 Kerupuk Sirip Hiu',
                    '🤎 Petis Udang Asli',
                    '🍬 Carang Mas',
                    '🍪 Kue Sagon',
                    '🫙 Sambal Cumi',
                    '🍞 Roti Pao Ampel',
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        background: 'rgba(192,57,43,0.08)',
                        border: '1px solid rgba(192,57,43,0.2)',
                        color: '#7B1A00',
                        padding: '5px 12px',
                        borderRadius: '50px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
