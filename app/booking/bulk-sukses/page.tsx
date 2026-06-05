'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, MapPin, Calendar, Ticket, Loader, ArrowRight } from 'lucide-react'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

interface BulkBookingResult {
  bookingCode: string
  destinationName: string
  visitDate: string
  ticketCount: number
  ticketPrice: number
  totalPrice: number
}

function BulkSuccessContent() {
  const searchParams = useSearchParams()
  const [confetti, setConfetti] = useState(false)

  // Read from URL: data is JSON-encoded
  const dataParam = searchParams.get('data')
  const results: BulkBookingResult[] = dataParam ? JSON.parse(decodeURIComponent(dataParam)) : []
  const grandTotal = results.reduce((s, r) => s + r.totalPrice, 0)
  const itineraryId = searchParams.get('itineraryId') || ''

  useEffect(() => {
    setConfetti(true)
    const t = setTimeout(() => setConfetti(false), 4000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Confetti */}
      {confetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-20px',
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                background: ['#FF6B35', '#0A4A5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 6)],
                animation: `fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #022B1E 0%, #065F46 60%, #10B981 100%)', padding: '3rem 1.5rem', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'popIn 0.5s ease-out' }}>
            <CheckCircle size={42} color="#6EE7B7" />
          </div>
          <div style={{ display: 'inline-block', background: 'rgba(110,231,183,0.2)', border: '1px solid rgba(110,231,183,0.4)', borderRadius: '50px', padding: '5px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            ✅ {results.length} TIKET BERHASIL DIPESAN
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Semua Tiket Trip Kamu<br />Sudah Dikonfirmasi! 🎉
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Tunjukkan kode booking kepada petugas saat tiba di masing-masing lokasi.
          </p>
        </div>
      </div>

      {/* Booking cards */}
      <div style={{ maxWidth: '560px', margin: '-1.5rem auto 2rem', padding: '0 1.5rem', width: '100%' }}>

        {/* Summary card */}
        <div style={{
          background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)',
          borderRadius: '20px', padding: '1.5rem', color: 'white',
          marginBottom: '1rem', position: 'relative', zIndex: 10,
          boxShadow: '0 12px 40px rgba(10,74,94,0.25)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '4px' }}>TOTAL PEMBAYARAN</div>
              <div style={{ fontWeight: 900, fontSize: '1.6rem' }}>Rp {grandTotal.toLocaleString('id-ID')}</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '1.4rem' }}>{results.length}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>Tiket</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: '1.4rem' }}>{results[0]?.ticketCount || 1}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>Orang</div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual ticket cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {results.map((booking, idx) => {
            const qrSegments = booking.bookingCode.split('').map(c => c.charCodeAt(0))
            return (
              <div key={idx} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #E5E9F0', boxShadow: '0 4px 16px rgba(10,74,94,0.06)' }}>
                {/* Ticket header */}
                <div style={{ background: 'linear-gradient(135deg, #F0F7FA, #E8F4F8)', padding: '0.875rem 1.25rem', borderBottom: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600, letterSpacing: '0.05em' }}>E-TICKET #{idx + 1}</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A2332' }}>{booking.destinationName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', color: '#8B98A9', marginBottom: '2px' }}>KODE</div>
                    <div style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '1.5px', color: '#FF6B35', fontFamily: 'monospace' }}>{booking.bookingCode}</div>
                  </div>
                </div>

                {/* Ticket details */}
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={10} /> TANGGAL
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2332' }}>{formatDate(booking.visitDate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Ticket size={10} /> TIKET
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1A2332' }}>{booking.ticketCount} orang</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#8B98A9', fontWeight: 600, marginBottom: '2px' }}>HARGA</div>
                      <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0A4A5E' }}>Rp {booking.totalPrice.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                  {/* Mini QR */}
                  <div style={{ width: '48px', height: '48px', background: '#1A2332', borderRadius: '8px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px', padding: '4px', flexShrink: 0 }}>
                    {Array.from({ length: 36 }).map((_, i) => {
                      const seed = (qrSegments[i % qrSegments.length] + i * 7) % 3
                      return (
                        <div
                          key={i}
                          style={{ borderRadius: '0.5px', background: seed === 0 ? 'white' : (i < 12 || i > 23) ? 'white' : 'transparent' }}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Status */}
                <div style={{ padding: '0 1.25rem 0.875rem' }}>
                  <div style={{ padding: '0.5rem 0.75rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={13} color="#10B981" />
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>Dikonfirmasi</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {itineraryId && (
            <Link
              href={`/itinerary/${itineraryId}`}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '0.875rem' }}
            >
              <MapPin size={16} /> Lihat Itinerary <ArrowRight size={16} />
            </Link>
          )}
          <Link
            href="/profil"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '0.875rem' }}
          >
            Lihat Riwayat Booking
          </Link>
        </div>

        {/* Tips */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem 1.5rem', marginTop: '1.25rem', border: '1px solid #E5E9F0' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332', marginBottom: '0.75rem' }}>💡 Tips Perjalanan</h3>
          <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: '#4A5568', fontSize: '0.825rem', lineHeight: 1.7 }}>
            <li>Screenshot semua kode booking sebagai backup offline</li>
            <li>Datang 15–30 menit sebelum jam buka untuk menghindari antrian</li>
            <li>Cek cuaca Surabaya di hari kunjungan Anda</li>
            <li>Bawa botol minum dan sunscreen untuk destinasi outdoor</li>
          </ul>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function BulkBookingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={40} style={{ color: '#0A4A5E' }} />
      </div>
    }>
      <BulkSuccessContent />
    </Suspense>
  )
}
