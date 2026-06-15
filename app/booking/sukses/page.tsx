'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CheckCircle, Download, Share2, MapPin, Calendar, Ticket, Loader } from 'lucide-react'

const PAYMENT_LABELS: Record<string, string> = {
  transfer_bca: 'Transfer BCA',
  transfer_mandiri: 'Transfer Mandiri',
  transfer_bri: 'Transfer BRI',
  gopay: 'GoPay',
  ovo: 'OVO',
  qris: 'QRIS',
  visa: 'Kartu Kredit/Debit',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const [confetti, setConfetti] = useState(false)

  const code = searchParams.get('code') || ''
  const name = searchParams.get('name') || ''
  const date = searchParams.get('date') || ''
  const count = searchParams.get('count') || '1'
  const total = searchParams.get('total') || '0'
  const payment = searchParams.get('payment') || ''
  const status = searchParams.get('status') || 'success'

  const isPending = status === 'pending'

  useEffect(() => {
    if (!isPending) {
      setConfetti(true)
      const t = setTimeout(() => setConfetti(false), 4000)
      return () => clearTimeout(t)
    }
  }, [isPending])

  // Simple QR code visual using the booking code
  const qrSegments = code.split('').map(c => c.charCodeAt(0))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Confetti overlay */}
      {confetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
          {Array.from({ length: 40 }).map((_, i) => (
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

      {/* Hero banner */}
      <div style={{ background: isPending ? 'linear-gradient(135deg, #0A4A5E 0%, #0D6E84 100%)' : 'linear-gradient(135deg, #022B1E 0%, #065F46 60%, #10B981 100%)', padding: '3rem 1.5rem', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'popIn 0.5s ease-out' }}>
            {isPending ? <Loader size={42} color="#93C5FD" style={{ animation: 'spin 2s linear infinite' }} /> : <CheckCircle size={42} color="#6EE7B7" />}
          </div>
          <div style={{ display: 'inline-block', background: isPending ? 'rgba(147,197,253,0.2)' : 'rgba(110,231,183,0.2)', border: isPending ? '1px solid rgba(147,197,253,0.4)' : '1px solid rgba(110,231,183,0.4)', borderRadius: '50px', padding: '5px 16px', fontSize: '0.78rem', fontWeight: 700, color: isPending ? '#93C5FD' : '#6EE7B7', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            {isPending ? '⏳ MENUNGGU PEMBAYARAN' : '✅ PEMBAYARAN BERHASIL'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            {isPending ? 'Selesaikan Pembayaran Anda' : <>Yeay! Tiket Kamu<br />Sudah Dikonfirmasi 🎉</>}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {isPending ? 'Silakan selesaikan pembayaran melalui metode yang Anda pilih. Status tiket akan otomatis terkonfirmasi setelah pembayaran berhasil.' : 'Simpan kode booking di bawah sebagai bukti pemesanan. Tunjukkan kepada petugas saat tiba di lokasi.'}
          </p>
        </div>
      </div>

      {/* Booking card */}
      <div style={{ maxWidth: '520px', margin: '-1.5rem auto 2rem', padding: '0 1.5rem', width: '100%' }}>

        {/* Main ticket card */}
        <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(10,74,94,0.15)', border: '1px solid #E5E9F0', position: 'relative', zIndex: 10 }}>
          {/* Ticket top */}
          <div style={{ background: 'linear-gradient(135deg, #0A4A5E, #0D6E84)', padding: '1.5rem', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>MLAKOOW E-TICKET</div>
                <h2 style={{ fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>{name}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>KODE BOOKING</div>
                <div style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '2px', color: '#FF8C5E', fontFamily: 'monospace' }}>{code}</div>
              </div>
            </div>
          </div>

          {/* Perforated separator */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg)', position: 'absolute', left: '-10px', border: '1px solid #E5E9F0' }} />
            <div style={{ flex: 1, borderTop: '2px dashed #E5E9F0', margin: '0 20px' }} />
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg)', position: 'absolute', right: '-10px', border: '1px solid #E5E9F0' }} />
          </div>

          {/* Ticket details */}
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={11} /> TANGGAL KUNJUNGAN
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{date ? formatDate(date) : '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Ticket size={11} /> JUMLAH TIKET
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{count} Orang</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>METODE BAYAR</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1A2332' }}>{PAYMENT_LABELS[payment] || payment}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8B98A9', fontWeight: 600, marginBottom: '4px' }}>TOTAL BAYAR</div>
                <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0A4A5E' }}>
                  {parseInt(total) === 0 ? 'GRATIS' : `Rp ${parseInt(total).toLocaleString('id-ID')}`}
                </div>
              </div>
            </div>

            {/* QR Code visual */}
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: '80px', height: '80px', background: '#1A2332', borderRadius: '10px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '1px', padding: '6px' }}>
                  {Array.from({ length: 64 }).map((_, i) => {
                    const seed = (qrSegments[i % qrSegments.length] + i * 7) % 3
                    return (
                      <div
                        key={i}
                        style={{ borderRadius: '1px', background: seed === 0 ? 'white' : (i < 16 || i > 47 || (i % 8 < 3 && i % 8 !== 0)) ? 'white' : 'transparent' }}
                      />
                    )
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1A2332', marginBottom: '4px' }}>Tunjukkan QR ini</div>
                <div style={{ fontSize: '0.72rem', color: '#8B98A9', lineHeight: 1.5 }}>
                  Scan QR code ini atau tunjukkan kode booking <strong style={{ fontFamily: 'monospace', color: '#0A4A5E' }}>{code}</strong> kepada petugas.
                </div>
              </div>
            </div>

            {/* Status badge */}
            {!isPending && (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10B981" />
                <span style={{ fontSize: '0.825rem', color: '#047857', fontWeight: 600 }}>Tiket dikonfirmasi & siap digunakan</span>
              </div>
            )}
            
            {isPending && (
               <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader size={16} color="#D97706" style={{ animation: 'spin 2s linear infinite' }} />
                <span style={{ fontSize: '0.825rem', color: '#D97706', fontWeight: 600 }}>Menunggu konfirmasi pembayaran otomatis</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Link
            href="/profil"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '0.875rem' }}
          >
            Lihat Riwayat Booking Saya
          </Link>
          <Link
            href="/destinasi"
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '0.875rem' }}
          >
            <MapPin size={16} /> Jelajahi Destinasi Lain
          </Link>
        </div>

        {/* Tips card */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '1.25rem 1.5rem', marginTop: '1.25rem', border: '1px solid #E5E9F0' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1A2332', marginBottom: '0.75rem' }}>💡 Tips Sebelum Berkunjung</h3>
          <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: '#4A5568', fontSize: '0.825rem', lineHeight: 1.7 }}>
            <li>Datang 15-30 menit sebelum jam buka untuk menghindari antrian</li>
            <li>Simpan screenshot tiket ini sebagai backup offline</li>
            <li>Cek cuaca Surabaya di hari kunjungan Anda</li>
            <li>Bawa botol minum dan sunscreen terutama untuk destinasi outdoor</li>
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

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader size={40} style={{ color: '#0A4A5E' }} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
