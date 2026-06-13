'use client'

import { useRef, useState } from 'react'
import MapWrapper from './MapWrapper'
import type { MapPin } from './MapDisplay'
import { CATEGORY_STYLES } from './MapDisplay'

interface InteractiveMapClientProps {
  initialPins: MapPin[]
  categories: string[]
}

// Root categories ordered by display priority
const ROOT_CATEGORY_ORDER = [11, 4, 7, 8, 10, 6]

export default function InteractiveMapClient({ initialPins }: InteractiveMapClientProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null) // null = Semua
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isRadiusActive, setIsRadiusActive] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const filterScrollRef = useRef<HTMLDivElement>(null)

  // Build list of root categories that actually have pins
  const availableRootIds = ROOT_CATEGORY_ORDER.filter(id =>
    initialPins.some(p => (p.parentCategoryId ?? p.categoryId) === id)
  )

  // Haversine
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // Filter by root category
  let filteredPins = activeCategoryId === null
    ? initialPins
    : initialPins.filter(p => {
        if (p.type === 'event') return false // Events don't have categoryId
        return (p.parentCategoryId ?? p.categoryId) === activeCategoryId
      })

  // Filter by radius
  if (isRadiusActive && userLocation) {
    filteredPins = filteredPins.filter(p =>
      getDistanceKm(userLocation.lat, userLocation.lng, p.lat, p.lng) <= 2
    )
  }

  const handleLocationFound = (lat: number, lng: number) => setUserLocation({ lat, lng })

  const toggleRadius = () => {
    if (!userLocation && !isRadiusActive) {
      alert("Silakan klik tombol 'Temukan Lokasi Saya' (ikon target) terlebih dahulu.")
      return
    }
    setIsRadiusActive(v => !v)
  }

  // Legend items from available root categories + events
  const legendItems: { color: string; emoji: string; label: string }[] = [
    ...availableRootIds.map(id => ({
      color: CATEGORY_STYLES[id].color,
      emoji: CATEGORY_STYLES[id].emoji,
      label: CATEGORY_STYLES[id].label,
    })),
    { color: '#EF4444', emoji: '🎟️', label: 'Event Live' },
    { color: '#F59E0B', emoji: '🎟️', label: 'Event Mendatang' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* ── Filter Bar ── */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 12px',
      }}>
        {/* Scrollable pill container */}
        <div
          ref={filterScrollRef}
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch', // smooth iOS scroll
            scrollbarWidth: 'none',           // Firefox
            msOverflowStyle: 'none',          // IE/Edge
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            padding: '8px 12px',
            borderRadius: '50px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
            maxWidth: '100%',
            alignItems: 'center',
          }}
          className="filter-scrollbar-hide"
        >
          {/* Radius button */}
          <button
            onClick={toggleRadius}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: '50px',
              border: 'none',
              background: isRadiusActive ? '#FF6B35' : '#F0F4F8',
              color: isRadiusActive ? 'white' : '#374151',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: isRadiusActive ? '0 3px 10px rgba(255,107,53,0.35)' : 'none',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}
          >
            📍 Sekitarku
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '22px', background: '#E5E9F0', flexShrink: 0 }} />

          {/* Semua */}
          <button
            onClick={() => setActiveCategoryId(null)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: '50px',
              border: 'none',
              background: activeCategoryId === null ? '#1A2332' : '#F0F4F8',
              color: activeCategoryId === null ? 'white' : '#374151',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            🗺️ Semua
          </button>

          {/* Root category buttons */}
          {availableRootIds.map(id => {
            const style = CATEGORY_STYLES[id]
            const isActive = activeCategoryId === id
            return (
              <button
                key={id}
                onClick={() => setActiveCategoryId(id)}
                style={{
                  flexShrink: 0,
                  padding: '7px 14px',
                  borderRadius: '50px',
                  border: isActive ? 'none' : `1.5px solid ${style.color}33`,
                  background: isActive ? style.color : style.color + '12',
                  color: isActive ? 'white' : style.color,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '5px',
                  boxShadow: isActive ? `0 3px 12px ${style.color}50` : 'none',
                }}
              >
                <span style={{ fontSize: '13px' }}>{style.emoji}</span>
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '12px',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}>
        <button
          onClick={() => setShowLegend(v => !v)}
          style={{
            background: 'white',
            border: '1px solid #E5E9F0',
            borderRadius: '12px',
            padding: '7px 13px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#1A2332',
          }}
        >
          🎨 {showLegend ? 'Tutup' : 'Legenda'}
        </button>

        {showLegend && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 10px)',
            right: 0,
            background: 'white',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #E5E9F0',
            minWidth: '190px',
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#1A2332', marginBottom: '10px' }}>
              🗺️ Legenda Peta
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {legendItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '22px', height: '22px', flexShrink: 0,
                    background: item.color,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    border: '2px solid white',
                    boxShadow: `0 2px 6px ${item.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ transform: 'rotate(45deg)', fontSize: '9px' }}>{item.emoji}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Map ── */}
      <div style={{ flex: 1, borderRadius: '20px', overflow: 'hidden', zIndex: 1 }}>
        <MapWrapper
          pins={filteredPins}
          height="100%"
          zoom={13}
          onLocationFound={handleLocationFound}
          radiusMode={isRadiusActive && userLocation ? {
            active: true,
            centerLat: userLocation.lat,
            centerLng: userLocation.lng,
            radiusKm: 2
          } : undefined}
        />
      </div>

      <style>{`
        .filter-scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
