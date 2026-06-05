'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon issue with webpack
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface MapPin {
  lat: number
  lng: number
  label: string
  order?: number
}

interface MapDisplayProps {
  pins: MapPin[]
  height?: string
  zoom?: number
  showRoute?: boolean
}

const customIcon = (order?: number) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: 32px; height: 32px;
      background: #FF6B35;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: 900;
        font-size: ${order ? '11px' : '14px'};
        font-family: 'Outfit', sans-serif;
        line-height: 1;
        position: relative; top: 2px;
      ">${order ?? '📍'}</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })

export default function MapDisplay({
  pins,
  height = '300px',
  zoom = 13,
  showRoute = false,
}: MapDisplayProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  if (pins.length === 0) return null

  const center: [number, number] = pins.length === 1
    ? [pins[0].lat, pins[0].lng]
    : [
        pins.reduce((s, p) => s + p.lat, 0) / pins.length,
        pins.reduce((s, p) => s + p.lng, 0) / pins.length,
      ]

  const routeCoords: [number, number][] = pins.map(p => [p.lat, p.lng])

  return (
    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #E5E9F0', height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route polyline */}
        {showRoute && pins.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#FF6B35', weight: 3, opacity: 0.7, dashArray: '8, 6' }}
          />
        )}

        {/* Markers */}
        {pins.map((pin, i) => (
          <Marker
            key={i}
            position={[pin.lat, pin.lng]}
            icon={customIcon(pin.order)}
          >
            <Popup>
              <div style={{ fontFamily: 'Outfit, sans-serif', minWidth: '120px' }}>
                {pin.order && <div style={{ fontWeight: 800, color: '#FF6B35', fontSize: '0.75rem', marginBottom: '2px' }}>Destinasi #{pin.order}</div>}
                <div style={{ fontWeight: 700, color: '#1A2332', fontSize: '0.9rem' }}>{pin.label}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
