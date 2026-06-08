'use client'

import { useState } from 'react'
import MapWrapper from './MapWrapper'
import type { MapPin } from './MapDisplay'

interface InteractiveMapClientProps {
  initialPins: MapPin[]
  categories: string[]
}

export default function InteractiveMapClient({ initialPins, categories }: InteractiveMapClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua')
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isRadiusActive, setIsRadiusActive] = useState(false)

  // Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  }

  let filteredPins = activeCategory === 'Semua' 
    ? initialPins 
    : initialPins.filter(pin => pin.category === activeCategory)

  if (isRadiusActive && userLocation) {
    filteredPins = filteredPins.filter(pin => {
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, pin.lat, pin.lng)
      return dist <= 5 // 5KM radius
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      
      {/* Floating Category Filters */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 1000, 
        background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(10px)',
        padding: '8px', 
        borderRadius: '50px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex', 
        gap: '8px',
        overflowX: 'auto',
        maxWidth: '90%',
        pointerEvents: 'auto'
      }}>
        {/* Radius Button */}
        <button
          onClick={toggleRadius}
          style={{
            padding: '6px 16px',
            borderRadius: '50px',
            border: isRadiusActive ? 'none' : '1px solid #E5E9F0',
            background: isRadiusActive ? '#FF6B35' : 'white',
            color: isRadiusActive ? 'white' : '#4A5568',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: isRadiusActive ? '0 4px 12px rgba(255,107,53,0.3)' : 'none'
          }}
        >
          📍 Di Sekitarku (5KM)
        </button>
        
        <div style={{ width: '1px', background: '#E5E9F0', margin: '0 4px' }} />

        {['Semua', ...categories].map(cat => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '50px',
                border: 'none',
                background: isActive ? '#0A4A5E' : 'transparent',
                color: isActive ? 'white' : '#4A5568',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          )
        })}
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
            radiusKm: 5
          } : undefined}
        />
      </div>
    </div>
  )
}
