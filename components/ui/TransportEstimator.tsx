'use client'

import { useState, useEffect } from 'react'

interface TransportEstimatorProps {
  destinationLat: number
  destinationLng: number
}

// Haversine formula
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180; 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

export default function TransportEstimator({ destinationLat, destinationLng }: TransportEstimatorProps) {
  const [distance, setDistance] = useState<number | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setIsLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const dist = getDistanceFromLatLonInKm(
            position.coords.latitude,
            position.coords.longitude,
            destinationLat,
            destinationLng
          )
          setDistance(dist)
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setErrorMsg("Izin lokasi ditolak atau gagal dilacak.")
          setIsLocating(false)
        }
      )
    } else {
      setErrorMsg("Browser tidak mendukung lokasi.")
      setIsLocating(false)
    }
  }, [destinationLat, destinationLng])

  // Calculation formulas
  // Motor: Base 5k + 2.5k/km
  const motorPrice = distance !== null ? Math.round((5000 + (distance * 2500)) / 1000) * 1000 : null
  // Mobil: Base 10k + 5k/km
  const mobilPrice = distance !== null ? Math.round((10000 + (distance * 5000)) / 1000) * 1000 : null
  // Taksi: Base 8k + 6k/km
  const taksiPrice = distance !== null ? Math.round((8000 + (distance * 6000)) / 1000) * 1000 : null

  const transportOptions = [
    {
      icon: '🛵',
      mode: 'Ojek Online (Motor)',
      duration: distance !== null ? `${Math.ceil(distance * 3)} - ${Math.ceil(distance * 4)} menit` : '10-30 menit',
      cost: motorPrice !== null ? `Rp ${motorPrice.toLocaleString('id-ID')}` : 'Mencari lokasi...',
      note: 'Cepat menembus kemacetan, untuk 1 orang',
      recommended: distance !== null && distance < 15,
    },
    {
      icon: '🚗',
      mode: 'Ojek Online (Mobil)',
      duration: distance !== null ? `${Math.ceil(distance * 4)} - ${Math.ceil(distance * 6)} menit` : '15-40 menit',
      cost: mobilPrice !== null ? `Rp ${mobilPrice.toLocaleString('id-ID')}` : 'Mencari lokasi...',
      note: 'Nyaman ber-AC, maksimal 4 orang',
      recommended: distance !== null && distance >= 15,
    },
    {
      icon: '🚖',
      mode: 'Taksi Argometer',
      duration: distance !== null ? `${Math.ceil(distance * 4)} - ${Math.ceil(distance * 6)} menit` : '15-40 menit',
      cost: taksiPrice !== null ? `~Rp ${taksiPrice.toLocaleString('id-ID')}` : 'Mencari lokasi...',
      note: 'Tersedia di banyak titik strategis',
      recommended: false,
    },
    {
      icon: '🚌',
      mode: 'Bus Suroboyo',
      duration: 'Tergantung rute',
      cost: 'Rp 5.000 (Flat)',
      note: 'Murah tapi harus menunggu di halte',
      recommended: false,
    },
    {
      icon: '🚐',
      mode: 'Rental Mobil',
      duration: 'Harian',
      cost: 'Rp 300.000 - 500.000 / hari',
      note: 'Cocok untuk keliling kota seharian',
      recommended: false,
    },
  ]

  return (
    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #E5E9F0' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1A2332', marginBottom: '0.5rem' }}>
        🚌 Rekomendasi Transportasi
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <p style={{ color: '#4A5568', fontSize: '0.85rem' }}>
          Estimasi harga berdasarkan lokasi Anda ke destinasi.
        </p>
        {distance !== null ? (
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#C0392B', background: '#FEF2F2', padding: '4px 10px', borderRadius: '50px' }}>
            Jarak: {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
          </span>
        ) : isLocating ? (
          <span style={{ fontSize: '0.8rem', color: '#F59E0B' }}>Melacak lokasi...</span>
        ) : errorMsg ? (
          <span style={{ fontSize: '0.8rem', color: '#EF4444' }}>{errorMsg}</span>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {transportOptions.map((t) => (
          <div
            key={t.mode}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              padding: '1.25rem',
              background: t.recommended ? '#FFF5F0' : '#F8F6F2',
              borderRadius: '14px',
              border: t.recommended ? '2px solid #FDDCBE' : '1px solid #E5E9F0',
            }}
          >
            <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#1A2332' }}>{t.mode}</strong>
                {t.recommended && (
                  <span className="badge" style={{ background: '#C0392B', color: 'white', fontSize: '0.7rem' }}>
                    Direkomendasikan
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4A5568', marginBottom: '4px' }}>{t.note}</div>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: '#8B98A9' }}>⏱ {t.duration}</span>
                <span style={{ color: '#10B981', fontWeight: 600 }}>💰 {t.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
