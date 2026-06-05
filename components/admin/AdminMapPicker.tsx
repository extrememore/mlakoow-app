'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet's default marker icons
const fixLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }
}

interface LocationMarkerProps {
  position: [number, number] | null
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ position, onChange }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return position ? <Marker position={position}></Marker> : null
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

interface AdminMapPickerProps {
  lat: string
  lng: string
  onChange: (lat: string, lng: string) => void
}

const DEFAULT_CENTER: [number, number] = [-7.2575, 112.7521] // Surabaya

export default function AdminMapPicker({ lat, lng, onChange }: AdminMapPickerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    fixLeafletIcon()
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div style={{ height: '300px', background: '#F0F4F8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B98A9' }}>
      Memuat peta...
    </div>
  )

  const numLat = parseFloat(lat)
  const numLng = parseFloat(lng)
  const isValidCenter = !isNaN(numLat) && !isNaN(numLng) && lat !== '' && lng !== ''

  const currentCenter = isValidCenter ? [numLat, numLng] : DEFAULT_CENTER
  const position = isValidCenter ? currentCenter : null

  return (
    <div style={{ height: '300px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E5E9F0' }}>
      <MapContainer
        center={currentCenter as [number, number]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true} // Admin might need to scroll zoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isValidCenter && <MapUpdater center={currentCenter as [number, number]} />}
        <LocationMarker 
          position={position as [number, number] | null} 
          onChange={(newLat, newLng) => {
            // Keep 6 decimal precision
            onChange(newLat.toFixed(6), newLng.toFixed(6))
          }} 
        />
      </MapContainer>
    </div>
  )
}
