'use client'

import { useState } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import DestinationCard from './DestinationCard'

interface Destination {
  id: number
  name: string
  slug: string
  area: string
  mainImage: string
  rating: number
  reviewCount: number
  ticketPrice: number
  featured: boolean
  hiddenGem: boolean
  estimatedDuration: number
  description: string
  lat: number
  lng: number
  category: {
    name: string
    icon: string
    color: string
  }
}

interface NearbyRecommendationsProps {
  destinations: Destination[]
}

// Haversine formula to calculate distance in km
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function NearbyRecommendations({ destinations }: NearbyRecommendationsProps) {
  const [nearbyList, setNearbyList] = useState<(Destination & { distance: number })[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setErrorMessage('Geolokasi tidak didukung oleh browser Anda.')
      return
    }

    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        const withDistance = destinations.map((dest) => ({
          ...dest,
          distance: getDistanceInKm(latitude, longitude, dest.lat, dest.lng)
        }))

        // Sort by closest, take top 4
        const sorted = withDistance.sort((a, b) => a.distance - b.distance).slice(0, 4)
        
        setNearbyList(sorted)
        setStatus('success')
      },
      (error) => {
        setStatus('error')
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Izin akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.')
        } else {
          setErrorMessage('Gagal mendeteksi lokasi.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // If not success and not idle (e.g., error), we show the error state but user can retry
  if (status === 'success' && nearbyList.length > 0) {
    return (
      <section style={{ padding: '5rem 0', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#DCFCE7', color: '#15803D',
                padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700,
                marginBottom: '0.75rem', letterSpacing: '0.5px'
              }}
            >
              <Navigation size={14} /> DISEKITAR ANDA
            </span>
            <h2 className="section-title">Wisata Terdekat</h2>
            <p style={{ color: '#4A5568', marginTop: '0.5rem', fontSize: '0.95rem' }}>
              Destinasi terbaik yang paling dekat dengan lokasi Anda saat ini
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {nearbyList.map((dest) => (
              <div key={dest.id} style={{ position: 'relative' }}>
                <DestinationCard
                  id={dest.id}
                  name={dest.name}
                  slug={dest.slug}
                  area={dest.area}
                  mainImage={dest.mainImage}
                  rating={dest.rating}
                  reviewCount={dest.reviewCount}
                  ticketPrice={dest.ticketPrice}
                  featured={dest.featured}
                  hiddenGem={dest.hiddenGem}
                  estimatedDuration={dest.estimatedDuration}
                  category={dest.category}
                  description={dest.description}
                />
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px',
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)',
                  padding: '4px 10px', borderRadius: '50px',
                  fontSize: '0.75rem', fontWeight: 800, color: '#0A4A5E',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <MapPin size={12} color="#FF6B35" />
                  {dest.distance < 1 ? `${Math.round(dest.distance * 1000)} m` : `${dest.distance.toFixed(1)} km`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Initial prompt or error state
  return (
    <section style={{ padding: '3rem 0', background: 'linear-gradient(to bottom, var(--bg), white)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
          borderRadius: '20px', padding: '2rem', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.5rem', boxShadow: '0 10px 30px rgba(10,74,94,0.15)'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={22} color="#FF6B35" /> Temukan Wisata Terdekat
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
              Izinkan MLAKOOW mendeteksi lokasi Anda untuk menampilkan rekomendasi destinasi wisata yang ada di sekitar Anda.
            </p>
            {status === 'error' && (
              <p style={{ color: '#FCA5A5', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 600 }}>
                ⚠️ {errorMessage}
              </p>
            )}
          </div>
          <button
            onClick={detectLocation}
            disabled={status === 'loading'}
            style={{
              background: 'white', color: '#0A4A5E', border: 'none',
              padding: '12px 24px', borderRadius: '50px',
              fontWeight: 800, fontSize: '0.95rem', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
              fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s',
              opacity: status === 'loading' ? 0.8 : 1
            }}
            onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { if (status !== 'loading') e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {status === 'loading' ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Mendeteksi...</>
            ) : (
              <><MapPin size={18} /> Deteksi Lokasi Saya</>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}
