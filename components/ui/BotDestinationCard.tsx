'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Destination } from '@/components/shared/DestinationExplorer'

export default function BotDestinationCard({ id }: { id: number }) {
  const [dest, setDest] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/destinations/by-id/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setDest(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '110px',
          borderRadius: '14px',
          background: '#F0F2F5',
          margin: '8px 0',
          display: 'flex',
          overflow: 'hidden',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <div style={{ width: '110px', background: '#E0E3E8', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ height: '12px', background: '#E0E3E8', borderRadius: '6px', width: '60%' }} />
          <div style={{ height: '14px', background: '#E0E3E8', borderRadius: '6px', width: '85%' }} />
          <div style={{ height: '12px', background: '#E0E3E8', borderRadius: '6px', width: '50%' }} />
        </div>
      </div>
    )
  }

  if (!dest) return null

  const isFree = dest.ticketPrice === 0
  const categoryColor = dest.category?.color || '#0A4A5E'
  const categoryName = dest.category?.name || 'Destinasi'
  const categoryIcon = dest.category?.icon || '📍'
  // Truncate long category names
  const displayCategory = categoryName.length > 14 ? categoryName.slice(0, 13) + '…' : categoryName

  return (
    <div
      style={{
        width: '100%',
        borderRadius: '14px',
        background: '#ffffff',
        border: '1.5px solid #E8ECF0',
        boxShadow: '0 3px 12px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        display: 'flex',
        margin: '8px 0',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div
        style={{
          width: '110px',
          minHeight: '110px',
          backgroundImage: `url(${dest.mainImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Category badge overlaid on image bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            maxWidth: '95px',
          }}
        >
          <span style={{ fontSize: '9px' }}>{categoryIcon}</span>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayCategory.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
          gap: '6px',
        }}
      >
        {/* Name */}
        <h4
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: '14px',
            color: '#1A2332',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {dest.name}
        </h4>

        {/* Area + Rating — on same row, won't wrap */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'nowrap',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '12px',
              color: '#6B7A90',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '60%',
            }}
          >
            <MapPin size={11} color="#6B7A90" />
            {dest.area}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '12px',
              color: '#6B7A90',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Star size={11} color="#F59E0B" fill="#F59E0B" />
            {dest.rating}
          </span>
        </div>

        {/* Price + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isFree ? '#10B981' : '#FF6B35',
            }}
          >
            {isFree ? '🎟 Gratis' : `Rp${dest.ticketPrice.toLocaleString('id-ID')}`}
          </span>
          <Link
            href={`/detail/${dest.slug}`}
            target="_blank"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0A4A5E, #0d5a72)',
              color: '#fff',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(10,74,94,0.25)',
              transition: 'opacity 0.2s',
            }}
          >
            Lihat →
          </Link>
        </div>
      </div>
    </div>
  )
}
