'use client'

import { useState, useEffect } from 'react'

interface DistanceBadgeProps {
  lat: number
  lng: number
  color?: string
}

export default function DistanceBadge({ lat, lng, color = 'rgba(255,255,255,0.7)' }: DistanceBadgeProps) {
  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat - pos.coords.latitude) * Math.PI / 180;
        const dLon = (lng - pos.coords.longitude) * Math.PI / 180; 
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(pos.coords.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        setDistance(R * c)
      }, () => {})
    }
  }, [lat, lng])

  if (distance === null) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color }}>
      <span>•</span>
      <span style={{ fontWeight: 600 }}>
        {distance < 1 ? `${Math.round(distance * 1000)}m dari Anda` : `${distance.toFixed(1)}km dari Anda`}
      </span>
    </div>
  )
}
