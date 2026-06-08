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

  const filteredPins = activeCategory === 'Semua' 
    ? initialPins 
    : initialPins.filter(pin => pin.category === activeCategory)

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
        <MapWrapper pins={filteredPins} height="100%" zoom={13} />
      </div>
    </div>
  )
}
