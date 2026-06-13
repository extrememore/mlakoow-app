'use client'

import { useState } from 'react'
import MapWrapper from './MapWrapper'
import type { MapPin } from './MapDisplay'
import { CATEGORY_NAME_STYLES } from './MapDisplay'

interface InteractiveMapClientProps {
  initialPins: MapPin[]
  categories: string[]
}

export default function InteractiveMapClient({ initialPins, categories }: InteractiveMapClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isRadiusActive, setIsRadiusActive] = useState(false)
  const [showLegend, setShowLegend] = useState(false)

  // Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  let filteredPins = activeCategory === 'Semua'
    ? initialPins
    : initialPins.filter(pin => pin.category === activeCategory)

  if (isRadiusActive && userLocation) {
    filteredPins = filteredPins.filter(pin => {
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, pin.lat, pin.lng)
      return dist <= 2
    })
  }

  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation({ lat, lng })
  }

  const toggleRadius = () => {
    if (!userLocation && !isRadiusActive) {
      alert("Silakan klik tombol 'Temukan Lokasi Saya' (ikon target di kanan atas peta) terlebih dahulu sebelum menggunakan fitur ini.")
      return
    }
    setIsRadiusActive(!isRadiusActive)
  }

  // Build legend items from unique categories that actually appear in pins
  const legendItems = categories
    .map(cat => ({ cat, style: CATEGORY_NAME_STYLES[cat] }))
    .filter(item => item.style) // only categories with a defined style
    // deduplicate by color (group sub-categories under same color)
    .reduce<{ color: string; emoji: string; label: string }[]>((acc, item) => {
      if (!acc.find(l => l.color === item.style.color)) {
        acc.push({ color: item.style.color, emoji: item.style.emoji, label: item.cat })
      }
      return acc
    }, [])
  // Always add event types
  legendItems.push({ color: '#EF4444', emoji: '🎟️', label: 'Event Live' })
  legendItems.push({ color: '#F59E0B', emoji: '🎟️', label: 'Event Mendatang' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

      {/* Floating Category Filters */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '8px',
        borderRadius: '50px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        maxWidth: '90%',
        pointerEvents: 'auto'
      }} className="hide-scrollbar">

        {/* Radius Button */}
        <button
          onClick={toggleRadius}
          style={{
            padding: '6px 14px',
            borderRadius: '50px',
            border: isRadiusActive ? 'none' : '1px solid #E5E9F0',
            background: isRadiusActive ? '#FF6B35' : 'white',
            color: isRadiusActive ? 'white' : '#4A5568',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: isRadiusActive ? '0 4px 12px rgba(255,107,53,0.3)' : 'none',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}
        >
          📍 Di Sekitarku (2KM)
        </button>

        <div style={{ width: '1px', background: '#E5E9F0', margin: '0 2px', flexShrink: 0 }} />

        {/* "Semua" button */}
        <button
          onClick={() => setActiveCategory('Semua')}
          style={{
            padding: '6px 14px',
            borderRadius: '50px',
            border: 'none',
            background: activeCategory === 'Semua' ? '#1A2332' : 'transparent',
            color: activeCategory === 'Semua' ? 'white' : '#4A5568',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
          }}
        >
          🗺️ Semua
        </button>

        {categories.map(cat => {
          const isActive = activeCategory === cat
          const catStyle = CATEGORY_NAME_STYLES[cat]
          const dotColor = catStyle?.color ?? '#64748B'
          const emoji = catStyle?.emoji ?? '📍'
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '50px',
                border: isActive ? 'none' : '1px solid ' + dotColor + '33',
                background: isActive ? dotColor : dotColor + '10',
                color: isActive ? 'white' : dotColor,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '5px',
                boxShadow: isActive ? `0 4px 12px ${dotColor}44` : 'none'
              }}
            >
              <span style={{ fontSize: '12px' }}>{emoji}</span>
              {cat}
            </button>
          )
        })}
      </div>

      {/* Legend toggle button */}
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
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#1A2332'
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
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '1px solid #E5E9F0',
            minWidth: '200px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1A2332', marginBottom: '12px' }}>
              🗺️ Legenda Peta
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {legendItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Mini pin shape */}
                  <div style={{
                    width: '22px', height: '22px', flexShrink: 0,
                    background: item.color,
                    borderRadius: '50% 50% 50% 0',
                    transform: 'rotate(-45deg)',
                    border: '2px solid white',
                    boxShadow: `0 2px 6px ${item.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ transform: 'rotate(45deg)', fontSize: '9px' }}>{item.emoji}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
    </div>
  )
}
