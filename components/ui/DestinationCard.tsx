'use client'

import Link from 'next/link'
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
}: DestinationCardProps) {
  const href = category.slug === 'kuliner' ? `/kuliner/${slug}` : `/destinasi/${slug}`
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8B98A9', fontSize: '0.82rem' }}>
            <MapPin size={12} />
            <span>{area}</span>
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

              {/* Duration */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8B98A9', fontSize: '0.82rem' }}>
                <Clock size={12} />
                <span>{estimatedDuration} mnt</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem' }}>
              <Wallet size={13} color={ticketPrice === 0 ? '#10B981' : '#0A4A5E'} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: ticketPrice === 0 ? '#10B981' : '#0A4A5E',
                }}
              >
                {ticketPrice === 0 ? 'Gratis' : `Rp ${ticketPrice.toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
