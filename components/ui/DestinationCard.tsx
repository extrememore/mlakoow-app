'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Star, Clock, Wallet, MoreHorizontal, Heart, CalendarPlus, Ticket, X } from 'lucide-react'
import ItineraryPickerModal from '@/components/ui/ItineraryPickerModal'

interface DestinationCardProps {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  reviewCount: number
  ticketPrice: number
  featured?: boolean
  hiddenGem?: boolean
  estimatedDuration: number
  category: {
    name: string
    icon: string
    color: string
    slug: string
  }
  description?: string
  isKuliner?: boolean
  facilities?: string
  distance?: number
  lat?: number
  lng?: number
}

export default function DestinationCard({
  id,
  name,
  slug,
  area,
  mainImage,
  rating,
  reviewCount,
  ticketPrice,
  featured,
  hiddenGem,
  estimatedDuration,
  category,
  description,
  isKuliner,
  facilities,
  distance: initialDistance,
  lat,
  lng,
}: DestinationCardProps) {
  const [distance, setDistance] = useState<number | undefined>(initialDistance)
  const [menuOpen, setMenuOpen] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (initialDistance === undefined && lat !== undefined && lng !== undefined && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const R = 6371
        const dLat = (lat - pos.coords.latitude) * Math.PI / 180
        const dLon = (lng - pos.coords.longitude) * Math.PI / 180
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(pos.coords.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        setDistance(R * c)
      }, () => {})
    }
  }, [initialDistance, lat, lng])

  // Check wishlist status when menu opens
  useEffect(() => {
    if (!menuOpen) return
    fetch(`/api/wishlist?check=${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setInWishlist(data.inWishlist) })
      .catch(() => {})
  }, [menuOpen, id])

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setWishlistLoading(true)
    if (inWishlist) {
      const res = await fetch(`/api/wishlist?destinationId=${id}`, { method: 'DELETE' })
      if (res.status === 401) { router.push('/login'); return }
      if (res.ok) setInWishlist(false)
    } else {
      const res = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ destinationId: id }) })
      if (res.status === 401) { router.push('/login'); return }
      if (res.ok) setInWishlist(true)
    }
    setWishlistLoading(false)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])


  // Complete subcategory → parent route mapping (covers all 30 subcategories in DB)
  const KULINER_SLUGS = new Set(['kuliner','makanan-tradisional','street-food','seafood','restoran','warung-lokal','jajanan-snack'])
  const CAFE_SLUGS    = new Set(['cafe','cafe-umum','coffee-shop','creative-space','kedai'])
  const OLEHOLEH_SLUGS= new Set(['oleh-oleh','batik-fashion','kerajinan-tangan','kue-roti','makanan-khas','minuman-bumbu','souvenir-aksesoris'])
  const HIBURAN_SLUGS = new Set(['hiburan','bioskop-hiburan','olahraga-petualangan','permainan-arcade','spot-foto','spot-foto-indoor','spot-foto-outdoor','studio-foto'])

  const catSlug = category.slug
  let href = `/wisata/${slug}`
  if (KULINER_SLUGS.has(catSlug))  href = `/kuliner/${slug}`
  else if (CAFE_SLUGS.has(catSlug))    href = `/cafe/${slug}`
  else if (OLEHOLEH_SLUGS.has(catSlug)) href = `/oleh-oleh/${slug}`
  else if (HIBURAN_SLUGS.has(catSlug))  href = `/hiburan/${slug}`

  const isCafe = CAFE_SLUGS.has(catSlug)
  const isKulinerOrCafeOrOleh = isKuliner || KULINER_SLUGS.has(catSlug) || CAFE_SLUGS.has(catSlug) || OLEHOLEH_SLUGS.has(catSlug)

  // Determine if this is a bookable wisata (non-free, non-food category)
  const isBookableWisata = !isKulinerOrCafeOrOleh
    && !HIBURAN_SLUGS.has(catSlug)
    && ticketPrice > 0


  let priceDisplay = 'Gratis'
  if (ticketPrice > 0) {
    if (isKulinerOrCafeOrOleh) {
      if (ticketPrice < 30000) priceDisplay = '$ (Murah)'
      else if (ticketPrice < 60000) priceDisplay = '$$ (Sedang)'
      else if (ticketPrice < 100000) priceDisplay = '$$$ (Mahal)'
      else priceDisplay = '$$$$ (Premium)'
    } else if (category.slug === 'hiburan' || category.slug === 'spot-foto') {
      const upper = Math.round((ticketPrice * 1.5) / 5000) * 5000
      const fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })
      priceDisplay = `Rp ${fmt.format(ticketPrice)} - Rp ${fmt.format(upper)}`
    } else {
      priceDisplay = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ticketPrice)
    }
  }

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="card-hover"
        style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'visible',
          border: '1px solid #E5E9F0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '58%', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          <img
            src={mainImage}
            alt={name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null }}
          />
          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {featured && (
              <span className="badge" style={{ background: '#FF6B35', color: 'white' }}>⭐ Populer</span>
            )}
            {hiddenGem && (
              <span className="badge" style={{ background: '#7C3AED', color: 'white' }}>💎 Hidden Gem</span>
            )}
          </div>
          {/* Category */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', maxWidth: '60%' }}>
            <span
              className="badge"
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(4px)',
                color: category.color, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                fontWeight: 700
              }}
            >
              <span style={{ flexShrink: 0 }}>{category.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.name}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '0 0 20px 20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3
              style={{ fontWeight: 700, fontSize: '1rem', color: '#1A2332', lineHeight: 1.3, flex: 1 }}
              className="line-clamp-2"
            >
              {name}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#8B98A9', marginBottom: '0.75rem' }}>
            <MapPin size={14} color="#C0392B" /> {area}
            {distance !== undefined && (
              <>
                <span>•</span>
                <span style={{ color: '#C0392B', fontWeight: 600 }}>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
              </>
            )}
          </div>

          {description && (
            <p style={{ fontSize: '0.83rem', color: '#4A5568', lineHeight: 1.5 }} className="line-clamp-2">
              {description}
            </p>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #F0F4F8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332' }}>
                  {rating > 0 ? rating.toFixed(1) : 'Baru'}
                </span>
                {reviewCount > 0 && (
                  <span style={{ fontSize: '0.78rem', color: '#8B98A9' }}>({reviewCount})</span>
                )}
              </div>

              {/* Duration or Badges */}
              {isKulinerOrCafeOrOleh ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                  {isCafe && facilities?.includes('WiFi') && <span title="WFC Friendly" style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>💻 WFC</span>}
                  {isCafe && facilities?.includes('Live Music') && <span title="Ada Live Music" style={{ background: '#FCE7F3', color: '#BE185D', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🎶 Live Music</span>}
                  {!isCafe && facilities?.includes('Legendaris') && <span title="Legendaris" style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🏆 Legendaris</span>}
                  {!isCafe && facilities?.includes('Halal') && <span title="100% Halal" style={{ background: '#D1FAE5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🟢 Halal</span>}
                  {!isCafe && facilities?.includes('Pedes') && <span title="Pedes Nampol" style={{ background: '#FEE2E2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🔥 Pedes</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8B98A9', fontSize: '0.82rem' }}>
                  <Clock size={12} />
                  <span>{estimatedDuration} mnt</span>
                </div>
              )}
            </div>

            {/* Price row + 3-dot menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wallet size={13} color={ticketPrice === 0 ? '#10B981' : '#0A4A5E'} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: (ticketPrice === 0 && !isKulinerOrCafeOrOleh) ? '#10B981' : '#0A4A5E',
                  }}
                >
                  {priceDisplay}
                </span>
              </div>

              {/* 3-dot quick action button */}
              <div
                ref={menuRef}
                style={{ position: 'relative' }}
                onClick={(e) => e.preventDefault()}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMenuOpen(prev => !prev)
                  }}
                  title="Aksi cepat"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1px solid #E5E9F0',
                    background: menuOpen ? '#F0F4F8' : 'white',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <MoreHorizontal size={16} color="#8B98A9" />
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      right: 0,
                      background: 'white',
                      borderRadius: '14px',
                      border: '1px solid #E5E9F0',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                      padding: '6px',
                      zIndex: 9999,
                      minWidth: '190px',
                      animation: 'fadeInUp 0.15s ease',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Wishlist */}
                    <button
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '10px', width: '100%',
                        background: inWishlist ? '#FEF2F2' : 'transparent',
                        border: 'none', color: inWishlist ? '#DC2626' : '#1A2332',
                        fontSize: '0.875rem', fontWeight: 600,
                        transition: 'background 0.15s', cursor: 'pointer',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                      onMouseEnter={(e) => { if (!inWishlist) e.currentTarget.style.background = '#FFF5F0' }}
                      onMouseLeave={(e) => { if (!inWishlist) e.currentTarget.style.background = 'transparent' }}
                    >
                      <Heart size={16} color={inWishlist ? '#DC2626' : '#EF4444'} fill={inWishlist ? '#DC2626' : '#EF4444'} />
                      {wishlistLoading ? '...' : inWishlist ? '✓ Di Wishlist' : 'Tambah ke Wishlist'}
                    </button>

                    {/* Itinerary */}
                    <ItineraryPickerModal
                      destinationId={id}
                      destinationName={name}
                      destinationSlug={slug}
                      trigger={
                        <button
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: '10px', width: '100%',
                            background: 'transparent', border: 'none',
                            color: '#1A2332', fontSize: '0.875rem', fontWeight: 600,
                            transition: 'background 0.15s', cursor: 'pointer',
                            fontFamily: 'Outfit, sans-serif',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#F0F7FF')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <CalendarPlus size={16} color="#0A4A5E" />
                          Tambah ke Itinerary
                        </button>
                      }
                    />

                    {/* Booking — wisata non-gratis only */}
                    {isBookableWisata && (
                      <>
                        <div style={{ height: '1px', background: '#F0F4F8', margin: '4px 6px' }} />
                        <a
                          href={`/booking?destinationId=${id}&name=${encodeURIComponent(name)}&price=${ticketPrice}`}
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            color: '#0A4A5E',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF8FF')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <Ticket size={16} color="#0A4A5E" />
                          Pesan Tiket
                        </a>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Link>
  )
}
