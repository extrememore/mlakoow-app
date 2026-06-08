'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LocateFixed } from 'lucide-react'

// Fix Leaflet default marker icon issue with webpack
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

export interface MapPin {
  lat: number
  lng: number
  label: string
  id?: string | number
  type?: 'destination' | 'event'
  category?: string
  image?: string
  address?: string
  slug?: string
  order?: number
  isLiveEvent?: boolean
}

interface MapDisplayProps {
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

const customIcon = (pin: MapPin) => {
  let bg = '#0A4A5E' // default destination
  if (pin.type === 'event') {
    bg = pin.isLiveEvent ? '#EF4444' : '#F59E0B' // Live Event = Red, Upcoming = Orange
  }

  return L.divIcon({
    className: pin.isLiveEvent ? 'leaflet-live-marker' : '',
    html: `<div style="
      width: 36px; height: 36px;
      background: ${bg};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: 900;
        font-size: ${pin.order ? '12px' : '16px'};
        font-family: 'Outfit', sans-serif;
        line-height: 1;
        position: relative; top: 2px;
      ">${pin.order ?? (pin.type === 'event' ? '🎟️' : '📍')}</span>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function LocateControl({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) {
  const map = useMap()
  const [locating, setLocating] = useState(false)
  const markerRef = useRef<L.Marker | null>(null)

  const handleLocate = () => {
    setLocating(true)
    map.locate({ setView: false, maxZoom: 15 }).on("locationfound", function (e) {
      setLocating(false)
      map.flyTo(e.latlng, 15, { duration: 1.5 })
      
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng)
      } else {
        markerRef.current = L.marker(e.latlng, {
          icon: L.divIcon({
            className: '',
            html: `<div style="width:20px;height:20px;background:#3B82F6;border:4px solid white;border-radius:50%;box-shadow:0 0 15px rgba(59,130,246,0.6);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map).bindPopup("Lokasi Anda")
      }
      
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng)
      }
    }).on("locationerror", function (e) {
      setLocating(false)
      alert("Gagal mendeteksi lokasi. Pastikan izin GPS aktif di browser Anda.")
    })
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
      <div className="leaflet-control leaflet-bar" style={{ marginTop: '80px', marginRight: '10px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={(e) => { e.preventDefault(); handleLocate(); }} 
          style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
          title="Temukan Lokasi Saya"
        >
          <LocateFixed size={20} color={locating ? "#3B82F6" : "#4A5568"} />
        </button>
      </div>
    </div>
  )
}

export default function MapDisplay({
  pins,
  height = '300px',
  zoom = 13,
  showRoute = false,
  onLocationFound,
  radiusMode,
}: MapDisplayProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  const center: [number, number] = pins.length === 1
    ? [pins[0].lat, pins[0].lng]
    : pins.length > 1
      ? [
          pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          pins.reduce((s, p) => s + p.lng, 0) / pins.length,
        ]
      : [-7.250445, 112.768845] // Surabaya center default

  const routeCoords: [number, number][] = pins.map(p => [p.lat, p.lng])

  return (
    <div style={{ borderRadius: 'inherit', overflow: 'hidden', height, width: '100%', position: 'relative' }}>
      <style>{`
        .leaflet-live-marker { animation: pulseLive 1.5s infinite; }
        @keyframes pulseLive {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .custom-popup .leaflet-popup-content { margin: 0; width: 260px !important; }
        .custom-popup .leaflet-popup-tip-container { display: none; }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <LocateControl onLocationFound={onLocationFound} />

        {/* Radius Circle */}
        {radiusMode?.active && (
          <Circle
            center={[radiusMode.centerLat, radiusMode.centerLng]}
            radius={radiusMode.radiusKm * 1000}
            pathOptions={{ color: '#0A4A5E', fillColor: '#0A4A5E', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }}
          />
        )}

        {/* Route polyline */}
        {showRoute && pins.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#0A4A5E', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
          />
        )}

        {/* Markers */}
        {pins.map((pin) => (
          <Marker
            key={`${pin.type}-${pin.id}`}
            position={[pin.lat, pin.lng]}
            icon={customIcon(pin)}
          >
            <Popup className="custom-popup">
              <div style={{ fontFamily: 'Outfit, sans-serif' }}>
                {pin.image && (
                  <img src={pin.image} alt={pin.label} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ background: pin.type === 'event' ? '#FEF3C7' : '#E0F2FE', color: pin.type === 'event' ? '#B45309' : '#0A4A5E', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                      {pin.category}
                    </span>
                    {pin.isLiveEvent && (
                      <span style={{ background: '#FEE2E2', color: '#EF4444', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                        Sedang Berlangsung
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 900, color: '#1A2332', fontSize: '1.1rem', marginBottom: '6px', lineHeight: 1.2 }}>{pin.label}</h3>
                  {pin.address && <p style={{ color: '#8B98A9', fontSize: '0.8rem', marginBottom: '16px', lineHeight: 1.4 }}>{pin.address}</p>}
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {pin.slug && <a href={`/${pin.type === 'event' ? 'extras/kalender-event' : 'destinasi'}/${pin.slug}`} style={{ flex: 1, textAlign: 'center', background: '#0A4A5E', color: 'white', textDecoration: 'none', padding: '8px 0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>Detail</a>}
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: 'center', background: '#F0F4F8', color: '#0A4A5E', textDecoration: 'none', padding: '8px 0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>Rute GMaps</a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
