'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Polyline, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
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
  let bg = '#0A4A5E'
  if (pin.type === 'event') {
    bg = pin.isLiveEvent ? '#EF4444' : '#F59E0B'
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

const buildPopupHtml = (pin: MapPin) => {
  const catBg = pin.type === 'event' ? '#FEF3C7' : '#E0F2FE'
  const catColor = pin.type === 'event' ? '#B45309' : '#0A4A5E'
  const liveTag = pin.isLiveEvent
    ? `<span style="background:#FEE2E2;color:#EF4444;padding:4px 10px;border-radius:50px;font-size:0.7rem;font-weight:800;">Sedang Berlangsung</span>`
    : ''
  const imgTag = pin.image
    ? `<img src="${pin.image}" alt="${pin.label}" style="width:100%;height:140px;object-fit:cover;" loading="lazy" />`
    : ''
  const detailType = pin.type === 'event' ? 'extras/kalender-event' : 'wisata'
  const detailLink = pin.slug
    ? `<a href="/${detailType}/${pin.slug}" style="flex:1;text-align:center;background:#0A4A5E;color:white;text-decoration:none;padding:8px 0;border-radius:8px;font-size:0.85rem;font-weight:700;">Detail</a>`
    : ''

  return `
    <div style="font-family: Outfit, sans-serif; min-width: 240px; max-width: 260px;">
      ${imgTag}
      <div style="padding:16px;">
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
          <span style="background:${catBg};color:${catColor};padding:4px 10px;border-radius:50px;font-size:0.7rem;font-weight:800;">${pin.category ?? ''}</span>
          ${liveTag}
        </div>
        <h3 style="font-weight:900;color:#1A2332;font-size:1rem;margin:0 0 6px;line-height:1.2;">${pin.label}</h3>
        ${pin.address ? `<p style="color:#8B98A9;font-size:0.8rem;margin:0 0 14px;line-height:1.4;">${pin.address}</p>` : ''}
        <div style="display:flex;gap:8px;">
          ${detailLink}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${pin.lat},${pin.lng}" target="_blank" rel="noopener noreferrer"
            style="flex:1;text-align:center;background:#F0F4F8;color:#0A4A5E;text-decoration:none;padding:8px 0;border-radius:8px;font-size:0.85rem;font-weight:700;">
            Rute GMaps
          </a>
        </div>
      </div>
    </div>`
}

/* ── Marker Cluster Layer — uses Leaflet API directly for v5 compatibility ── */
function MarkerClusterLayer({ pins, showRoute }: { pins: MapPin[]; showRoute?: boolean }) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)

  useEffect(() => {
    // Remove previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current)
    }

    const group = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      animate: true,
      chunkedLoading: true,        // add markers in async chunks → no jank
      chunkInterval: 200,
      chunkDelay: 50,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount()
        const size = count > 50 ? 52 : count > 20 ? 44 : 36
        const bg = count > 50
          ? 'linear-gradient(135deg,#EF4444,#B91C1C)'
          : count > 20
          ? 'linear-gradient(135deg,#F59E0B,#D97706)'
          : 'linear-gradient(135deg,#0A4A5E,#0D6E84)'

        return L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            background:${bg};
            border:3px solid white;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(0,0,0,0.3);
            font-family:Outfit,sans-serif;
            font-weight:900;font-size:${size > 44 ? '15' : '13'}px;color:white;
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
      }
    }) as L.MarkerClusterGroup

    // Only cluster on interactive map (showRoute = itinerary detail, no cluster needed there)
    if (showRoute) {
      // On itinerary view, don't cluster — render individual markers
      pins.forEach(pin => {
        L.marker([pin.lat, pin.lng], { icon: customIcon(pin) })
          .bindPopup(buildPopupHtml(pin), { className: 'custom-popup', maxWidth: 280 })
          .addTo(map)
      })
    } else {
      pins.forEach(pin => {
        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon(pin) })
        marker.bindPopup(buildPopupHtml(pin), { className: 'custom-popup', maxWidth: 280 })
        group.addLayer(marker)
      })
      map.addLayer(group)
    }

    clusterGroupRef.current = group

    return () => {
      if (group) map.removeLayer(group)
      // remove individual markers if showRoute
      if (showRoute) map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l) })
    }
  }, [pins, map, showRoute])

  return null
}

/* ── Locate Me Button ── */
function LocateControl({ onLocationFound }: { onLocationFound?: (lat: number, lng: number) => void }) {
  const map = useMap()
  const [locating, setLocating] = useState(false)
  const markerRef = useRef<L.Marker | null>(null)

  const handleLocate = () => {
    setLocating(true)
    map.locate({ setView: false, maxZoom: 15 })
      .on('locationfound', (e) => {
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
          }).addTo(map).bindPopup('Lokasi Anda')
        }
        onLocationFound?.(e.latlng.lat, e.latlng.lng)
      })
      .on('locationerror', () => {
        setLocating(false)
        alert('Gagal mendeteksi lokasi. Pastikan izin GPS aktif di browser Anda.')
      })
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
      <div className="leaflet-control leaflet-bar" style={{ marginTop: '80px', marginRight: '10px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <button
          onClick={(e) => { e.preventDefault(); handleLocate() }}
          style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Temukan Lokasi Saya"
        >
          <LocateFixed size={20} color={locating ? '#3B82F6' : '#4A5568'} />
        </button>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function MapDisplay({
  pins,
  height = '300px',
  zoom = 13,
  showRoute = false,
  onLocationFound,
  radiusMode,
}: MapDisplayProps) {
  useEffect(() => { fixLeafletIcon() }, [])

  const center: [number, number] = pins.length === 1
    ? [pins[0].lat, pins[0].lng]
    : pins.length > 1
      ? [
          pins.reduce((s, p) => s + p.lat, 0) / pins.length,
          pins.reduce((s, p) => s + p.lng, 0) / pins.length,
        ]
      : [-7.250445, 112.768845]

  const routeCoords: [number, number][] = pins.map(p => [p.lat, p.lng])

  return (
    <div style={{ borderRadius: 'inherit', overflow: 'hidden', height, width: '100%', position: 'relative' }}>
      <style>{`
        /* Cluster overrides */
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large { background: transparent !important; }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div { background: transparent !important; }

        /* Popup overrides */
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .custom-popup .leaflet-popup-content { margin: 0; width: auto !important; }
        .custom-popup .leaflet-popup-tip-container { display: none; }

        /* Live event pulse */
        .leaflet-live-marker { animation: pulseLive 1.5s infinite; }
        @keyframes pulseLive {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
          100% { transform: scale(1); filter: brightness(1); }
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
        preferCanvas={true}
      >
        {/* CartoDB Positron Light — smaller tiles, faster load, clean design */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          subdomains="abcd"
        />

        <LocateControl onLocationFound={onLocationFound} />

        {/* Radius Circle */}
        {radiusMode?.active && (
          <Circle
            center={[radiusMode.centerLat, radiusMode.centerLng]}
            radius={radiusMode.radiusKm * 1000}
            pathOptions={{ color: '#0A4A5E', fillColor: '#0A4A5E', fillOpacity: 0.08, weight: 2, dashArray: '5, 5' }}
          />
        )}

        {/* Route polyline for itinerary view */}
        {showRoute && pins.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#0A4A5E', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
          />
        )}

        {/* Clustered markers */}
        <MarkerClusterLayer pins={pins} showRoute={showRoute} />
      </MapContainer>
    </div>
  )
}
