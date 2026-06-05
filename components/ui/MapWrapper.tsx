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

interface MapPin {
  lat: number
  lng: number
  label: string
  order?: number
}

interface MapWrapperProps {
  pins: MapPin[]
  height?: string
  zoom?: number
  showRoute?: boolean
}

export default function MapWrapper(props: MapWrapperProps) {
  return <MapDisplay {...props} />
}
