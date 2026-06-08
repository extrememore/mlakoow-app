'use client'

import dynamic from 'next/dynamic'

const MapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false,
  loading: () => (
    <div style={{
      borderRadius: '16px',
      background: '#F0F4F8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8B98A9',
      fontSize: '0.85rem',
    }}>
      🗺️ Memuat peta...
    </div>
  ),
})

import type { MapPin } from './MapDisplay'

interface MapWrapperProps {
  pins: MapPin[]
  height?: string
  zoom?: number
  showRoute?: boolean
  onLocationFound?: (lat: number, lng: number) => void
  radiusMode?: {
    active: boolean
    centerLat: number
    centerLng: number
    radiusKm: number
  }
}

export default function MapWrapper(props: MapWrapperProps) {
  return <MapDisplay {...props} />
}
