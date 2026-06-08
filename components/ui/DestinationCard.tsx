'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MapPin, Star, Clock, Wallet } from 'lucide-react'

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

  useEffect(() => {
    // If distance wasn't provided by SSR/parent, but we have lat/lng, try to get it
    if (initialDistance === undefined && lat !== undefined && lng !== undefined && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat - pos.coords.latitude) * Math.PI / 180;
        const dLon = (lng - pos.coords.longitude) * Math.PI / 180; 
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(pos.coords.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        setDistance(R * c)
      }, () => {})
    }
  }, [initialDistance, lat, lng])

  let href = `/wisata/${slug}`
  if (category.slug === 'kuliner') href = `/kuliner/${slug}`
  if (category.slug === 'cafe') href = `/cafe/${slug}`

  const isCafe = category.slug === 'cafe'
  const isKulinerOrCafe = isKuliner || isCafe || category.slug === 'kuliner'

  let priceDisplay = 'Gratis'
  if (ticketPrice > 0) {
    if (isKulinerOrCafe) {
      if (ticketPrice < 30000) priceDisplay = '$ (Murah)'
      else if (ticketPrice < 60000) priceDisplay = '$$ (Sedang)'
      else if (ticketPrice < 100000) priceDisplay = '$$$ (Mahal)'
      else priceDisplay = '$$$$ (Premium)'
    } else if (category.slug === 'hiburan' || category.slug === 'spot-foto') {
      const upper = Math.round((ticketPrice * 1.5) / 5000) * 5000;
      const fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
      priceDisplay = `Rp ${fmt.format(ticketPrice)} - Rp ${fmt.format(upper)}`;
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
          overflow: 'hidden',
          border: '1px solid #E5E9F0',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '58%', overflow: 'hidden' }}>
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
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; e.currentTarget.onerror = null; }}
          />
          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {featured && (
              <span
                className="badge"
                style={{ background: '#FF6B35', color: 'white' }}
              >
                ⭐ Populer
              </span>
            )}
            {hiddenGem && (
              <span
                className="badge"
                style={{ background: '#7C3AED', color: 'white' }}
              >
                💎 Hidden Gem
              </span>
            )}
          </div>
          {/* Category */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <span
              className="badge"
              style={{ background: category.color + '22', color: category.color, border: `1px solid ${category.color}44` }}
            >
              {category.icon} {category.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1A2332',
                lineHeight: 1.3,
                flex: 1,
              }}
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
              {isKulinerOrCafe ? (
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

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
              <Wallet size={13} color={ticketPrice === 0 ? '#10B981' : '#0A4A5E'} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: (ticketPrice === 0 && !isKulinerOrCafe) ? '#10B981' : '#0A4A5E',
                }}
              >
                {priceDisplay}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
