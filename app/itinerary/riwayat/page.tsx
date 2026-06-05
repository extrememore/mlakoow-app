'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  BookOpen,
  MapPin,
  Calendar,
  Wallet,
  ArrowRight,
  Plus,
  Loader,
  Clock,
  Zap,
} from 'lucide-react'

interface ItinerarySummary {
  id: number
  title: string
  duration: number
  area: string
  budget: number
  totalEstimatedCost: number
  createdAt: string
  items: {
    id: number
    destination: {
      name: string
      category: { icon: string; name: string }
    }
  }[]
}

export default function RiwayatItineraryPage() {
  const router = useRouter()
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/itineraries')
      .then((res) => {
        if (res.status === 401) { router.push('/login'); return null }
        return res.json()
      })
      .then((data) => {
        if (data) setItineraries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #062E3A 0%, #0A4A5E 50%, #0D6E84 100%)', padding: '3rem 1.5rem', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '50px', padding: '6px 16px', marginBottom: '1.25rem', color: '#FF8C5E', fontWeight: 600, fontSize: '0.82rem' }}>
            <BookOpen size={14} /> RIWAYAT ITINERARY
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.75rem' }}>
            Itinerary Saya
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: '500px' }}>
            Semua rencana perjalanan wisata Surabaya yang sudah kamu buat
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1.5rem', width: '100%', flex: 1 }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#8B98A9' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p>Memuat itinerary...</p>
          </div>
        ) : itineraries.length === 0 ? (
          /* Empty state */
          <div style={{ background: 'white', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #E5E9F0', boxShadow: '0 8px 30px rgba(10,74,94,0.05)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.25rem' }}>🗺️</div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', color: '#1A2332', marginBottom: '0.75rem' }}>
              Belum Ada Itinerary
            </h2>
            <p style={{ color: '#8B98A9', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '380px', margin: '0 auto 2rem' }}>
              Kamu belum membuat rencana perjalanan apapun. Yuk buat itinerary pertamamu sekarang!
            </p>
            <Link href="/itinerary" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              <Zap size={18} /> Buat Itinerary Sekarang
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tombol buat baru di atas */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <p style={{ color: '#4A5568', fontSize: '0.9rem' }}>
                <strong style={{ color: '#1A2332' }}>{itineraries.length}</strong> itinerary ditemukan
              </p>
              <Link href="/itinerary" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                <Plus size={16} /> Buat Baru
              </Link>
            </div>

            {/* Daftar itinerary */}
            {itineraries.map((itin) => {
              const totalTransport = itin.items.length * 25000
              const totalFood = itin.duration * 50000
              const grandTotal = itin.totalEstimatedCost + totalTransport + totalFood

              return (
                <Link key={itin.id} href={`/itinerary/${itin.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="itin-card"
                    style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      border: '1px solid #E5E9F0',
                      boxShadow: '0 4px 16px rgba(10,74,94,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1A2332', marginBottom: '0.5rem' }}>
                          {itin.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#8B98A9', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {itin.duration} hari
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {itin.area}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {new Date(itin.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#0A4A5E' }}>
                          Rp {(grandTotal / 1000).toFixed(0)}K
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8B98A9' }}>total estimasi</div>
                      </div>
                    </div>

                    {/* Destination badges */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {itin.items.slice(0, 5).map((item) => (
                        <span
                          key={item.id}
                          className="badge"
                          style={{ background: '#E0F2FE', color: '#0A4A5E', fontSize: '0.72rem' }}
                        >
                          {item.destination.category.icon} {item.destination.name}
                        </span>
                      ))}
                      {itin.items.length > 5 && (
                        <span className="badge" style={{ background: '#F0F4F8', color: '#8B98A9', fontSize: '0.72rem' }}>
                          +{itin.items.length - 5} lainnya
                        </span>
                      )}
                    </div>

                    {/* Footer row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid #F0F4F8' }}>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem' }}>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>
                          {itin.items.length} destinasi
                        </span>
                        <span style={{ color: '#8B98A9', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Wallet size={12} /> Est. tiket: Rp {itin.totalEstimatedCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF6B35', fontWeight: 700, fontSize: '0.85rem' }}>
                        Lihat Detail <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .itin-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(10,74,94,0.12) !important;
          border-color: #BAE6FD !important;
        }
      `}</style>
    </div>
  )
}
