'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// We need to fix the default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom DivIcon for numbered markers
const createNumberedIcon = (number: number, color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px;">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

// Predefined vibrant colors for days
const DAY_COLORS = [
  '#0ea5e9', // Day 1: Light Blue
  '#f43f5e', // Day 2: Rose
  '#10b981', // Day 3: Emerald
  '#8b5cf6', // Day 4: Violet
  '#f59e0b', // Day 5: Amber
  '#ec4899', // Day 6: Pink
  '#06b6d4', // Day 7: Cyan
]

interface ItineraryMapProps {
  items: any[]
  hoveredItemId?: number | null // To pan to a specific item
}

// Component to handle auto-panning
function MapFlyTo({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 })
  }, [center, zoom, map])
  return null
}

export default function ItineraryMap({ items, hoveredItemId }: ItineraryMapProps) {
  // State for storing the fetched polylines from OSRM
  const [dayRoutes, setDayRoutes] = useState<Record<number, [number, number][]>>({})

  // Group items by day
  const byDay = useMemo(() => {
    const groups: Record<number, any[]> = {}
    items.forEach((item) => {
      if (!groups[item.day]) groups[item.day] = []
      groups[item.day].push(item)
    })
    return groups
  }, [items])

  // Center of the map: if hovered, center on hovered, else center on first item, else Surabaya
  const center: [number, number] = useMemo(() => {
    if (hoveredItemId) {
      const target = items.find((i) => i.destination.id === hoveredItemId)
      if (target?.destination.lat) return [target.destination.lat, target.destination.lng]
    }
    if (items.length > 0 && items[0].destination.lat) {
      return [items[0].destination.lat, items[0].destination.lng]
    }
    return [-7.250445, 112.768845] // Default Surabaya
  }, [items, hoveredItemId])

  // Fetch routes from OSRM when items change
  useEffect(() => {
    const fetchRoutes = async () => {
      const newRoutes: Record<number, [number, number][]> = {}
      
      for (const dayStr of Object.keys(byDay)) {
        const day = Number(dayStr)
        const dayItems = byDay[day]
        
        // Need at least 2 points to draw a route
        if (dayItems.length < 2) continue

        // Prepare coordinates string for OSRM: lon,lat;lon,lat
        const coordsStr = dayItems
          .map((i) => `${i.destination.lng},${i.destination.lat}`)
          .join(';')

        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`)
          const data = await res.json()
          
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // OSRM returns coordinates as [lon, lat], Leaflet needs [lat, lon]
            const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
            newRoutes[day] = coords
          }
        } catch (error) {
          console.error(`Failed to fetch route for Day ${day}`, error)
        }
      }
      
      setDayRoutes(newRoutes)
    }

    // Debounce slightly to avoid spamming OSRM while dragging and dropping
    const timer = setTimeout(fetchRoutes, 500)
    return () => clearTimeout(timer)
  }, [byDay])

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapFlyTo center={center} zoom={hoveredItemId ? 15 : 12} />
        
        {/* We use a sleek CartoDB basemap for better aesthetic */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Render Routes */}
        {Object.entries(dayRoutes).map(([dayStr, coords]) => {
          const day = Number(dayStr)
          const color = DAY_COLORS[(day - 1) % DAY_COLORS.length]
          return (
            <Polyline
              key={`route-day-${day}`}
              positions={coords as any}
              color={color}
              weight={5}
              opacity={0.8}
              lineCap="round"
              lineJoin="round"
              dashArray={hoveredItemId ? '5, 10' : undefined} // subtle dash if focused mode
            />
          )
        })}

        {/* Render Markers */}
        {items.map((item) => {
          const color = DAY_COLORS[(item.day - 1) % DAY_COLORS.length]
          const isHovered = hoveredItemId === item.destination.id
          
          // Make hovered marker larger and pulse
          const icon = createNumberedIcon(item.order, color)

          return (
            <Marker
              key={`${item.day}-${item.destination.id}`}
              position={[item.destination.lat, item.destination.lng]}
              icon={icon}
              zIndexOffset={isHovered ? 1000 : 0}
            >
              <Popup>
                <div style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: color, marginBottom: '2px', textTransform: 'uppercase' }}>
                    Hari Ke-{item.day} • Urutan {item.order}
                  </div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#1A2332', marginBottom: '4px' }}>
                    {item.destination.name}
                  </strong>
                  <div style={{ fontSize: '0.85rem', color: '#4A5568' }}>
                    ⏰ {item.startTime} • {item.estimatedVisitTime} mnt
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
